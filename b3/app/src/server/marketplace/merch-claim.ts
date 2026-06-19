import { randomUUID } from "node:crypto";

import { getPrisma } from "@/server/db/prisma";
import { ensureWalletAndMember } from "@/server/platform/member";
import { recordReputationEvent } from "@/server/reputation/events";
import { recordCultureMemoryEvent } from "@/server/memory/timeline";
import { creditMerchHolderClaim } from "@/server/points/merch-holder-claim-credit";
import { getMerchOrderByClaimCode, markMerchOrderClaimed } from "@/server/marketplace/merch-orders";

export type MerchClaimResult =
  | {
      ok: true;
      alreadyClaimed: boolean;
      orderId: string;
      dropSlug: string;
      unitNumber: number;
      credentialGranted: boolean;
      pointsGranted: number;
      holderChannelUrl: string | null;
    }
  | { ok: false; error: string };

export function merchHolderChannelUrl(): string | null {
  const url = process.env.MERCH_HOLDER_CHANNEL_URL?.trim();
  return url && url.startsWith("http") ? url : null;
}

async function grantLimitedMerchCredential(input: {
  walletAddress: string;
  memberId?: string | null;
  orderId: string;
  dropSlug: string;
  unitNumber: number;
}) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const credential = await prisma.credential.findUnique({
    where: { slug: "limited-merch-holder" },
  });
  if (!credential) return { ok: false as const, error: "credential_not_seeded" };

  let identity = await prisma.cultureIdentity.findFirst({
    where: { ownerAddress: input.walletAddress.toLowerCase() },
  });

  if (!identity && input.memberId) {
    identity = await prisma.cultureIdentity.findFirst({ where: { memberId: input.memberId } });
  }

  if (!identity) {
    return { ok: false as const, error: "culture_identity_required" };
  }

  const existing = await prisma.userCredential.findUnique({
    where: { credentialId_identityId: { credentialId: credential.id, identityId: identity.id } },
  });

  if (existing?.status === "active") {
    return { ok: true as const, alreadyHeld: true, userCredentialId: existing.id };
  }

  const userCredential = await prisma.userCredential.upsert({
    where: { credentialId_identityId: { credentialId: credential.id, identityId: identity.id } },
    create: {
      id: randomUUID(),
      credentialId: credential.id,
      identityId: identity.id,
      memberId: input.memberId ?? identity.memberId,
      status: "active",
      evidence: {
        reason: "Merch label QR claim",
        orderId: input.orderId,
        dropSlug: input.dropSlug,
        unitNumber: input.unitNumber,
        claimedAt: new Date().toISOString(),
      },
    },
    update: {
      status: "active",
      revokedAt: null,
      evidence: {
        reason: "Merch label QR claim",
        orderId: input.orderId,
        dropSlug: input.dropSlug,
        unitNumber: input.unitNumber,
        claimedAt: new Date().toISOString(),
      },
    },
  });

  await recordReputationEvent({
    identityId: identity.id,
    type: "credential_issued",
    weight: 2,
    source: "platform",
    proofRef: userCredential.id,
    metadata: { slug: "limited-merch-holder", orderId: input.orderId },
  });

  return { ok: true as const, alreadyHeld: false, userCredentialId: userCredential.id };
}

export async function claimMerchByCode(input: {
  claimCode: string;
  walletAddress: string;
}): Promise<MerchClaimResult> {
  const code = input.claimCode.trim();
  const wallet = input.walletAddress.toLowerCase();

  if (!code) return { ok: false, error: "missing_code" };
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) return { ok: false, error: "invalid_wallet" };

  const order = await getMerchOrderByClaimCode(code);
  if (!order) return { ok: false, error: "order_not_found" };
  if (order.status === "pending_payment") return { ok: false, error: "payment_pending" };
  if (order.wallet !== wallet) return { ok: false, error: "wallet_mismatch" };

  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: "database_unavailable" };

  const { member } = await ensureWalletAndMember(prisma, wallet);

  const claimed = await markMerchOrderClaimed(order.id);
  if (!claimed.ok) return { ok: false, error: claimed.error ?? "claim_failed" };

  const credential = await grantLimitedMerchCredential({
    walletAddress: wallet,
    memberId: member?.id,
    orderId: order.id,
    dropSlug: order.dropSlug,
    unitNumber: order.unitNumber,
  });

  const points = await creditMerchHolderClaim(prisma, {
    evmAddress: wallet,
    orderId: order.id,
    memberId: member?.id,
  });

  await recordCultureMemoryEvent({
    wallet,
    type: "merch_label_claimed",
    payload: {
      orderId: order.id,
      dropSlug: order.dropSlug,
      unitNumber: order.unitNumber,
      credentialGranted: credential.ok,
      pointsGranted: points.pointsGranted,
    },
  });

  return {
    ok: true,
    alreadyClaimed: claimed.alreadyClaimed,
    orderId: order.id,
    dropSlug: order.dropSlug,
    unitNumber: order.unitNumber,
    credentialGranted: credential.ok,
    pointsGranted: points.pointsGranted,
    holderChannelUrl: merchHolderChannelUrl(),
  };
}

export async function getMerchClaimPreview(claimCode: string) {
  const order = await getMerchOrderByClaimCode(claimCode.trim());
  if (!order) return null;

  const prisma = getPrisma();
  let hasCultureIdentity = false;
  let cultureIdHandle: string | null = null;
  if (prisma) {
    const identity = await prisma.cultureIdentity.findFirst({
      where: { ownerAddress: order.wallet.toLowerCase() },
      select: { handle: true },
    });
    hasCultureIdentity = Boolean(identity);
    cultureIdHandle = identity?.handle ?? null;
  }

  return {
    claimCode: order.claimCode,
    dropSlug: order.dropSlug,
    dropTitle: order.drop.title,
    imageUrl: order.drop.imageUrl,
    unitNumber: order.unitNumber,
    editionCap: order.drop.editionCap,
    size: order.size,
    status: order.status,
    claimed: Boolean(order.claimedAt),
    paid: order.status === "paid" || order.status === "claimed",
    x402TxHash: order.x402TxHash,
    paymentRail: order.paymentRail,
    wallet: order.wallet,
    hasCultureIdentity,
    cultureIdHandle,
  };
}
