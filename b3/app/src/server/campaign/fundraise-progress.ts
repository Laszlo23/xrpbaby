import type { PrismaClient } from "@prisma/client";
import { HQ_FUNDRAISE_GOAL_USD, TRIPLE_333_TICKET_GOAL, packSlugsForCampaign } from "@/lib/packs";
import { hqProgressPercent } from "@/lib/campaign-fundraise";

export type HqFundraiseProgress = {
  ok: true;
  raisedUsd: number;
  raisedCents: number;
  goalUsd: number;
  percent: number;
  purchaseCount: number;
};

export type Triple333Progress = {
  ok: true;
  ticketsSold: number;
  ticketGoal: number;
  percent: number;
  purchaseCount: number;
};

export async function getHqFundraiseProgress(prisma: PrismaClient): Promise<HqFundraiseProgress> {
  const slugs = [...packSlugsForCampaign("hq")];
  const agg = await prisma.packPurchase.aggregate({
    where: { packSlug: { in: slugs } },
    _sum: { usdCents: true },
    _count: { id: true },
  });

  const raisedCents = agg._sum.usdCents ?? 0;
  const raisedUsd = raisedCents / 100;

  return {
    ok: true,
    raisedUsd,
    raisedCents,
    goalUsd: HQ_FUNDRAISE_GOAL_USD,
    percent: hqProgressPercent(raisedUsd),
    purchaseCount: agg._count.id,
  };
}

export async function getTriple333Progress(prisma: PrismaClient): Promise<Triple333Progress> {
  const slugs = [...packSlugsForCampaign("triple_333")];
  const agg = await prisma.packPurchase.aggregate({
    where: { packSlug: { in: slugs } },
    _count: { id: true },
  });

  const ticketsSold = Math.min(TRIPLE_333_TICKET_GOAL, agg._count.id);
  const percent = Math.min(100, Math.round((ticketsSold / TRIPLE_333_TICKET_GOAL) * 100));

  return {
    ok: true,
    ticketsSold,
    ticketGoal: TRIPLE_333_TICKET_GOAL,
    percent,
    purchaseCount: agg._count.id,
  };
}
