import { getPrisma } from "@/server/db/prisma";
import { OnChainDealState, serviceDealConfig } from "./config";
import { readOnChainDeal, settleDealOnChain } from "./onchain";

export async function settleEligiblePartnerDeals() {
  const cfg = serviceDealConfig();
  if (!cfg) return { ok: false as const, error: "escrow_not_configured" };

  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const candidates = await prisma.partnerDeal.findMany({
    where: {
      status: { in: ["ruled", "overridden"] },
      onChainDealId: { not: null },
      settleTxHash: null,
    },
    take: 25,
  });

  const settled: { dealId: string; txHash: string }[] = [];
  const skipped: { dealId: string; reason: string }[] = [];

  for (const deal of candidates) {
    if (!deal.onChainDealId) continue;
    const onChain = await readOnChainDeal(BigInt(deal.onChainDealId));
    if (!onChain) {
      skipped.push({ dealId: deal.id, reason: "on_chain_read_failed" });
      continue;
    }

    const state = Number(onChain.state);
    if (state === OnChainDealState.Settled) {
      await prisma.partnerDeal.update({
        where: { id: deal.id },
        data: { status: "settled" },
      });
      skipped.push({ dealId: deal.id, reason: "already_settled_on_chain" });
      continue;
    }

    if (state !== OnChainDealState.Ruled && state !== OnChainDealState.Overridden) {
      skipped.push({ dealId: deal.id, reason: `state_${state}` });
      continue;
    }

    const vetoEnds = Number(onChain.ruledAt) + Number(onChain.vetoWindowSeconds);
    if (Math.floor(Date.now() / 1000) < vetoEnds) {
      skipped.push({ dealId: deal.id, reason: "veto_window_active" });
      continue;
    }

    const result = await settleDealOnChain(BigInt(deal.onChainDealId));
    if (!result.ok) {
      skipped.push({ dealId: deal.id, reason: result.error });
      continue;
    }

    await prisma.partnerDeal.update({
      where: { id: deal.id },
      data: { status: "settled", settleTxHash: result.txHash },
    });
    settled.push({ dealId: deal.id, txHash: result.txHash });
  }

  return { ok: true as const, settled, skipped };
}
