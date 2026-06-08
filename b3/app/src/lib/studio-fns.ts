import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const walletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  authorization: z.string().optional(),
});

const createProjectSchema = walletSchema.extend({
  displayName: z.string().min(1).max(80),
  framework: z.string().max(32).optional(),
});

const projectIdSchema = walletSchema.extend({
  projectId: z.string().min(1),
});

const generateSchema = projectIdSchema.extend({
  message: z.string().min(1).max(8000),
});

async function studioContext(data: { walletAddress: string; authorization?: string }) {
  const { getPrisma } = await import("@/server/db/prisma");
  const prisma = getPrisma();
  if (!prisma) return { error: "no_database" as const };

  const { resolveStudioAuth } = await import("@/server/studio/auth");
  const auth = await resolveStudioAuth(prisma, data.authorization ?? null, data.walletAddress);
  if ("error" in auth) return { error: auth.error, status: auth.status };

  const { memberCanAccessStudio, studioAccessDeniedReason } =
    await import("@/server/studio/gating");
  if (!memberCanAccessStudio(auth.member)) {
    return { error: studioAccessDeniedReason(auth.member), status: 403 };
  }

  return { prisma, ...auth };
}

export const postStudioListProjects = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => walletSchema.parse(raw))
  .handler(async ({ data }) => {
    const ctx = await studioContext(data);
    if ("error" in ctx && !("prisma" in ctx)) {
      return { ok: false as const, error: ctx.error };
    }
    if (!("prisma" in ctx)) return { ok: false as const, error: "auth_failed" };

    const { listStudioProjects } = await import("@/server/studio/store");
    const projects = await listStudioProjects(ctx.prisma, ctx.member.id);
    const { countGenerationsToday } = await import("@/server/studio/credits");
    const { STUDIO_FREE_GENERATIONS_PER_DAY } = await import("@/server/studio/config");
    const usedToday = await countGenerationsToday(ctx.prisma, ctx.member.id);

    return {
      ok: true as const,
      projects,
      quota: { usedToday, freePerDay: STUDIO_FREE_GENERATIONS_PER_DAY },
    };
  });

export const postStudioCreateProject = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => createProjectSchema.parse(raw))
  .handler(async ({ data }) => {
    const ctx = await studioContext(data);
    if (!("prisma" in ctx))
      return { ok: false as const, error: "error" in ctx ? ctx.error : "auth_failed" };

    try {
      const { createStudioProject } = await import("@/server/studio/store");
      const { ensureDefaultTasks } = await import("@/server/points/tasks");
      await ensureDefaultTasks(ctx.prisma);

      const project = await createStudioProject(
        ctx.prisma,
        ctx.member.id,
        data.displayName,
        data.framework ?? "vite-react",
      );

      const existing = await ctx.prisma.pointLedger.findFirst({
        where: { walletId: ctx.walletId, taskSlug: "studio-first-app", reason: "task_completion" },
      });
      if (!existing) {
        const task = await ctx.prisma.taskDefinition.findUnique({
          where: { slug: "studio-first-app" },
        });
        if (task?.active && task.points > 0) {
          await ctx.prisma.pointLedger.create({
            data: {
              walletId: ctx.walletId,
              delta: task.points,
              reason: "task_completion",
              taskSlug: "studio-first-app",
            },
          });
        }
      }

      return {
        ok: true as const,
        project: { id: project.id, slug: project.slug, displayName: project.displayName },
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "project_limit") {
        return { ok: false as const, error: "project_limit" };
      }
      if (msg.includes("StudioProject") || msg.includes("does not exist")) {
        return { ok: false as const, error: "no_database" };
      }
      console.error("postStudioCreateProject:", e);
      return { ok: false as const, error: "create_failed" };
    }
  });

export const postStudioGetProject = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => projectIdSchema.parse(raw))
  .handler(async ({ data }) => {
    const ctx = await studioContext(data);
    if (!("prisma" in ctx))
      return { ok: false as const, error: "error" in ctx ? ctx.error : "auth_failed" };

    const { getStudioProject } = await import("@/server/studio/store");
    const project = await getStudioProject(ctx.prisma, ctx.member.id, data.projectId);
    if (!project) return { ok: false as const, error: "not_found" };

    return { ok: true as const, project };
  });

export const postStudioStartSandbox = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => projectIdSchema.parse(raw))
  .handler(async ({ data }) => {
    const ctx = await studioContext(data);
    if (!("prisma" in ctx))
      return { ok: false as const, error: "error" in ctx ? ctx.error : "auth_failed" };

    const project = await ctx.prisma.studioProject.findFirst({
      where: { id: data.projectId, memberId: ctx.member.id },
    });
    if (!project) return { ok: false as const, error: "not_found" };

    const { isSandboxConfigured, createSandbox, syncSandboxFiles } =
      await import("@/server/studio/sandbox-client");
    const { getProjectFilesMap } = await import("@/server/studio/store");

    if (!isSandboxConfigured()) {
      return { ok: false as const, error: "sandbox_not_configured" };
    }

    if (project.sandboxContainerId && project.previewUrl) {
      return {
        ok: true as const,
        previewUrl: project.previewUrl,
        sandboxId: project.sandboxContainerId,
      };
    }

    const created = await createSandbox(project.id);
    if ("error" in created) return { ok: false as const, error: created.error };

    const files = await getProjectFilesMap(ctx.prisma, project.id);
    await syncSandboxFiles(created.sandboxId, files);

    await ctx.prisma.studioProject.update({
      where: { id: project.id },
      data: {
        sandboxContainerId: created.sandboxId,
        sandboxPort: created.port,
        previewUrl: created.previewUrl,
        status: "preview",
      },
    });

    return {
      ok: true as const,
      previewUrl: created.previewUrl,
      sandboxId: created.sandboxId,
    };
  });

export const postStudioGenerate = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => generateSchema.parse(raw))
  .handler(async ({ data }) => {
    const ctx = await studioContext(data);
    if (!("prisma" in ctx))
      return { ok: false as const, error: "error" in ctx ? ctx.error : "auth_failed" };

    const project = await ctx.prisma.studioProject.findFirst({
      where: { id: data.projectId, memberId: ctx.member.id },
    });
    if (!project) return { ok: false as const, error: "not_found" };

    const { checkGenerationCredits, recordGenerationUsage } =
      await import("@/server/studio/credits");
    const credit = await checkGenerationCredits(ctx.prisma, ctx.member.id, ctx.walletId);
    if (!credit.ok) {
      return {
        ok: false as const,
        error: credit.error,
        balance: credit.balance,
        needed: credit.needed,
      };
    }

    const { runStudioAgent } = await import("@/server/studio/agent");
    const result = await runStudioAgent(
      ctx.prisma,
      project.id,
      data.message,
      project.sandboxContainerId,
    );

    await recordGenerationUsage(ctx.prisma, {
      memberId: ctx.member.id,
      walletId: ctx.walletId,
      projectId: project.id,
      pointCost: credit.pointCost,
      free: credit.free,
    });

    const existingDaily = await ctx.prisma.pointLedger.findFirst({
      where: {
        walletId: ctx.walletId,
        taskSlug: "daily-studio-build",
        reason: "task_completion",
        createdAt: { gte: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z") },
      },
    });
    if (!existingDaily) {
      const { ensureDefaultTasks } = await import("@/server/points/tasks");
      await ensureDefaultTasks(ctx.prisma);
      const task = await ctx.prisma.taskDefinition.findUnique({
        where: { slug: "daily-studio-build" },
      });
      if (task?.active && task.points > 0) {
        await ctx.prisma.pointLedger.create({
          data: {
            walletId: ctx.walletId,
            delta: task.points,
            reason: "task_completion",
            taskSlug: "daily-studio-build",
          },
        });
      }
    }

    const { getStudioProject } = await import("@/server/studio/store");
    const updated = await getStudioProject(ctx.prisma, ctx.member.id, project.id);

    return { ok: true as const, result, project: updated };
  });

export const postStudioExport = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => projectIdSchema.parse(raw))
  .handler(async ({ data }) => {
    const ctx = await studioContext(data);
    if (!("prisma" in ctx))
      return { ok: false as const, error: "error" in ctx ? ctx.error : "auth_failed" };

    const { exportProjectBundle } = await import("@/server/studio/export");
    const bundle = await exportProjectBundle(ctx.prisma, data.projectId);
    if (!bundle) return { ok: false as const, error: "not_found" };

    return { ok: true as const, bundle };
  });

export const postStudioPublish = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => projectIdSchema.parse(raw))
  .handler(async ({ data }) => {
    const ctx = await studioContext(data);
    if (!("prisma" in ctx))
      return { ok: false as const, error: "error" in ctx ? ctx.error : "auth_failed" };

    const project = await ctx.prisma.studioProject.findFirst({
      where: { id: data.projectId, memberId: ctx.member.id },
    });
    if (!project) return { ok: false as const, error: "not_found" };

    const { publishStudioProject } = await import("@/server/studio/publish");
    const result = await publishStudioProject(ctx.prisma, project);
    if (!result.ok) return { ok: false as const, error: result.error };

    return { ok: true as const, publishedUrl: result.publishedUrl };
  });
