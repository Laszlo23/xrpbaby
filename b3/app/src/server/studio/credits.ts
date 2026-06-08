import type { PrismaClient } from "@prisma/client";

import {
  STUDIO_FREE_GENERATIONS_PER_DAY,
  STUDIO_GENERATION_POINT_COST,
} from "@/server/studio/config";

function utcDayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export async function getMemberPointBalance(
  prisma: PrismaClient,
  walletId: string,
): Promise<number> {
  const agg = await prisma.pointLedger.aggregate({
    where: { walletId },
    _sum: { delta: true },
  });
  return agg._sum.delta ?? 0;
}

export async function countGenerationsToday(
  prisma: PrismaClient,
  memberId: string,
): Promise<number> {
  const dayStart = new Date(`${utcDayKey()}T00:00:00.000Z`);
  return prisma.studioUsage.count({
    where: {
      memberId,
      kind: "generation",
      createdAt: { gte: dayStart },
    },
  });
}

export type GenerationCreditCheck =
  | { ok: true; free: boolean; pointCost: number }
  | { ok: false; error: string; balance: number; needed: number };

export async function checkGenerationCredits(
  prisma: PrismaClient,
  memberId: string,
  walletId: string,
): Promise<GenerationCreditCheck> {
  const usedToday = await countGenerationsToday(prisma, memberId);
  if (usedToday < STUDIO_FREE_GENERATIONS_PER_DAY) {
    return { ok: true, free: true, pointCost: 0 };
  }

  const balance = await getMemberPointBalance(prisma, walletId);
  if (balance < STUDIO_GENERATION_POINT_COST) {
    return {
      ok: false,
      error: "insufficient_credits",
      balance,
      needed: STUDIO_GENERATION_POINT_COST,
    };
  }

  return { ok: true, free: false, pointCost: STUDIO_GENERATION_POINT_COST };
}

export async function recordGenerationUsage(
  prisma: PrismaClient,
  input: {
    memberId: string;
    walletId: string;
    projectId: string;
    pointCost: number;
    free: boolean;
  },
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.studioUsage.create({
      data: {
        memberId: input.memberId,
        projectId: input.projectId,
        kind: "generation",
        credits: input.free ? 0 : input.pointCost,
        metadata: { free: input.free },
      },
    });

    if (!input.free && input.pointCost > 0) {
      await tx.pointLedger.create({
        data: {
          walletId: input.walletId,
          delta: -input.pointCost,
          reason: "studio_generation",
          taskSlug: "studio-generation",
          metadata: { projectId: input.projectId },
        },
      });
    }
  });
}
