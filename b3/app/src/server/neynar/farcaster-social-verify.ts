import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import type { Cast } from "@neynar/nodejs-sdk/build/api/models/cast";
import { SearchCastsModeEnum } from "@neynar/nodejs-sdk/build/api/apis/cast-api";
import { getServerPublicOrigin } from "@/lib/app-origin";

export const FARCASTER_SOCIAL_TASK_SLUGS = [
  "follow-farcaster",
  "like-cast-farcaster",
  "share-app-farcaster",
] as const;

export type FarcasterSocialTaskSlug = (typeof FARCASTER_SOCIAL_TASK_SLUGS)[number];

function getClient(): NeynarAPIClient | null {
  const key = process.env.NEYNAR_API_KEY?.trim();
  if (!key) return null;
  return new NeynarAPIClient(new Configuration({ apiKey: key }));
}

export async function resolveFarcasterFidForAddress(
  client: NeynarAPIClient,
  address: `0x${string}`,
): Promise<number | null> {
  const addr = address.toLowerCase() as `0x${string}`;
  const res = await client.fetchBulkUsersByEthOrSolAddress({
    addresses: [addr],
    // Omit addressTypes — Neynar defaults to custody + verified; restricting to
    // verified-only caused many valid Warpcast users to miss FID resolution.
  });
  for (const list of Object.values(res)) {
    const u = list?.[0];
    if (u?.fid != null) return u.fid;
  }
  return null;
}

function normalizeCastHash(hash: string): string {
  return hash.trim().toLowerCase().replace(/^0x/, "");
}

/** First non-empty trimmed env among keys (server + optional VITE_ mirror for deploy parity). */
function firstEnv(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v) return v;
  }
  return undefined;
}

/** Extract Farcaster username from profile URLs (Warpcast or farcaster.xyz). */
function warpcastUsernameFromProfileUrl(raw: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "warpcast.com" && host !== "farcaster.xyz") return null;
    const seg = url.pathname
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .filter(Boolean);
    const user = seg[0];
    if (!user || !/^[a-zA-Z0-9._-]+$/.test(user)) return null;
    return user;
  } catch {
    return null;
  }
}

async function resolveFollowTargetFid(client: NeynarAPIClient): Promise<number | null> {
  const rawFid = firstEnv("NEYNAR_TARGET_FID") ?? "";
  const direct = Number.parseInt(rawFid, 10);
  if (Number.isFinite(direct) && direct > 0) return direct;

  const profileUrl = firstEnv(
    "FARCASTER_FOLLOW_URL",
    "NEYNAR_FOLLOW_PROFILE_URL",
    "VITE_FARCASTER_FOLLOW_URL",
  );
  if (!profileUrl) return null;
  const username = warpcastUsernameFromProfileUrl(profileUrl);
  if (!username) return null;
  try {
    const res = await client.lookupUserByUsername({ username });
    const fid = res.user?.fid;
    return fid != null && fid > 0 ? fid : null;
  } catch {
    return null;
  }
}

function targetCastRawFromEnv(): string | undefined {
  return firstEnv(
    "NEYNAR_TARGET_CAST",
    "NEYNAR_TARGET_CAST_HASH",
    "FARCASTER_TARGET_CAST_URL",
    "NEYNAR_TARGET_CAST_URL",
    "VITE_FARCASTER_TARGET_CAST_URL",
  );
}

/** Returns the cast hash as returned by Neynar (for API calls). */
export async function resolveTargetCastHash(client: NeynarAPIClient, raw: string): Promise<string> {
  const t = raw.trim();
  if (!t) throw new Error("neynar_cast_unconfigured");
  const r = await client.lookupCastByHashOrUrl({
    identifier: t,
    type: /^https?:\/\//i.test(t) ? "url" : "hash",
  });
  const h = r.cast?.hash;
  if (!h) throw new Error("neynar_cast_not_found");
  return h;
}

async function userFollowsTargetFid(
  client: NeynarAPIClient,
  viewerFid: number,
  targetFid: number,
): Promise<boolean> {
  let cursor: string | undefined;
  for (let i = 0; i < 50; i++) {
    const res = await client.fetchUserFollowing({
      fid: viewerFid,
      limit: 100,
      cursor,
    });
    for (const row of res.users) {
      if (row.user.fid === targetFid) return true;
    }
    const next = res.next?.cursor;
    if (!next) break;
    cursor = next;
  }
  return false;
}

async function userLikedCastHash(
  client: NeynarAPIClient,
  viewerFid: number,
  castHash: string,
): Promise<boolean> {
  const want = normalizeCastHash(castHash);
  let cursor: string | undefined;
  for (let i = 0; i < 50; i++) {
    const res = await client.fetchUserReactions({
      fid: viewerFid,
      type: "likes",
      limit: 100,
      cursor,
    });
    for (const r of res.reactions) {
      if (normalizeCastHash(r.cast.hash) === want) return true;
    }
    const next = res.next?.cursor;
    if (!next) break;
    cursor = next;
  }

  // Fallback: paginate cast likers (works if the user is not in the first page of "my likes")
  let c2: string | undefined;
  for (let j = 0; j < 20; j++) {
    const res2 = await client.fetchCastReactions({
      hash: castHash,
      types: ["likes"],
      limit: 100,
      cursor: c2,
    });
    for (const rx of res2.reactions) {
      if (rx.user.fid === viewerFid) return true;
    }
    const n2 = res2.next?.cursor;
    if (!n2) break;
    c2 = n2;
  }

  return false;
}

function castMatchesShare(cast: Cast, hostOrPhrase: string): boolean {
  const q = hostOrPhrase.trim().toLowerCase();
  if (!q) return false;
  if (cast.text?.toLowerCase().includes(q)) return true;
  for (const e of cast.embeds ?? []) {
    if ("url" in e && typeof e.url === "string" && e.url.toLowerCase().includes(q)) return true;
  }
  return false;
}

function shareSearchHostname(): string {
  const explicit = process.env.NEYNAR_SHARE_HOST?.trim();
  if (explicit) return explicit.replace(/^https?:\/\//, "").split("/")[0]!;
  try {
    return new URL(getServerPublicOrigin()).hostname;
  } catch {
    return "";
  }
}

/** Distinct substrings we accept in cast text or embeds (hostname + canonical origin). */
function shareMatchNeedles(): string[] {
  const host = shareSearchHostname().toLowerCase();
  const out = new Set<string>();
  if (host) {
    out.add(host);
    if (!host.startsWith("www.")) out.add(`www.${host}`);
  }
  try {
    const origin = getServerPublicOrigin().replace(/\/$/, "").toLowerCase();
    out.add(origin);
    const hn = new URL(origin).hostname.toLowerCase();
    out.add(hn);
    if (!hn.startsWith("www.")) out.add(`www.${hn}`);
  } catch {
    /* ignore */
  }
  return [...out].filter(Boolean);
}

function castMatchesAnyNeedle(cast: Cast, needles: string[]): boolean {
  for (const n of needles) {
    if (castMatchesShare(cast, n)) return true;
  }
  return false;
}

async function userCastIncludesShare(
  client: NeynarAPIClient,
  viewerFid: number,
  needles: string[],
): Promise<boolean> {
  const primary = needles[0];
  if (!primary) return false;

  for (const mode of [SearchCastsModeEnum.Literal, SearchCastsModeEnum.Hybrid] as const) {
    let cursor: string | undefined;
    for (let page = 0; page < 15; page++) {
      const res = await client.searchCasts({
        q: primary,
        mode,
        authorFid: viewerFid,
        limit: 50,
        cursor,
      });
      const casts = res.result?.casts ?? [];
      for (const c of casts) {
        if (c.author.fid === viewerFid && castMatchesAnyNeedle(c, needles)) return true;
      }
      const next = res.result?.next?.cursor;
      if (!next) break;
      cursor = next ?? undefined;
    }
  }

  let fcCursor: string | undefined;
  for (let page = 0; page < 8; page++) {
    const res = await client.fetchCastsForUser({
      fid: viewerFid,
      limit: 100,
      cursor: fcCursor,
      includeReplies: true,
    });
    for (const c of res.casts ?? []) {
      if (c.author.fid === viewerFid && castMatchesAnyNeedle(c, needles)) return true;
    }
    const next = res.next?.cursor;
    if (!next) break;
    fcCursor = next ?? undefined;
  }

  return false;
}

export async function verifyFarcasterSocialTask(
  slug: FarcasterSocialTaskSlug,
  walletAddress: `0x${string}`,
): Promise<{ ok: true } | { ok: false; code: string }> {
  const client = getClient();
  if (!client) {
    return { ok: false, code: "neynar_not_configured" };
  }

  const fid = await resolveFarcasterFidForAddress(client, walletAddress);
  if (fid == null) {
    return { ok: false, code: "no_farcaster_for_wallet" };
  }

  if (slug === "follow-farcaster") {
    const targetFid = await resolveFollowTargetFid(client);
    if (targetFid == null) return { ok: false, code: "neynar_target_fid_unset" };
    const ok = await userFollowsTargetFid(client, fid, targetFid);
    return ok ? { ok: true } : { ok: false, code: "not_following" };
  }

  if (slug === "like-cast-farcaster") {
    const raw = targetCastRawFromEnv();
    if (!raw) return { ok: false, code: "neynar_cast_unconfigured" };
    const hash = await resolveTargetCastHash(client, raw);
    const ok = await userLikedCastHash(client, fid, hash);
    return ok ? { ok: true } : { ok: false, code: "cast_not_liked" };
  }

  if (slug === "share-app-farcaster") {
    const needles = shareMatchNeedles();
    if (!needles.length) return { ok: false, code: "share_host_unconfigured" };
    const ok = await userCastIncludesShare(client, fid, needles);
    return ok ? { ok: true } : { ok: false, code: "share_not_found" };
  }

  return { ok: false, code: "unknown_task" };
}
