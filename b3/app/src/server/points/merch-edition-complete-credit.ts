import type { PrismaClient } from "@prisma/client";

import { ensureDefaultTasks } from "@/server/points/tasks";
import { ensureWalletAndMember } from "@/server/platform/member";
import { creditPointsIdempotent } from "@/server/points/credit-idempotent";

export const MERCH_EDITION_COMPLETE_TASK_SLUG = "merch-edition-complete";

export async function creditMerchEditionCompleteForDrop(prisma: PrismaClient, dropSlug: string) {
  await ensureDefaultTasks(prisma);

  const task = await prisma.taskDefinition.findUnique({
    where: { slug: MERCH_EDITION_COMPLETE_TASK_SLUG },
  });
  if (!task?.active) return { credited: 0 };

  const orders = await prisma.merchOrder.findMany({
    where: { dropSlug, status: { in: ["paid", "claimed"] } },
    select: { id: true, wallet: true },
  });

  const { logTaskCompletionActivity } = await import("@/server/points/task-completion-events");
  let credited = 0;

  for (const order of orders) {
    const result = await prisma.$transaction(async (tx) => {
      const { wallet, member } = await ensureWalletAndMember(tx, order.wallet);

      return creditPointsIdempotent(tx, {
        walletId: wallet.id,
        delta: task.points,
        reason: "task_completion",
        taskSlug: MERCH_EDITION_COMPLETE_TASK_SLUG,
        idempotencyKey: `merch-edition:${order.id}`,
        metadata: { orderId: order.id, dropSlug },
      }).then(async (credit) => {
        if (credit.credited) {
          await logTaskCompletionActivity(tx, {
            memberId: member?.id,
            taskSlug: MERCH_EDITION_COMPLETE_TASK_SLUG,
          });
        }
        return credit;
      });
    });

    if (result.credited) credited++;
  }

  return { credited };
}
