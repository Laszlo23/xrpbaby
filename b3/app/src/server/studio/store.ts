import type { PrismaClient, StudioProject } from "@prisma/client";

import { logActivity } from "@/server/platform/member";
import { getStarterFiles } from "@/server/studio/templates/vite-react";
import { slugifyStudioName, uniqueSlug } from "@/server/studio/slug";
import { STUDIO_MAX_PROJECTS_PER_MEMBER } from "@/server/studio/config";

export async function listStudioProjects(prisma: PrismaClient, memberId: string) {
  return prisma.studioProject.findMany({
    where: { memberId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      displayName: true,
      framework: true,
      status: true,
      previewUrl: true,
      publishedUrl: true,
      updatedAt: true,
      createdAt: true,
    },
  });
}

export async function getStudioProject(prisma: PrismaClient, memberId: string, projectId: string) {
  return prisma.studioProject.findFirst({
    where: { id: projectId, memberId },
    include: {
      files: { orderBy: { path: "asc" } },
      messages: { orderBy: { createdAt: "asc" }, take: 80 },
    },
  });
}

export async function createStudioProject(
  prisma: PrismaClient,
  memberId: string,
  displayName: string,
  framework = "vite-react",
): Promise<StudioProject> {
  const count = await prisma.studioProject.count({ where: { memberId } });
  if (count >= STUDIO_MAX_PROJECTS_PER_MEMBER) {
    throw new Error("project_limit");
  }

  const existing = await prisma.studioProject.findMany({
    where: { memberId },
    select: { slug: true },
  });
  const slug = uniqueSlug(
    slugifyStudioName(displayName),
    existing.map((p) => p.slug),
  );

  const starter = getStarterFiles(framework);
  const project = await prisma.studioProject.create({
    data: {
      memberId,
      slug,
      displayName: displayName.trim().slice(0, 80) || "Untitled app",
      framework,
      files: {
        create: Object.entries(starter).map(([path, content]) => ({ path, content })),
      },
      messages: {
        create: {
          role: "system",
          content: "Project created with vite-react starter template.",
        },
      },
    },
  });

  await logActivity(prisma, {
    memberId,
    type: "studio:project_created",
    sourceModule: "studio",
    payload: { projectId: project.id, slug: project.slug },
  });

  return project;
}

export async function upsertStudioFile(
  prisma: PrismaClient,
  projectId: string,
  path: string,
  content: string,
): Promise<void> {
  const normalized = path.replace(/^\/+/, "").replace(/\\/g, "/");
  if (!normalized || normalized.includes("..")) {
    throw new Error("invalid_path");
  }

  const existing = await prisma.studioFile.findUnique({
    where: { projectId_path: { projectId, path: normalized } },
  });

  if (existing) {
    await prisma.studioFile.update({
      where: { id: existing.id },
      data: { content, revision: existing.revision + 1 },
    });
  } else {
    await prisma.studioFile.create({
      data: { projectId, path: normalized, content },
    });
  }

  await prisma.studioProject.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });
}

export async function deleteStudioFile(
  prisma: PrismaClient,
  projectId: string,
  path: string,
): Promise<boolean> {
  const normalized = path.replace(/^\/+/, "").replace(/\\/g, "/");
  const result = await prisma.studioFile.deleteMany({
    where: { projectId, path: normalized },
  });
  return result.count > 0;
}

export async function listStudioFilePaths(
  prisma: PrismaClient,
  projectId: string,
): Promise<string[]> {
  const rows = await prisma.studioFile.findMany({
    where: { projectId },
    select: { path: true },
    orderBy: { path: "asc" },
  });
  return rows.map((r) => r.path);
}

export async function readStudioFile(
  prisma: PrismaClient,
  projectId: string,
  path: string,
): Promise<string | null> {
  const normalized = path.replace(/^\/+/, "").replace(/\\/g, "/");
  const row = await prisma.studioFile.findUnique({
    where: { projectId_path: { projectId, path: normalized } },
  });
  return row?.content ?? null;
}

export async function appendStudioMessage(
  prisma: PrismaClient,
  projectId: string,
  role: string,
  content: string,
  toolCalls?: unknown,
): Promise<void> {
  await prisma.studioMessage.create({
    data: {
      projectId,
      role,
      content,
      toolCalls: toolCalls ? (toolCalls as object) : undefined,
    },
  });
}

export async function getProjectFilesMap(
  prisma: PrismaClient,
  projectId: string,
): Promise<Record<string, string>> {
  const files = await prisma.studioFile.findMany({ where: { projectId } });
  return Object.fromEntries(files.map((f) => [f.path, f.content]));
}
