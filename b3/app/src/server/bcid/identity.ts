import { randomUUID } from "node:crypto";

import { computeBcidReputation } from "@/lib/identity/bcid-reputation";
import { getPrisma } from "@/server/db/prisma";

const CULTURE_TO_BCID_CREDENTIAL: Record<string, string> = {
  builder: "bcid-builder",
  contributor: "bcid-contributor",
  "community-leader": "bcid-community-leader",
  "verified-human": "bcid-verified-human",
  "verified-project": "bcid-verified-project",
};

export function buildBcidDid(tokenId: string): string {
  return `did:bcid:human:${tokenId}`;
}

export async function findBcidByDid(did: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.bcidIdentity.findUnique({
    where: { did },
    include: {
      bridgeLink: true,
      reputationScores: true,
      credentials: true,
      linkedAccounts: true,
    },
  });
}

export async function findBcidByHandle(handle: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.bcidIdentity.findUnique({
    where: { publicHandle: handle.toLowerCase() },
    include: {
      bridgeLink: true,
      reputationScores: true,
      credentials: true,
    },
  });
}

export async function findBcidByOwner(ownerAddress: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.bcidIdentity.findFirst({
    where: { ownerAddress: ownerAddress.toLowerCase(), type: "human" },
    include: { reputationScores: true, bridgeLink: true },
  });
}

export async function findBcidByCultureHandle(cultureHandle: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const handle = cultureHandle.toLowerCase();
  const bridge = await prisma.bcidBridgeLink.findUnique({
    where: { cultureHandle: handle },
    include: {
      bcidIdentity: {
        include: {
          reputationScores: true,
          credentials: { where: { status: "active" } },
          bridgeLink: true,
        },
      },
    },
  });
  return bridge?.bcidIdentity ?? null;
}

export async function syncBcidIdentity(input: {
  ownerAddress: string;
  publicHandle: string;
  tokenId: string;
  chainId?: number;
  memberId?: string | null;
  displayName?: string | null;
}) {
  const prisma = getPrisma();
  if (!prisma) return null;

  const did = buildBcidDid(input.tokenId);
  const handle = input.publicHandle.toLowerCase();

  const identity = await prisma.bcidIdentity.upsert({
    where: { did },
    create: {
      did,
      type: "human",
      ownerAddress: input.ownerAddress.toLowerCase(),
      publicHandle: handle,
      tokenId: input.tokenId,
      chainId: input.chainId ?? 84532,
      displayName: input.displayName ?? handle,
      memberId: input.memberId ?? undefined,
      mintedAt: new Date(),
    },
    update: {
      ownerAddress: input.ownerAddress.toLowerCase(),
      publicHandle: handle,
      tokenId: input.tokenId,
      chainId: input.chainId ?? 84532,
      displayName: input.displayName ?? handle,
      memberId: input.memberId ?? undefined,
      mintedAt: new Date(),
    },
  });

  await recomputeBcidScores(identity.id);
  return identity;
}

export async function recomputeBcidScores(bcidIdentityId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  const identity = await prisma.bcidIdentity.findUnique({
    where: { id: bcidIdentityId },
    include: {
      credentials: { where: { status: "active" } },
      linkedAccounts: { where: { verified: true } },
      recoveryGuardians: true,
      bridgeLink: true,
      member: {
        include: {
          wallet: { include: { ledgers: true } },
          studioProjects: true,
        },
      },
    },
  });
  if (!identity) return null;

  const ageDays = identity.mintedAt
    ? Math.floor((Date.now() - identity.mintedAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const humanVerified = identity.credentials.some((c) => c.slug === "bcid-verified-human");

  const culturePoints =
    identity.member?.wallet?.ledgers.reduce((s, l) => s + l.delta, 0) ?? 0;
  const studioCount = identity.member?.studioProjects?.length ?? 0;

  const scores = computeBcidReputation({
    studioProjectCount: studioCount,
    buildTaskCount: studioCount,
    credentialCount: identity.credentials.length,
    credentialTierSum: identity.credentials.length * 2,
    identityAgeDays: ageDays,
    guardianCount: identity.recoveryGuardians.length,
    verifiedLinkCount: identity.linkedAccounts.length,
    culturePoints,
    humanVerified,
    contributionSeed: identity.bridgeLink?.contributionSeed ?? 0,
  });

  await prisma.bcidReputationScore.upsert({
    where: { bcidIdentityId: identity.id },
    create: { bcidIdentityId: identity.id, ...scores },
    update: scores,
  });

  return scores;
}

export async function bridgeCultureToBcid(input: {
  ownerAddress: string;
  cultureHandle: string;
  cultureTokenId: string;
  memberId?: string | null;
}) {
  const prisma = getPrisma();
  if (!prisma) return { ok: false as const, error: "database_unavailable" };

  const handle = input.cultureHandle.toLowerCase();

  const existingBridge = await prisma.bcidBridgeLink.findUnique({
    where: { cultureHandle: handle },
  });
  if (existingBridge) return { ok: false as const, error: "already_bridged" };

  let bcid = await findBcidByOwner(input.ownerAddress);
  if (!bcid) {
    const tokenId = randomUUID().slice(0, 8);
    const synced = await syncBcidIdentity({
      ownerAddress: input.ownerAddress,
      publicHandle: handle.replace(".culture", ""),
      tokenId,
      memberId: input.memberId,
    });
    if (!synced) return { ok: false as const, error: "bcid_sync_failed" };
    bcid = await findBcidByDid(synced.did);
  }
  if (!bcid) return { ok: false as const, error: "bcid_not_found" };

  const cultureIdentity = await prisma.cultureIdentity.findUnique({
    where: { handle },
    include: { userCredentials: { include: { credential: true }, where: { status: "active" } } },
  });

  if (cultureIdentity && cultureIdentity.ownerAddress.toLowerCase() !== input.ownerAddress.toLowerCase()) {
    return { ok: false as const, error: "not_culture_owner" };
  }

  let contributionSeed = 0;
  let credentialsMigrated = 0;

  if (cultureIdentity) {
    for (const uc of cultureIdentity.userCredentials) {
      const bcidSlug = CULTURE_TO_BCID_CREDENTIAL[uc.credential.slug];
      if (!bcidSlug) continue;
      await prisma.bcidCredential.upsert({
        where: { bcidIdentityId_slug: { bcidIdentityId: bcid.id, slug: bcidSlug } },
        create: {
          bcidIdentityId: bcid.id,
          slug: bcidSlug,
          evidence: uc.evidence ?? {},
          issuedAt: uc.issuedAt,
        },
        update: { status: "active" },
      });
      credentialsMigrated += 1;
    }
    contributionSeed = Math.min(cultureIdentity.userCredentials.length * 2.5, 20);
  }

  await prisma.bcidBridgeLink.create({
    data: {
      bcidIdentityId: bcid.id,
      cultureHandle: handle,
      cultureTokenId: input.cultureTokenId,
      contributionSeed,
    },
  });

  await prisma.bcidLinkedAccount.upsert({
    where: { bcidIdentityId_platform: { bcidIdentityId: bcid.id, platform: "culture" } },
    create: {
      bcidIdentityId: bcid.id,
      platform: "culture",
      handle,
      externalId: input.cultureTokenId,
      verified: true,
      verifiedAt: new Date(),
    },
    update: { verified: true, verifiedAt: new Date() },
  });

  await recomputeBcidScores(bcid.id);

  return {
    ok: true as const,
    did: bcid.did,
    cultureHandle: handle,
    credentialsMigrated,
    contributionScoreSeed: contributionSeed,
  };
}
