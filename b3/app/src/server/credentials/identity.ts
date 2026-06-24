import { randomUUID } from "node:crypto";

import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import { getPrisma } from "@/server/db/prisma";

export async function upsertCultureIdentityFromResolved(
  resolved: ResolvedCultureName,
  memberId?: string | null,
): Promise<string | null> {
  const prisma = getPrisma();
  if (!prisma || resolved.status !== "claimed" || !resolved.owner) return null;

  const handle = resolved.fullName.toLowerCase();
  const identity = await prisma.cultureIdentity.upsert({
    where: { handle },
    create: {
      handle,
      ownerAddress: resolved.owner.toLowerCase(),
      tokenId: resolved.tokenId ?? null,
      chainId: resolved.chainId ?? 8453,
      mintedAt: resolved.mintedAt ? new Date(resolved.mintedAt) : null,
      memberId: memberId ?? null,
    },
    update: {
      ownerAddress: resolved.owner.toLowerCase(),
      tokenId: resolved.tokenId ?? null,
      memberId: memberId ?? undefined,
    },
  });

  await prisma.linkedWallet.upsert({
    where: {
      chain_address: { chain: "evm", address: resolved.owner.toLowerCase() },
    },
    create: {
      identityId: identity.id,
      chain: "evm",
      address: resolved.owner.toLowerCase(),
      verified: true,
      verifiedAt: new Date(),
      isPrimary: true,
      source: "culture_layer",
    },
    update: {
      identityId: identity.id,
      verified: true,
      isPrimary: true,
    },
  });

  return identity.id;
}

export async function findCultureIdentityByHandle(handle: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.cultureIdentity.findUnique({
    where: { handle: handle.toLowerCase() },
    include: {
      linkedWallets: true,
      userCredentials: { include: { credential: true }, where: { status: "active" } },
      reputationEvents: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function findCultureIdentityByOwner(ownerAddress: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.cultureIdentity.findFirst({
    where: { ownerAddress: ownerAddress.toLowerCase() },
    include: {
      linkedWallets: true,
      userCredentials: { include: { credential: true }, where: { status: "active" } },
    },
  });
}

/** Resolve all Culture Layer handles indexed for a wallet. */
export async function findCultureHandlesForWallet(walletAddress: string): Promise<string[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  const normalized = walletAddress.toLowerCase();
  const handles = new Set<string>();

  const owned = await prisma.cultureIdentity.findMany({
    where: { ownerAddress: normalized },
    select: { handle: true },
    orderBy: { createdAt: "desc" },
  });
  for (const row of owned) {
    if (row.handle) handles.add(row.handle.toLowerCase());
  }

  const links = await prisma.linkedWallet.findMany({
    where: { chain: "evm", address: normalized },
    select: { identity: { select: { handle: true } } },
  });
  for (const link of links) {
    if (link.identity?.handle) handles.add(link.identity.handle.toLowerCase());
  }

  const { findBcidByOwner } = await import("@/server/bcid/identity");
  const bcid = await findBcidByOwner(normalized);
  const bridged = bcid?.bridgeLink?.cultureHandle?.toLowerCase();
  if (bridged) handles.add(bridged);

  return [...handles];
}

/** Resolve a wallet's primary Culture Layer handle from Postgres (owner, linked wallet, or BCID bridge). */
export async function findCultureHandleForWallet(walletAddress: string): Promise<string | null> {
  const handles = await findCultureHandlesForWallet(walletAddress);
  return handles[0] ?? null;
}

export async function linkMemberToIdentity(memberId: string, handle: string): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.cultureIdentity.updateMany({
    where: { handle: handle.toLowerCase() },
    data: { memberId },
  });
}

export async function ensurePrimaryEvmWallet(identityId: string, address: string): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  const normalized = address.toLowerCase();
  await prisma.linkedWallet.upsert({
    where: { chain_address: { chain: "evm", address: normalized } },
    create: {
      id: randomUUID(),
      identityId,
      chain: "evm",
      address: normalized,
      verified: true,
      verifiedAt: new Date(),
      isPrimary: true,
      source: "siwe",
    },
    update: { identityId, verified: true, isPrimary: true },
  });
}
