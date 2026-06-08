import type { PrismaClient } from "@prisma/client";

import { getProjectFilesMap } from "@/server/studio/store";

/** Simple tar-less zip via store format (JSON bundle) for MVP export. */
export async function exportProjectBundle(
  prisma: PrismaClient,
  projectId: string,
): Promise<{ displayName: string; slug: string; files: Record<string, string> } | null> {
  const project = await prisma.studioProject.findUnique({
    where: { id: projectId },
    select: { displayName: true, slug: true },
  });
  if (!project) return null;

  const files = await getProjectFilesMap(prisma, projectId);
  return { displayName: project.displayName, slug: project.slug, files };
}
