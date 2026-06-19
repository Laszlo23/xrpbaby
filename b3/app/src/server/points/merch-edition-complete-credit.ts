import type { PrismaClient } from "@prisma/client";

import { ensureDefaultTasks } from "@/server/points/tasks";
import { ensureWalletAndMember } from "@/server/platform/member";

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
    const { wallet, member } = await ensureWalletAndMember(prisma, order.wallet);
    const existing = await prisma.pointLedger.findFirst({
      where: {
        walletId: wallet.id,
        taskSlug: MERCH_EDITION_COMPLETE_TASK_SLUG,
        metadata: { path: ["orderId"], equals: order.id },
      },
    });
    if (existing) continue;

    await prisma.pointLedger.create({
      data: {
        walletId: wallet.id,
        delta: task.points,
        reason: "task_completion",
        taskSlug: MERCH_EDITION_COMPLETE_TASK_SLUG,
        metadata: { orderId: order.id, dropSlug },
      },
    });

    await logTaskCompletionActivity(prisma, {
      memberId: member?.id,
      taskSlug: MERCH_EDITION_COMPLETE_TASK_SLUG,
    });
    credited++;
  }

  return { credited };
}
