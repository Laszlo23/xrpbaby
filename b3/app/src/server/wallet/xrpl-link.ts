import { randomBytes } from "node:crypto";

import { isValidXrplAddress } from "@/lib/credentials/xrpl-address";
import { xrplLinkRequireSignature, xrplLinkTestBypassEnabled } from "@/lib/xrpl-link-env";
import { findCultureIdentityByHandle } from "@/server/credentials/identity";
import { getPrisma } from "@/server/db/prisma";
import { recordReputationEvent } from "@/server/reputation/events";
import { requireCultureIdentityOwner } from "@/server/wallet/xrpl-auth";
import {
  verifyXrplLinkTxBlob,
  verifyXrplMessageSignature,
} from "@/server/wallet/xrpl-signature";
import type { SiweAuthInput } from "@/server/platform/siwe";

export type XrplLinkChallenge = {
  nonce: string;
  message: string;
  expiresAt: string;
};

const CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function buildXrplLinkMessage(handle: string, address: string, nonce: string): string {
  return `Building Culture XRPL wallet link\nHandle: ${handle}\nAddress: ${address}\nNonce: ${nonce}`;
}

async function persistChallenge(input: {
  identityId: string;
  handle: string;
  nonce: string;
  expiresAt: Date;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.xrplLinkChallenge.create({
    data: {
      identityId: input.identityId,
      handle: input.handle,
      nonce: input.nonce,
      expiresAt: input.expiresAt,
    },
  });
}

async function consumeChallenge(nonce: string, identityId: string): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;

  const row = await prisma.xrplLinkChallenge.findUnique({ where: { nonce } });
  if (!row || row.identityId !== identityId) return false;
  if (row.consumedAt) return false;
  if (row.expiresAt.getTime() < Date.now()) return false;

  await prisma.xrplLinkChallenge.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  });
  return true;
}

export async function createXrplLinkChallenge(input: {
  handle: string;
  siwe: SiweAuthInput;
  xrplAddress?: string;
}): Promise<XrplLinkChallenge | { error: string; status: number }> {
  const owner = await requireCultureIdentityOwner(input.handle, input.siwe);
  if (!owner.ok) {
    return { error: owner.error, status: owner.status };
  }

  const nonce = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);
  const xrplAddress = input.xrplAddress?.trim() ?? "<your-xrpl-address>";

  await persistChallenge({
    identityId: owner.identityId,
    handle: owner.handle,
    nonce,
    expiresAt,
  });

  return {
    nonce,
    message: buildXrplLinkMessage(owner.handle, xrplAddress, nonce),
    expiresAt: expiresAt.toISOString(),
  };
}

function verifyXrplProof(input: {
  handle: string;
  xrplAddress: string;
  nonce: string;
  message: string;
  signature?: string;
  publicKey?: string;
  txBlob?: string;
}): boolean {
  if (xrplLinkTestBypassEnabled()) {
    return true;
  }

  if (input.txBlob) {
    return verifyXrplLinkTxBlob({
      txBlob: input.txBlob,
      xrplAddress: input.xrplAddress,
      nonce: input.nonce,
    });
  }

  if (input.signature && input.publicKey) {
    return verifyXrplMessageSignature({
      message: input.message,
      signature: input.signature,
      publicKey: input.publicKey,
    });
  }

  return false;
}

export async function verifyAndLinkXrplWallet(input: {
  handle: string;
  xrplAddress: string;
  nonce: string;
  siwe: SiweAuthInput;
  signature?: string;
  publicKey?: string;
  txBlob?: string;
}): Promise<{ ok: true; verified: boolean } | { ok: false; error: string; status?: number }> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: "database_unavailable", status: 503 };

  const owner = await requireCultureIdentityOwner(input.handle, input.siwe);
  if (!owner.ok) {
    return { ok: false, error: owner.error, status: owner.status };
  }

  if (!isValidXrplAddress(input.xrplAddress)) {
    return { ok: false, error: "invalid_xrpl_address", status: 400 };
  }

  const consumed = await consumeChallenge(input.nonce, owner.identityId);
  if (!consumed) {
    return { ok: false, error: "invalid_or_expired_nonce", status: 400 };
  }

  const identity = await findCultureIdentityByHandle(owner.handle);
  if (!identity) {
    return { ok: false, error: "identity_not_found", status: 404 };
  }

  const message = buildXrplLinkMessage(owner.handle, input.xrplAddress, input.nonce);
  const requireSignature = xrplLinkRequireSignature();
  const verified = verifyXrplProof({
    handle: owner.handle,
    xrplAddress: input.xrplAddress,
    nonce: input.nonce,
    message,
    signature: input.signature,
    publicKey: input.publicKey,
    txBlob: input.txBlob,
  });

  if (requireSignature && !verified) {
    return { ok: false, error: "signature_required_or_invalid", status: 400 };
  }

  const existing = await prisma.linkedWallet.findUnique({
    where: { chain_address: { chain: "xrpl", address: input.xrplAddress } },
  });

  await prisma.linkedWallet.upsert({
    where: {
      chain_address: { chain: "xrpl", address: input.xrplAddress },
    },
    create: {
      identityId: identity.id,
      chain: "xrpl",
      address: input.xrplAddress,
      verified,
      verifiedAt: verified ? new Date() : null,
      isPrimary: false,
      source: "xrpl_link",
      updatedAt: new Date(),
    },
    update: {
      identityId: identity.id,
      verified,
      verifiedAt: verified ? new Date() : null,
      source: "xrpl_link",
    },
  });

  if (verified && !existing?.verified) {
    await recordReputationEvent({
      identityId: identity.id,
      type: "wallet_linked",
      weight: 1,
      source: "xrpl",
      proofRef: input.xrplAddress,
      metadata: { chain: "xrpl", handle: owner.handle },
    });
  }

  return { ok: true, verified };
}

export { isValidXrplAddress };
