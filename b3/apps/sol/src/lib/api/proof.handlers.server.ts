import { processPendingStakesForMember } from "@/lib/community-stake.server";
import { getPrisma } from "@/lib/db.server";
import { getSessionToken } from "@/lib/session.server";
import {
  computeProofSnapshot,
  getProofStatusForMember,
} from "@/lib/proof-score.server";
import {
  buildAnchorProofMessage,
  buildLinkMemberMessage,
} from "@/lib/solana/claim-message";
import { buildProofMemoText, submitProofMemo } from "@/lib/solana/memo.server";
import { verifyWalletMessage } from "@/lib/solana/verify.server";

const NONCE_TTL_MS = 15 * 60 * 1000;

async function getMemberFromSession() {
  const token = getSessionToken();
  if (!token) return null;

  const prisma = getPrisma();
  const session = await prisma.memberSession.findUnique({
    where: { token },
    include: { member: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.memberSession.delete({ where: { id: session.id } });
    return null;
  }

  return session.member;
}

export async function handleGetProofStatus() {
  const member = await getMemberFromSession();
  if (!member) return null;
  return getProofStatusForMember(member.id);
}

export async function handleRequestLinkWalletNonce() {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");

  const nonce = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + NONCE_TTL_MS);
  const prisma = getPrisma();
  await prisma.member.update({
    where: { id: member.id },
    data: {
      linkWalletNonce: nonce,
      linkWalletNonceExpiresAt: expiresAt,
    },
  });

  return { nonce, email: member.email };
}

export async function handleLinkMemberWallet(walletAddress: string, nonce: string, signature: string) {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");

  if (!member.linkWalletNonce || member.linkWalletNonce !== nonce) {
    throw new Error("Invalid or expired link nonce");
  }
  if (!member.linkWalletNonceExpiresAt || member.linkWalletNonceExpiresAt < new Date()) {
    throw new Error("Link nonce expired");
  }

  const message = buildLinkMemberMessage(member.email, walletAddress, nonce);
  if (!verifyWalletMessage(message, walletAddress, signature)) {
    throw new Error("Invalid wallet signature");
  }

  const prisma = getPrisma();
  await prisma.member.update({
    where: { id: member.id },
    data: {
      walletAddress,
      linkWalletNonce: null,
      linkWalletNonceExpiresAt: null,
    },
  });

  await processPendingStakesForMember(member.id);

  return { ok: true, walletAddress };
}

export async function handleRequestProofAnchorNonce(snapshotId: string) {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");
  if (!member.walletAddress) throw new Error("Link your wallet first");

  const prisma = getPrisma();
  const snapshot = await prisma.proofSnapshot.findFirst({
    where: { id: snapshotId, memberId: member.id },
    include: { anchor: true },
  });
  if (!snapshot) throw new Error("Proof snapshot not found");
  if (snapshot.anchor) throw new Error("Proof already anchored");
  if (snapshot.status !== "eligible" && snapshot.status !== "anchored") {
    throw new Error("Proof score not yet eligible for anchoring");
  }

  const nonce = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + NONCE_TTL_MS);
  await prisma.proofSnapshot.update({
    where: { id: snapshotId },
    data: {
      anchorNonce: nonce,
      anchorNonceExpiresAt: expiresAt,
    },
  });

  return {
    nonce,
    periodKey: snapshot.periodKey,
    contentHash: snapshot.contentHash,
    walletAddress: member.walletAddress,
  };
}

export async function handleAnchorProof(snapshotId: string, signature: string) {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");
  if (!member.walletAddress) throw new Error("Link your wallet first");

  const prisma = getPrisma();
  const snapshot = await prisma.proofSnapshot.findFirst({
    where: { id: snapshotId, memberId: member.id },
    include: { anchor: true },
  });
  if (!snapshot) throw new Error("Proof snapshot not found");
  if (snapshot.anchor) {
    return {
      txSignature: snapshot.anchor.txSignature,
      periodKey: snapshot.periodKey,
      alreadyAnchored: true,
    };
  }
  if (snapshot.status !== "eligible") {
    throw new Error("Proof must be eligible before anchoring");
  }
  if (!snapshot.anchorNonce || !snapshot.anchorNonceExpiresAt) {
    throw new Error("Request an anchor nonce first");
  }
  if (snapshot.anchorNonceExpiresAt < new Date()) {
    throw new Error("Anchor nonce expired");
  }

  const message = buildAnchorProofMessage(
    member.walletAddress,
    snapshot.periodKey,
    snapshot.contentHash,
    snapshot.anchorNonce,
  );
  if (!verifyWalletMessage(message, member.walletAddress, signature)) {
    throw new Error("Invalid wallet signature");
  }

  const memoText = buildProofMemoText(snapshot.periodKey, snapshot.contentHash);
  const txSignature = await submitProofMemo(memoText);

  await prisma.proofAnchor.create({
    data: {
      snapshotId: snapshot.id,
      memberId: member.id,
      walletAddress: member.walletAddress,
      txSignature,
    },
  });

  await prisma.proofSnapshot.update({
    where: { id: snapshot.id },
    data: {
      status: "anchored",
      anchorNonce: null,
      anchorNonceExpiresAt: null,
    },
  });

  await computeProofSnapshot(member.id, snapshot.periodKey);

  return {
    txSignature,
    periodKey: snapshot.periodKey,
    alreadyAnchored: false,
  };
}
