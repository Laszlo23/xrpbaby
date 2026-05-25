import type { Address } from "viem";
import type { FarcasterProfile, SocialProviderResult } from "./types";

const NEYNAR_V2_BASE = "https://api.neynar.com/v2";
const SNAPCHAIN_BASE =
  process.env.NEYNAR_SNAPCHAIN_URL?.trim() || "https://snapchain-api.neynar.com/v1";

/** Farcaster protocol timestamps are seconds since 2021-01-01 UTC. */
const FARCASTER_EPOCH_SEC = 1_609_459_200;

function apiKey(): string | null {
  const key = process.env.NEYNAR_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

async function neynarV2Fetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T | null> {
  const key = apiKey();
  if (!key) return null;

  const url = new URL(`${NEYNAR_V2_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url, {
    headers: { "x-api-key": key, accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    console.warn(`Neynar v2 ${path}: ${res.status}`);
    return null;
  }

  return res.json() as Promise<T>;
}

async function snapchainFetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T | null> {
  const key = apiKey();
  if (!key) return null;

  const url = new URL(`${SNAPCHAIN_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url, {
    headers: {
      "x-api-key": key,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    signal: AbortSignal.timeout(12_000),
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    console.warn(`Snapchain ${path}: ${res.status}`);
    return null;
  }

  return res.json() as Promise<T>;
}

/** Optional health probe for Neynar's hosted Snapchain node. */
export async function checkSnapchainInfo(): Promise<boolean> {
  const data = await snapchainFetch<{ numShards?: number }>("/info");
  return data != null && typeof data.numShards === "number";
}

type NeynarUser = {
  fid: number;
  username: string;
  display_name?: string;
  profile?: { bio?: { text?: string } };
  pfp_url?: string;
  follower_count?: number;
  following_count?: number;
  verified_accounts?: Array<{ platform: string; username: string }>;
  verifications?: string[];
};

type BulkByAddressResponse = Record<string, NeynarUser[]>;

type V2CastsResponse = {
  casts?: Array<{
    text: string;
    timestamp: string;
    reactions?: { likes_count?: number; recasts_count?: number };
    author: { username: string };
    hash?: string;
  }>;
};

type SnapchainCastMessage = {
  data?: {
    fid?: number;
    timestamp?: number;
    castAddBody?: { text?: string };
  };
  hash?: string;
};

type SnapchainCastsResponse = { messages?: SnapchainCastMessage[] };

function farcasterTimestampToIso(ts: number): string {
  return new Date((ts + FARCASTER_EPOCH_SEC) * 1000).toISOString();
}

function mapNeynarUser(user: NeynarUser): FarcasterProfile {
  return {
    fid: user.fid,
    username: user.username,
    displayName: user.display_name || user.username,
    bio: user.profile?.bio?.text || "",
    pfpUrl: user.pfp_url || "",
    followerCount: user.follower_count ?? 0,
    followingCount: user.following_count ?? 0,
    profileUrl: `https://warpcast.com/${user.username}`,
    verifiedAccounts: (user.verified_accounts || []).map((a) => ({
      platform: a.platform,
      username: a.username,
    })),
    verifiedAddresses: (user.verifications || []).map((v) => v.toLowerCase()),
  };
}

type BulkByFidResponse = { users?: NeynarUser[] };

export async function fetchUserByFid(
  fid: number,
): Promise<FarcasterProfile | null> {
  if (!apiKey()) return null;

  const data = await neynarV2Fetch<BulkByFidResponse>("/farcaster/user/bulk", {
    fids: String(fid),
  });

  const user = data?.users?.[0];
  return user ? mapNeynarUser(user) : null;
}

type FollowingResponse = {
  users?: Array<{ fid: number }>;
};

export async function userFollowsFid(
  viewerFid: number,
  targetFid: number,
): Promise<boolean> {
  if (!apiKey() || !targetFid) return false;

  let cursor: string | undefined;
  for (let page = 0; page < 5; page++) {
    const params: Record<string, string> = {
      fid: String(viewerFid),
      limit: "100",
    };
    if (cursor) params.cursor = cursor;

    const data = await neynarV2Fetch<FollowingResponse & { next?: { cursor?: string } }>(
      "/farcaster/following/",
      params,
    );

    if (data?.users?.some((u) => u.fid === targetFid)) return true;

    cursor = data?.next?.cursor;
    if (!cursor) break;
  }

  return false;
}

export async function userCastMatchesHashtag(
  fid: number,
  hashtag: string,
): Promise<string | null> {
  const tag = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;
  const casts = await fetchFarcasterCasts(fid, 25);
  const match = casts.find((c) =>
    c.text.toLowerCase().includes(tag.toLowerCase()),
  );
  return match?.hash ?? (match ? "cast" : null);
}

export async function fetchFarcasterByWallet(
  owner: Address,
): Promise<SocialProviderResult<FarcasterProfile>> {
  if (!apiKey()) {
    return { ok: false, error: "NEYNAR_API_KEY not configured" };
  }

  const normalized = owner.toLowerCase() as Address;
  const data = await neynarV2Fetch<BulkByAddressResponse>(
    "/farcaster/user/bulk-by-address/",
    { addresses: normalized },
  );

  const users = data?.[normalized];
  const user = users?.[0];
  if (!user) {
    return { ok: false, error: "No Farcaster account linked to this wallet" };
  }

  return { ok: true, data: mapNeynarUser(user) };
}

export type FarcasterCast = {
  text: string;
  timestamp: string;
  likes: number;
  recasts: number;
  hash?: string;
};

async function fetchCastsFromSnapchain(fid: number, limit: number): Promise<FarcasterCast[]> {
  const data = await snapchainFetch<SnapchainCastsResponse>("/castsByFid", {
    fid: String(fid),
    pageSize: String(limit),
    reverse: "true",
  });

  if (!data?.messages?.length) return [];

  return data.messages
    .filter((m) => m.data?.castAddBody?.text != null)
    .slice(0, limit)
    .map((m) => {
      const ts = m.data?.timestamp ?? 0;
      const hash = m.hash?.startsWith("0x") ? m.hash : undefined;
      return {
        text: (m.data?.castAddBody?.text ?? "").slice(0, 280),
        timestamp: farcasterTimestampToIso(ts),
        likes: 0,
        recasts: 0,
        hash,
      };
    });
}

async function fetchCastsFromV2(fid: number, limit: number): Promise<FarcasterCast[]> {
  const data = await neynarV2Fetch<V2CastsResponse>("/farcaster/feed/user/casts", {
    fid: String(fid),
    limit: String(limit),
  });

  if (!data?.casts) return [];

  return data.casts.map((c) => ({
    text: c.text.slice(0, 280),
    timestamp: c.timestamp,
    likes: c.reactions?.likes_count ?? 0,
    recasts: c.reactions?.recasts_count ?? 0,
    hash: c.hash,
  }));
}

export async function fetchFarcasterCasts(fid: number, limit = 8): Promise<FarcasterCast[]> {
  const snapchainCasts = await fetchCastsFromSnapchain(fid, limit);
  if (snapchainCasts.length > 0) {
    return snapchainCasts;
  }
  return fetchCastsFromV2(fid, limit);
}

export async function fetchFarcasterChannels(
  fid: number,
): Promise<Array<{ name: string; memberCount: number }>> {
  const data = await neynarV2Fetch<{
    channels?: Array<{
      name?: string;
      id?: string;
      follower_count?: number;
    }>;
  }>("/farcaster/user/channels", { fid: String(fid), limit: "6" });

  if (!data?.channels) return [];

  return data.channels
    .filter((c) => c.name || c.id)
    .map((c) => ({
      name: c.name || c.id || "channel",
      memberCount: c.follower_count ?? 0,
    }));
}
