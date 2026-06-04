import type { PrismaClient } from "@prisma/client";
import { supportRewardMultiplier } from "@bc/support-score";

export async function resolveTargetSupportMultiplier(
  prisma: PrismaClient,
  targetFid: number | null,
): Promise<{ multiplier: number; targetSupportScore: number | null }> {
  if (targetFid == null) return { multiplier: 1, targetSupportScore: null };

  const target = await prisma.member.findFirst({
    where: { farcasterFid: targetFid },
    select: { neynarScore: true, supportScore: true },
  });

  if (!target) return { multiplier: 1, targetSupportScore: null };

  const minNeynar = Number.parseFloat(process.env.NEYNAR_SCORE_MIN ?? "0") || 0;
  const multiplier = supportRewardMultiplier({
    neynarScore: target.neynarScore,
    supportScore: target.supportScore,
    minNeynarScore: minNeynar > 0 ? minNeynar : 0.5,
  });

  return { multiplier, targetSupportScore: target.supportScore };
}

export function applyPointsMultiplier(basePoints: number, multiplier: number): number {
  if (multiplier <= 1) return basePoints;
  return Math.round(basePoints * multiplier);
}
