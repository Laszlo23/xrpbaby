import type { PrismaClient, StudioProject } from "@prisma/client";

import { createOsApiBase, createOsApiKey, STUDIO_DEPLOY_BCC_FEE } from "@/server/studio/config";
import { runSandboxCommand } from "@/server/studio/sandbox-client";

export type PublishResult =
  | { ok: true; publishedUrl: string; createOsProjectId?: string }
  | { ok: false; error: string };

export async function publishStudioProject(
  prisma: PrismaClient,
  project: StudioProject,
): Promise<PublishResult> {
  if (!project.sandboxContainerId) {
    return { ok: false, error: "sandbox_not_running" };
  }

  const build = await runSandboxCommand(project.sandboxContainerId, "npm run build");
  if (!build.ok) {
    return { ok: false, error: build.output || "build_failed" };
  }

  const apiBase = createOsApiBase();
  const apiKey = createOsApiKey();
  const subdomain = project.slug;
  const publishedUrl = `https://${subdomain}.buildingcultureid.space`;

  let createOsProjectId: string | undefined;

  if (apiBase && apiKey) {
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, "")}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          uniqueName: subdomain,
          displayName: project.displayName,
          type: "upload",
          description: `BC Studio community app — ${project.displayName}`,
          settings: {
            framework: "reactjs-spa",
            runtime: "node:20",
            buildCommand: "npm run build",
            buildDir: "dist",
            installCommand: "npm install",
            port: 80,
          },
          source: {},
        }),
      });

      if (res.ok) {
        const body = (await res.json()) as { id?: string };
        createOsProjectId = body.id;
      }
    } catch {
      // Fall through to nginx-only publish URL
    }
  }

  await prisma.studioProject.update({
    where: { id: project.id },
    data: {
      status: "live",
      publishedUrl,
      createOsProjectId: createOsProjectId ?? project.createOsProjectId,
    },
  });

  await prisma.studioUsage.create({
    data: {
      memberId: project.memberId,
      projectId: project.id,
      kind: "deploy",
      credits: STUDIO_DEPLOY_BCC_FEE,
      metadata: { publishedUrl, createOsProjectId },
    },
  });

  return { ok: true, publishedUrl, createOsProjectId };
}
