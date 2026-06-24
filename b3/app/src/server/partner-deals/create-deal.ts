import { getPrisma } from "@/server/db/prisma";
import { buildCreateDealCalldata, buildFundCalldata, syncDealIdFromCreateTx } from "./onchain";
import { serviceDealConfig, metadataHashToHex } from "./config";
import { hashCanonicalJson, normalizeWallet } from "./hash";
import {
  serviceDealMetadataSchema,
  validateDeliverableWeights,
  type ServiceDealMetadata,
} from "./schema";

export async function createPartnerDeal(input: {
  metadata: ServiceDealMetadata;
  metadataUri?: string;
}) {
  const parsed = serviceDealMetadataSchema.safeParse(input.metadata);
  if (!parsed.success) {
    return { ok: false as const, error: "invalid_metadata", details: parsed.error.flatten() };
  }
  if (!validateDeliverableWeights(parsed.data)) {
    return { ok: false as const, error: "deliverable_weights_must_sum_10000" };
  }

  const cfg = serviceDealConfig();
  if (!cfg) return { ok: false as const, error: "escrow_not_configured" };

  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const metadataHash = hashCanonicalJson(parsed.data);
  const payerWallet = normalizeWallet(parsed.data.payer);
  const providerWallet = normalizeWallet(parsed.data.provider);

  if (parsed.data.payment.chainId !== cfg.chainId) {
    return { ok: false as const, error: "chain_id_mismatch" };
  }

  const deliverBy = new Date(parsed.data.deliverBy);
  if (Number.isNaN(deliverBy.getTime())) {
    return { ok: false as const, error: "invalid_deliver_by" };
  }

  const deal = await prisma.partnerDeal.create({
    data: {
      title: parsed.data.title,
      metadataHash,
      metadataUri: input.metadataUri ?? null,
      metadata: parsed.data,
      payerWallet,
      providerWallet,
      amountUsdc: parsed.data.payment.amount,
      deliverBy,
      status: "draft",
      chainId: cfg.chainId,
    },
  });

  const deliverByUnix = BigInt(Math.floor(deliverBy.getTime() / 1000));
  const createCalldata = buildCreateDealCalldata({
    provider: providerWallet,
    amount: BigInt(parsed.data.payment.amount),
    metadataHash: metadataHashToHex(metadataHash),
    deliverBy: deliverByUnix,
  });
  const fundCalldata = buildFundCalldata(0n);

  return {
    ok: true as const,
    dealId: deal.id,
    metadataHash,
    escrowAddress: cfg.escrowAddress,
    usdcAddress: cfg.usdcAddress,
    chainId: cfg.chainId,
    createCalldata,
    fundCalldataNote: "Call fund(dealId) after createDeal with returned on-chain deal id",
  };
}

export async function markPartnerDealFunded(input: {
  dealId: string;
  onChainDealId: string;
  fundTxHash?: string;
  createTxHash?: string;
}) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  let onChainDealId = input.onChainDealId;
  if (!onChainDealId && input.createTxHash) {
    const synced = await syncDealIdFromCreateTx(input.createTxHash as `0x${string}`);
    if (synced) onChainDealId = synced;
  }
  if (!onChainDealId) return { ok: false as const, error: "missing_on_chain_deal_id" };

  const deal = await prisma.partnerDeal.update({
    where: { id: input.dealId },
    data: {
      onChainDealId,
      fundTxHash: input.fundTxHash ?? null,
      status: "funded",
    },
  });

  return { ok: true as const, deal };
}

export async function listPartnerDeals(filter?: { payerWallet?: string; providerWallet?: string }) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const where: Record<string, string> = {};
  if (filter?.payerWallet) where.payerWallet = filter.payerWallet.toLowerCase();
  if (filter?.providerWallet) where.providerWallet = filter.providerWallet.toLowerCase();

  const deals = await prisma.partnerDeal.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      evidence: { orderBy: { createdAt: "desc" }, take: 1 },
      rulings: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return { ok: true as const, deals };
}

export async function getPartnerDeal(dealId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  return prisma.partnerDeal.findUnique({
    where: { id: dealId },
    include: {
      evidence: { orderBy: { createdAt: "desc" } },
      rulings: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getPartnerDealCalldata(dealId: string) {
  const deal = await getPartnerDeal(dealId);
  if (!deal) return { ok: false as const, error: "deal_not_found" };

  const cfg = serviceDealConfig();
  if (!cfg) return { ok: false as const, error: "escrow_not_configured" };

  const metadata = deal.metadata as ServiceDealMetadata;
  const deliverByUnix = BigInt(Math.floor(deal.deliverBy.getTime() / 1000));

  const createCalldata = buildCreateDealCalldata({
    provider: deal.providerWallet as `0x${string}`,
    amount: BigInt(deal.amountUsdc),
    metadataHash: metadataHashToHex(deal.metadataHash),
    deliverBy: deliverByUnix,
  });

  const fundCalldata = deal.onChainDealId ? buildFundCalldata(BigInt(deal.onChainDealId)) : null;

  return {
    ok: true as const,
    deal,
    escrowAddress: cfg.escrowAddress,
    usdcAddress: cfg.usdcAddress,
    chainId: cfg.chainId,
    createCalldata,
    fundCalldata,
  };
}
