import type { Prisma, PrismaClient } from "@prisma/client";

import { ensureDefaultTasks } from "@/server/points/tasks";
import { ensureWalletAndMember } from "@/server/platform/member";
import { creditPointsIdempotent } from "@/server/points/credit-idempotent";

export const MERCH_HOLDER_CLAIM_TASK_SLUG = "merch-holder-claim";

export type MerchHolderClaimCreditResult = {
  ok: boolean;
  pointsGranted: number;
  alreadyCredited: boolean;
  error?: string;
};

export async function creditMerchHolderClaim(
  prisma: Prisma.TransactionClient | PrismaClient,
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

  const credit = await creditPointsIdempotent(prisma, {
    walletId: wallet.id,
    delta: task.points,
    reason: "task_completion",
    taskSlug: MERCH_HOLDER_CLAIM_TASK_SLUG,
    idempotencyKey: `merch-claim:${input.orderId}`,
    metadata: { orderId: input.orderId },
  });

  if (credit.credited) {
    const { logTaskCompletionActivity } = await import("@/server/points/task-completion-events");
    await logTaskCompletionActivity(prisma, {
      memberId: input.memberId ?? undefined,
      taskSlug: MERCH_HOLDER_CLAIM_TASK_SLUG,
    });
  }

  return {
    ok: true,
    pointsGranted: credit.credited ? credit.pointsGranted : 0,
    alreadyCredited: credit.alreadyCredited,
  };
}
