import type { PrismaClient } from "@prisma/client";

import { utcDayString } from "@/server/points/daily-checkin-credit";

const SHARE_TASK_SLUG = "daily-share-post";

export function shareStoryDayFromMetadata(metadata: unknown): string | undefined {
  const m = metadata as { dayUTC?: string } | null;
  return m?.dayUTC;
}

export function shareStoryProofFromMetadata(metadata: unknown): string | undefined {
  const m = metadata as { proofUrl?: string } | null;
  return m?.proofUrl?.trim().toLowerCase();
}

export async function walletShareStoryCreditedToday(
  prisma: PrismaClient,
  walletId: string,
  dayUTC = utcDayString(),
): Promise<boolean> {
  const prior = await prisma.pointLedger.findMany({
    where: { walletId, taskSlug: SHARE_TASK_SLUG },
    select: { metadata: true },
  });
  return prior.some((row) => shareStoryDayFromMetadata(row.metadata) === dayUTC);
}

export async function proofUrlAlreadyClaimed(
  prisma: PrismaClient,
  proofUrl: string,
): Promise<boolean> {
  const normalized = proofUrl.trim().toLowerCase().split("?")[0];
  const rows = await prisma.pointLedger.findMany({
    where: { taskSlug: SHARE_TASK_SLUG },
    select: { metadata: true },
  });
  return rows.some((row) => shareStoryProofFromMetadata(row.metadata) === normalized);
}

export { SHARE_TASK_SLUG };
