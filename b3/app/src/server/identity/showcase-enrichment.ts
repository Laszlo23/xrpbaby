import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";

import { computeCultureScore } from "@/lib/identity/culture-score";
import type {
  CultureIdentityGraph,
  MemberProfileBridge,
} from "@/lib/identity/identity-graph-types";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import {
  getFounderShowcaseConfig,
  openSeaAssetUrl,
  type ActivityCategory,
  type FounderShowcaseConfig,
} from "@/lib/profile/founder-showcase";
import type { ShowcaseActivityItem, ShowcaseNftItem } from "@/lib/profile/showcase-types";
import { getOrFetchIdentityGraph } from "@/server/identity/enrichment-cache";
import {
  fetchCultureIdentityGraphFromAddress,
  fetchWeb3BioCredentials,
  fetchWeb3BioWalletBundle,
  ethereumProfileQuery,
  mergeIdentityGraphs,
} from "@/server/identity/web3bio";
import { getPrisma } from "@/server/db/prisma";
import { buildMemberProfileBridge } from "@/server/identity/member-score-bridge";
import { fetchBsAddressTransactions, blockscoutBaseUrl, type BsTransaction } from "@/server/explorer/blockscout";
import { upsertCultureIdentityFromResolved } from "@/server/credentials/identity";

export type {
  ActivityCategory,
  ActivitySource,
  CultureIdentityEnrichment,
  ShowcaseActivityItem,
  ShowcaseEnrichment,
  ShowcaseNftItem,
} from "@/lib/profile/showcase-types";

type AlchemyNftRow = {
  contract?: { address?: string; name?: string };
  tokenId?: string;
  name?: string;
  image?: { cachedUrl?: string; originalUrl?: string };
  media?: { gateway?: string }[];
};

function neynarClient(): NeynarAPIClient | null {
  const key = process.env.NEYNAR_API_KEY?.trim();
  if (!key) return null;
  return new NeynarAPIClient(new Configuration({ apiKey: key }));
}

function alchemyKey(): string | null {
  return process.env.ALCHEMY_API_KEY?.trim() || null;
}

function categorizeCast(text: string, authorHandle: string): ActivityCategory {
  const t = text.toLowerCase();
  const h = authorHandle.toLowerCase();

  if (
    /basescan|etherscan|0x[a-f0-9]{40}|onchain|transaction|tx\.|minted|mint\s|bcc\b|uniswap|aerodrome/.test(
      t,
    )
  ) {
    return "onchain";
  }
  if (
    /app\.buildingculture|agent-os|grant-proof|\/pass|\/products|culture layer|culture id|agent os/.test(
      t,
    )
  ) {
    return "product";
  }
  if (
    h === "buildingcultu3" ||
    /telegram|\/join|community|forest|campaign|farcaster channel|warpcast/.test(t)
  ) {
    return "community";
  }
  return "social";
}

function excerpt(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

function isPunkNft(nft: AlchemyNftRow): boolean {
  const name = (nft.name ?? "").toLowerCase();
  const collection = (nft.contract?.name ?? "").toLowerCase();
  return name.includes("punk") || collection.includes("punk");
}

function nftImageUrl(nft: AlchemyNftRow): string | null {
  return nft.image?.cachedUrl ?? nft.image?.originalUrl ?? nft.media?.[0]?.gateway ?? null;
}

async function fetchNeynarUser(
  client: NeynarAPIClient,
  username: string,
): Promise<{ fid: number; followerCount: number } | null> {
  try {
    const res = await client.lookupUserByUsername({ username });
    const user = res.user;
    if (!user?.fid) return null;
    return {
      fid: user.fid,
      followerCount: user.follower_count ?? 0,
    };
  } catch {
    return null;
  }
}

type NeynarCastRow = {
  hash: string;
  text?: string;
  timestamp: string;
  author?: { username?: string };
};

async function fetchCastsForUsername(
  client: NeynarAPIClient,
  username: string,
  limit: number,
): Promise<NeynarCastRow[]> {
  const user = await fetchNeynarUser(client, username);
  if (!user) return [];
  try {
    const res = await client.fetchCastsForUser({ fid: user.fid, limit });
    return (res.casts ?? []) as NeynarCastRow[];
  } catch {
    return [];
  }
}

function mapCastToActivity(cast: NeynarCastRow): ShowcaseActivityItem {
  const authorHandle = cast.author?.username ?? "unknown";
  const text = cast.text ?? "";
  const category = categorizeCast(text, authorHandle);
  return {
    id: cast.hash,
    category,
    title:
      category === "product"
        ? "Product update"
        : category === "community"
          ? "Community"
          : category === "onchain"
            ? "Onchain"
            : "Social",
    excerpt: excerpt(text),
    url: `https://warpcast.com/${authorHandle}/${cast.hash.slice(0, 10)}`,
    publishedAt: cast.timestamp,
    authorHandle,
    source: "neynar",
  };
}

async function fetchWalletNfts(
  owner: string,
  resolved: ResolvedCultureName,
  displayHandle: string,
): Promise<{ nfts: ShowcaseNftItem[]; avatarImageUrl: string | null; nftCount: number }> {
  const items: ShowcaseNftItem[] = [];
  let avatarImageUrl: string | null = null;

  if (resolved.contractAddress && resolved.tokenId) {
    items.push({
      id: `identity-${resolved.tokenId}`,
      name: displayHandle,
      imageUrl: null,
      chainLabel: "Base",
      openSeaUrl: openSeaAssetUrl(
        resolved.chainId,
        resolved.contractAddress,
        resolved.tokenId,
      ),
      isIdentity: true,
    });
  }

  const key = alchemyKey();
  if (!key) return { nfts: items, avatarImageUrl, nftCount: items.length };

  try {
    const url = new URL(`https://base-mainnet.g.alchemy.com/nft/v3/${key}/getNFTsForOwner`);
    url.searchParams.set("owner", owner);
    url.searchParams.set("withMetadata", "true");
    url.searchParams.set("pageSize", "24");

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return { nfts: items, avatarImageUrl, nftCount: items.length };

    const json = (await res.json()) as { ownedNfts?: AlchemyNftRow[] };
    const owned = json.ownedNfts ?? [];

    for (const nft of owned) {
      const contract = nft.contract?.address;
      const tokenId = nft.tokenId;
      if (!contract || tokenId == null) continue;

      const imageUrl = nftImageUrl(nft);
      if (!avatarImageUrl && isPunkNft(nft) && imageUrl) {
        avatarImageUrl = imageUrl;
      }

      if (
        resolved.contractAddress &&
        contract.toLowerCase() === resolved.contractAddress.toLowerCase() &&
        tokenId === resolved.tokenId
      ) {
        continue;
      }

      items.push({
        id: `${contract}-${tokenId}`,
        name: nft.name?.trim() || `Token #${tokenId}`,
        imageUrl,
        chainLabel: "Base",
        openSeaUrl: openSeaAssetUrl(8453, contract, String(tokenId)),
      });
    }

    return { nfts: items.slice(0, 10), avatarImageUrl, nftCount: owned.length };
  } catch {
    return { nfts: items, avatarImageUrl, nftCount: items.length };
  }
}

function emptyActivity(): Record<ActivityCategory, ShowcaseActivityItem[]> {
  return { product: [], community: [], onchain: [], social: [] };
}

function bucketActivity(items: ShowcaseActivityItem[]): Record<ActivityCategory, ShowcaseActivityItem[]> {
  const buckets = emptyActivity();
  for (const item of items) {
    buckets[item.category].push(item);
  }
  for (const key of Object.keys(buckets) as ActivityCategory[]) {
    buckets[key].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    buckets[key] = buckets[key].slice(0, 6);
  }
  return buckets;
}

function mergeActivity(
  config: FounderShowcaseConfig | null,
  neynarItems: ShowcaseActivityItem[],
): Record<ActivityCategory, ShowcaseActivityItem[]> {
  const merged = new Map<string, ShowcaseActivityItem>();

  for (const item of config?.curatedActivity ?? []) {
    merged.set(item.id, { ...item, source: "curated" });
  }
  for (const item of neynarItems) {
    if (!merged.has(item.id)) {
      merged.set(item.id, item);
    }
  }

  return bucketActivity([...merged.values()]);
}

async function fetchMemberBridge(owner: string): Promise<MemberProfileBridge | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    const member = await prisma.member.findFirst({
      where: { walletAddress: owner.toLowerCase() },
      include: {
        wallet: {
          include: {
            ledgers: { select: { delta: true } },
          },
        },
      },
    });
    if (!member) return null;

    const culturePoints =
      member.wallet?.ledgers.reduce((sum, row) => sum + row.delta, 0) ?? 0;

    return buildMemberProfileBridge(prisma, {
      memberId: member.id,
      walletId: member.walletId,
      walletAddress: owner.toLowerCase(),
      farcasterUsername: member.farcasterUsername,
      supportScore: member.supportScore,
      culturePoints,
      supporterTier: member.supporterTier,
    });
  } catch {
    return null;
  }
}

async function fetchTxBundle(owner: string): Promise<{ count: number; items: ShowcaseActivityItem[] }> {
  try {
    const txs = await fetchBsAddressTransactions(owner.toLowerCase());
    return {
      count: txs.length,
      items: txs.slice(0, 8).map(mapTxToActivity),
    };
  } catch {
    return { count: 0, items: [] };
  }
}

function resolveFarcasterUsername(
  web3bio: CultureIdentityGraph | null,
  member: MemberProfileBridge | null,
  founderConfig: FounderShowcaseConfig | null,
): string | null {
  if (founderConfig?.warpcastPersonalUsername) {
    return founderConfig.warpcastPersonalUsername.replace(/^@/, "");
  }
  if (member?.farcasterUsername) {
    return member.farcasterUsername.replace(/^@/, "");
  }
  const fc = web3bio?.graph.find((n) => n.platform === "farcaster");
  if (fc?.identity) return fc.identity.replace(/^@/, "");
  if (fc?.displayName) return fc.displayName.replace(/^@/, "");
  return null;
}

function mapTxToActivity(tx: BsTransaction): ShowcaseActivityItem {
  const method =
    tx.decoded_input?.method_call?.split("(")[0]?.trim() ??
    tx.method ??
    "Transaction";
  const shortHash = `${tx.hash.slice(0, 10)}…${tx.hash.slice(-4)}`;
  return {
    id: `tx-${tx.hash}`,
    category: "onchain",
    title: method.length > 36 ? `${method.slice(0, 36)}…` : method,
    excerpt: `Base transaction ${shortHash}${tx.status === "error" ? " (reverted)" : ""}`,
    url: `${blockscoutBaseUrl()}/tx/${tx.hash}`,
    publishedAt: tx.timestamp ?? new Date().toISOString(),
    authorHandle: "onchain",
    source: "onchain",
  };
}

function pickAvatarUrl(
  graph: CultureIdentityGraph | null,
  alchemyAvatar: string | null,
  configAvatar: string | null,
  walletAvatar: string | null = null,
): string | null {
  return configAvatar ?? alchemyAvatar ?? walletAvatar ?? graph?.primaryNode?.avatar ?? null;
}

function pickFollowerCount(
  graph: CultureIdentityGraph | null,
  neynarFollowerCount: number | null,
): number | null {
  if (neynarFollowerCount != null) return neynarFollowerCount;
  if (!graph) return null;
  const fc = graph.graph.find((n) => n.platform === "farcaster");
  if (fc?.followerCount != null) return fc.followerCount;
  return graph.totalFollowers > 0 ? graph.totalFollowers : null;
}

export async function getCultureIdentityEnrichment(
  resolved: ResolvedCultureName,
): Promise<CultureIdentityEnrichment | null> {
  if (resolved.status !== "claimed" || !resolved.owner) return null;

  const owner = resolved.owner;
  const displayHandle = resolved.fullName ?? `${resolved.handle}.${resolved.tld}`;
  const founderConfig = getFounderShowcaseConfig(resolved.fullName);

  const [profileGraph, member, txBundle, walletBundle, credentialFallback] = await Promise.all([
    getOrFetchIdentityGraph(owner, resolved.fullName, () =>
      fetchCultureIdentityGraphFromAddress(owner),
    ),
    fetchMemberBridge(owner),
    fetchTxBundle(owner),
    fetchWeb3BioWalletBundle(owner),
    fetchWeb3BioCredentials(ethereumProfileQuery(owner)),
  ]);

  const txCount = txBundle.count;
  const onchainItems = txBundle.items;

  const web3bio = mergeIdentityGraphs(profileGraph, walletBundle?.graph ?? []);
  const credentials =
    walletBundle?.credentials ??
    credentialFallback ??
    null;

  const client = neynarClient();
  let neynarFollowerCount: number | null = null;
  const neynarItems: ShowcaseActivityItem[] = [];
  const farcasterUsername = resolveFarcasterUsername(web3bio, member, founderConfig);

  if (client && farcasterUsername) {
    const personal = await fetchNeynarUser(client, farcasterUsername);
    if (personal) neynarFollowerCount = personal.followerCount;

    const personalCasts = await fetchCastsForUsername(client, farcasterUsername, 12);
    for (const cast of personalCasts) {
      neynarItems.push(mapCastToActivity(cast));
    }

    if (founderConfig?.warpcastBrandUsername) {
      const brandCasts = await fetchCastsForUsername(
        client,
        founderConfig.warpcastBrandUsername,
        8,
      );
      for (const cast of brandCasts) {
        neynarItems.push(mapCastToActivity(cast));
      }
    }
  }

  const activity = mergeActivity(founderConfig, [...neynarItems, ...onchainItems]);
  const wallet = await fetchWalletNfts(owner, resolved, displayHandle);

  await upsertCultureIdentityFromResolved(resolved, null);

  const prisma = getPrisma();
  let credentialCount = 0;
  if (prisma) {
    const identity = await prisma.cultureIdentity.findUnique({
      where: { handle: resolved.fullName.toLowerCase() },
      include: { userCredentials: { where: { status: "active" } } },
    });
    credentialCount = identity?.userCredentials.length ?? 0;
  }

  const humanVerified = (credentials?.isHuman.length ?? 0) > 0;
  const isRisky =
    (credentials?.isRisky.length ?? 0) > 0 || (credentials?.isSpam.length ?? 0) > 0;

  const cultureScore = computeCultureScore({
    resolved,
    graph: web3bio,
    nftCount: wallet.nftCount,
    txCount,
    member,
    credentialCount,
    humanVerified,
    isRisky,
  });

  return {
    ok: true,
    followerCount: pickFollowerCount(web3bio, neynarFollowerCount),
    neynarEnabled: client !== null,
    avatarImageUrl: pickAvatarUrl(
      web3bio,
      wallet.avatarImageUrl,
      founderConfig?.avatarUrl ?? null,
      walletBundle?.avatar ?? null,
    ),
    nfts: wallet.nfts,
    activity,
    web3bio,
    credentials,
    cultureScore,
    member,
  };
}

/** Founder showcase alias — same pipeline, requires founder config for curated activity. */
export async function getShowcaseEnrichment(
  resolved: ResolvedCultureName,
): Promise<CultureIdentityEnrichment | null> {
  return getCultureIdentityEnrichment(resolved);
}
