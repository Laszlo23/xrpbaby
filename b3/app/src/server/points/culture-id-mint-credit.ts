import type { PrismaClient } from "@prisma/client";

import { culturePointsForTokenId } from "@/lib/identity/mint-ladder";
import { ensureWalletAndMember } from "@/server/platform/member";
import { recordCultureMemoryEvent } from "@/server/memory/timeline";
import { ensureDefaultTasks } from "@/server/points/tasks";

export const MINT_CULTURE_ID_TASK_SLUG = "mint-culture-id";

export type CultureIdMintCreditResult = {
  ok: boolean;
  pointsGranted: number;
  alreadyCredited: boolean;
  error?: string;
};

export async function creditCultureIdMint(
  prisma: PrismaClient,
  input: {
    evmAddress: string;
    handle: string;
    tokenId: number;
  },
): Promise<CultureIdMintCreditResult> {
  await ensureDefaultTasks(prisma);

  const task = await prisma.taskDefinition.findUnique({
    where: { slug: MINT_CULTURE_ID_TASK_SLUG },
  });
  if (!task?.active) {
    return { ok: false, pointsGranted: 0, alreadyCredited: false, error: "task_inactive" };
  }

  const { wallet, member } = await ensureWalletAndMember(prisma, input.evmAddress);
  const existing = await prisma.pointLedger.findFirst({
    where: {
      walletId: wallet.id,
      taskSlug: MINT_CULTURE_ID_TASK_SLUG,
      reason: "task_completion",
    },
  });
  if (existing) {
    return { ok: true, pointsGranted: 0, alreadyCredited: true };
  }

  const points = culturePointsForTokenId(input.tokenId);

  await prisma.pointLedger.create({
    data: {
      walletId: wallet.id,
      delta: points,
      reason: "task_completion",
      taskSlug: MINT_CULTURE_ID_TASK_SLUG,
      metadata: {
        handle: input.handle,
        tokenId: input.tokenId,
      },
    },
  });

  const { logTaskCompletionActivity } = await import("@/server/points/task-completion-events");
  await logTaskCompletionActivity(prisma, {
    memberId: member?.id,
    taskSlug: MINT_CULTURE_ID_TASK_SLUG,
  });

  await recordCultureMemoryEvent({
    wallet: input.evmAddress.toLowerCase(),
    type: "culture_id_mint",
    payload: { handle: input.handle, tokenId: input.tokenId, points },
  });

  return { ok: true, pointsGranted: points, alreadyCredited: false };
}
