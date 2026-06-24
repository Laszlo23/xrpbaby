import { getPrisma } from "@/server/db/prisma";
import { hashCanonicalJson, normalizeWallet, isWallet } from "./hash";
import { getPartnerDeal } from "./create-deal";
import { buildSubmitEvidenceCalldata } from "./onchain";
import { serviceDealConfig } from "./config";
import { serviceDealEvidenceSchema, type ServiceDealMetadata } from "./schema";

export async function submitPartnerDealEvidence(input: {
  dealId: string;
  walletAddress: string;
  evidence: {
    version: 1;
    dealId: number;
    dealMetadataHash: string;
    submittedAt: string;
    submittedBy: string;
    artifacts: { type: string; uri: string; note?: string }[];
    metrics: Record<string, number | string | boolean>;
  };
  evidenceUri?: string;
  submitOnChain?: boolean;
  providerPrivateKey?: `0x${string}`;
}) {
  if (!isWallet(input.walletAddress)) {
    return { ok: false as const, error: "invalid_wallet" };
  }

  const deal = await getPartnerDeal(input.dealId);
  if (!deal) return { ok: false as const, error: "deal_not_found" };

  const wallet = normalizeWallet(input.walletAddress);
  if (wallet !== deal.providerWallet) {
    return { ok: false as const, error: "forbidden" };
  }

  if (!deal.onChainDealId) {
    return { ok: false as const, error: "deal_not_funded_on_chain" };
  }

  const parsed = serviceDealEvidenceSchema.safeParse(input.evidence);
  if (!parsed.success) {
    return { ok: false as const, error: "invalid_evidence", details: parsed.error.flatten() };
  }

  if (parsed.data.dealMetadataHash.toLowerCase() !== deal.metadataHash.toLowerCase()) {
    return { ok: false as const, error: "metadata_hash_mismatch" };
  }

  const evidenceHash = hashCanonicalJson(parsed.data);
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  let txHash: string | undefined;
  if (input.submitOnChain && input.providerPrivateKey) {
    const { submitEvidenceOnChain } = await import("./onchain");
    const onChain = await submitEvidenceOnChain(
      BigInt(deal.onChainDealId),
      evidenceHash,
      input.providerPrivateKey,
    );
    if (!onChain.ok) return onChain;
    txHash = onChain.txHash;
  }

  const row = await prisma.partnerDealEvidence.create({
    data: {
      dealId: deal.id,
      submittedBy: wallet,
      evidenceUri: input.evidenceUri ?? null,
      evidenceHash,
      payload: parsed.data,
      txHash: txHash ?? null,
    },
  });

  await prisma.partnerDeal.update({
    where: { id: deal.id },
    data: { status: "evidence_submitted", evidenceTxHash: txHash ?? null },
  });

  const cfg = serviceDealConfig();
  const submitCalldata = cfg
    ? buildSubmitEvidenceCalldata(BigInt(deal.onChainDealId), evidenceHash)
    : null;

  return {
    ok: true as const,
    evidenceId: row.id,
    evidenceHash,
    txHash,
    submitCalldata,
    escrowAddress: cfg?.escrowAddress,
  };
}

export async function buildEvidencePayload(dealId: string, walletAddress: string) {
  const deal = await getPartnerDeal(dealId);
  if (!deal) return null;
  const metadata = deal.metadata as ServiceDealMetadata;
  return {
    version: 1 as const,
    dealId: Number(deal.onChainDealId ?? 0),
    dealMetadataHash: deal.metadataHash,
    submittedAt: new Date().toISOString(),
    submittedBy: walletAddress.toLowerCase(),
    artifacts: [] as { type: string; uri: string; note?: string }[],
    metrics: {} as Record<string, number | string | boolean>,
    evidenceRequirements: metadata.evidenceRequirements,
  };
}
