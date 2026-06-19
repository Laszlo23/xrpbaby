import type { PrismaClient } from "@prisma/client";

import { ensureDefaultTasks } from "@/server/points/tasks";
import { ensureWalletAndMember } from "@/server/platform/member";

export const MERCH_HOLDER_CLAIM_TASK_SLUG = "merch-holder-claim";

export type MerchHolderClaimCreditResult = {
  ok: boolean;
  pointsGranted: number;
  alreadyCredited: boolean;
  error?: string;
};

export async function creditMerchHolderClaim(
  prisma: PrismaClient,
  input: { evmAddress: string; orderId: string; memberId?: string | null },
): Promise<MerchHolderClaimCreditResult> {
  await ensureDefaultTasks(prisma);

  const task = await prisma.taskDefinition.findUnique({
    where: { slug: MERCH_HOLDER_CLAIM_TASK_SLUG },
  });
  if (!task?.active) {
    return { ok: false, pointsGranted: 0, alreadyCredited: false, error: "task_inactive" };
  }

  const { wallet } = await ensureWalletAndMember(prisma, input.evmAddress);
  const existing = await prisma.pointLedger.findFirst({
    where: {
      walletId: wallet.id,
      taskSlug: MERCH_HOLDER_CLAIM_TASK_SLUG,
      metadata: { path: ["orderId"], equals: input.orderId },
    },
  });
  if (existing) {
    return { ok: true, pointsGranted: 0, alreadyCredited: true };
  }

  await prisma.pointLedger.create({
    data: {
      walletId: wallet.id,
      delta: task.points,
      reason: "task_completion",
      taskSlug: MERCH_HOLDER_CLAIM_TASK_SLUG,
      metadata: { orderId: input.orderId },
    },
  });

  const { logTaskCompletionActivity } = await import("@/server/points/task-completion-events");
  await logTaskCompletionActivity(prisma, {
    memberId: input.memberId ?? undefined,
    taskSlug: MERCH_HOLDER_CLAIM_TASK_SLUG,
  });

  return { ok: true, pointsGranted: task.points, alreadyCredited: false };
}
