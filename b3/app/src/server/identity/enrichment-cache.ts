import { getPrisma } from "@/server/db/prisma";
import type { CultureIdentityGraph } from "@/lib/identity/identity-graph-types";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export type CachedGraphPayload = CultureIdentityGraph;

export async function readIdentityGraphCache(owner: string): Promise<CachedGraphPayload | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const normalized = owner.toLowerCase();
  try {
    const row = await prisma.identityEnrichmentCache.findUnique({
      where: { owner: normalized },
    });
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) return null;
    return row.payload as CachedGraphPayload;
  } catch {
    return null;
  }
}

export async function writeIdentityGraphCache(
  owner: string,
  fullName: string | undefined,
  payload: CachedGraphPayload,
): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  const normalized = owner.toLowerCase();
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);

  try {
    await prisma.identityEnrichmentCache.upsert({
      where: { owner: normalized },
      create: {
        owner: normalized,
        fullName: fullName ?? null,
        payload,
        expiresAt,
      },
      update: {
        fullName: fullName ?? null,
        payload,
        fetchedAt: new Date(),
        expiresAt,
      },
    });
  } catch {
    /* optional persistence */
  }
}

export async function getOrFetchIdentityGraph(
  owner: string,
  fullName: string | undefined,
  fetcher: () => Promise<CultureIdentityGraph | null>,
): Promise<CultureIdentityGraph | null> {
  const cached = await readIdentityGraphCache(owner);
  if (cached) return cached;

  const fresh = await fetcher();
  if (fresh) {
    await writeIdentityGraphCache(owner, fullName, fresh);
  }
  return fresh;
}

export async function getOrFetchIdentityGraphByIdentity(
  identity: string,
  fetcher: () => Promise<CultureIdentityGraph | null>,
): Promise<CultureIdentityGraph | null> {
  const cacheKey = `identity:${identity.toLowerCase()}`;
  return getOrFetchIdentityGraph(cacheKey, identity, fetcher);
}
