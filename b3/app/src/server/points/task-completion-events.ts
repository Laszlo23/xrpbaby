import type { PrismaClient } from "@prisma/client";

import { logActivity } from "@/server/platform/member";

/** Log task completion for quest UI and analytics. */
export async function logTaskCompletionActivity(
  prisma: PrismaClient,
  input: {
    memberId?: string;
    taskSlug: string;
    sourceModule?: string;
  },
): Promise<void> {
  await logActivity(prisma, {
    memberId: input.memberId,
    type: `task_completion:${input.taskSlug}`,
    sourceModule: input.sourceModule ?? "points",
    payload: { taskSlug: input.taskSlug },
  });
}
