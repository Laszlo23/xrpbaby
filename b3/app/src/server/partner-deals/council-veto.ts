import { getPrisma } from "@/server/db/prisma";
import { councilWalletAllowlist, serviceDealConfig } from "./config";
import { hashCanonicalJson, isWallet, normalizeWallet } from "./hash";
import { getPartnerDeal } from "./create-deal";
import { buildOverrideRulingCalldata } from "./onchain";
import { serviceDealRulingSchema, type ServiceDealRuling } from "./schema";

export async function councilOverrideRuling(input: {
  dealId: string;
  walletAddress: string;
  payoutBps: number;
  reasoning: string;
  kpiResults?: ServiceDealRuling["kpiResults"];
  submitCalldataOnly?: boolean;
}) {
  if (!isWallet(input.walletAddress)) {
    return { ok: false as const, error: "invalid_wallet" };
  }

  const allowlist = councilWalletAllowlist();
  const wallet = normalizeWallet(input.walletAddress);
  if (allowlist.size > 0 && !allowlist.has(wallet)) {
    return { ok: false as const, error: "forbidden" };
  }

  const deal = await getPartnerDeal(input.dealId);
  if (!deal) return { ok: false as const, error: "deal_not_found" };
  if (!deal.onChainDealId) return { ok: false as const, error: "deal_not_funded_on_chain" };

  const latestRuling = deal.rulings[0];
  if (!latestRuling) return { ok: false as const, error: "no_ai_ruling_yet" };

  if (input.payoutBps < 0 || input.payoutBps > 10_000) {
    return { ok: false as const, error: "invalid_payout_bps" };
  }

  const ruling: ServiceDealRuling = {
    version: 1,
    dealId: Number(deal.onChainDealId),
    dealMetadataHash: deal.metadataHash,
    payoutBps: input.payoutBps,
    evaluatedAt: new Date().toISOString(),
    evaluator: "council_override",
    kpiResults: input.kpiResults ?? (latestRuling.reasoning as ServiceDealRuling).kpiResults ?? [],
    reasoning: input.reasoning,
  };

  const parsed = serviceDealRulingSchema.safeParse(ruling);
  if (!parsed.success) {
    return { ok: false as const, error: "invalid_ruling", details: parsed.error.flatten() };
  }

  const rulingHash = hashCanonicalJson(parsed.data);
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const cfg = serviceDealConfig();
  const overrideCalldata = cfg
    ? buildOverrideRulingCalldata(BigInt(deal.onChainDealId), parsed.data.payoutBps, rulingHash)
    : null;

  if (input.submitCalldataOnly) {
    return {
      ok: true as const,
      ruling: parsed.data,
      rulingHash,
      overrideCalldata,
      escrowAddress: cfg?.escrowAddress,
      note: "Submit overrideCalldata via council Safe wallet",
    };
  }

  const row = await prisma.partnerDealRuling.create({
    data: {
      dealId: deal.id,
      payoutBps: parsed.data.payoutBps,
      rulingHash,
      councilOverride: true,
      reasoning: parsed.data,
    },
  });

  await prisma.partnerDeal.update({
    where: { id: deal.id },
    data: { status: "overridden" },
  });

  return {
    ok: true as const,
    rulingId: row.id,
    ruling: parsed.data,
    rulingHash,
    overrideCalldata,
    escrowAddress: cfg?.escrowAddress,
  };
}

export function isCouncilWallet(walletAddress: string): boolean {
  if (!isWallet(walletAddress)) return false;
  const allowlist = councilWalletAllowlist();
  if (allowlist.size === 0) return false;
  return allowlist.has(normalizeWallet(walletAddress));
}
