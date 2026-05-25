import type { CommunityProfile, SocialLink, SocialPlatform } from "./types";
import { strapiFetch } from "./strapi-http";

const KNOWN_PLATFORMS: SocialPlatform[] = [
  "twitter",
  "linkedin",
  "github",
  "discord",
  "telegram",
  "instagram",
  "youtube",
  "farcaster",
  "website",
  "other",
];

function normalizePlatform(raw: unknown): SocialPlatform {
  const s = typeof raw === "string" ? raw : "";
  return KNOWN_PLATFORMS.includes(s as SocialPlatform) ? (s as SocialPlatform) : "other";
}

function normalizeSocialLinks(raw: unknown): SocialLink[] | null {
  if (raw == null) return null;
  let arr: unknown[] = [];
  if (Array.isArray(raw)) arr = raw;
  else if (typeof raw === "object" && Array.isArray((raw as { data?: unknown[] }).data)) {
    arr = (raw as { data: unknown[] }).data;
  } else return null;

  const out: SocialLink[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const inner = (o.attributes as Record<string, unknown>) || {};
    const platformRaw = (o.platform ?? inner.platform) as string | undefined;
    const urlRaw = (o.url ?? inner.url) as string | undefined;
    const labelRaw = (o.label ?? inner.label) as string | undefined;
    if (!urlRaw?.trim()) continue;
    out.push({
      id: typeof o.id === "number" ? o.id : undefined,
      platform: normalizePlatform(platformRaw),
      url: String(urlRaw).trim(),
      label: labelRaw ? String(labelRaw) : null,
    });
  }
  return out.length ? out : null;
}

function unwrapData<T>(raw: unknown): T | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const inner = r.data;
  if (inner === null || inner === undefined) return null;
  if (Array.isArray(inner)) return (inner[0] as T) ?? null;
  return inner as T;
}

function normalizeGallery(g: unknown): CommunityProfile["gallery"] {
  if (!g) return null;
  if (Array.isArray(g)) return g as CommunityProfile["gallery"];
  if (typeof g === "object" && Array.isArray((g as { data?: unknown }).data)) {
    return (g as { data: NonNullable<CommunityProfile["gallery"]> }).data;
  }
  return null;
}

function normalizeMedia(m: unknown): CommunityProfile["avatar"] {
  if (!m || typeof m !== "object") return null;
  const o = m as Record<string, unknown>;
  if (Array.isArray(o.data)) return null;
  return m as CommunityProfile["avatar"];
}

function mapEntry(entry: Record<string, unknown>): CommunityProfile {
  const attrs = (entry.attributes as Record<string, unknown>) || {};
  const slug = String(entry.slug ?? attrs.slug ?? "");
  const displayName = String(entry.displayName ?? attrs.displayName ?? "");
  return {
    id: typeof entry.id === "number" ? entry.id : undefined,
    documentId: typeof entry.documentId === "string" ? entry.documentId : undefined,
    slug,
    displayName,
    headline: (entry.headline ?? attrs.headline) as string | null | undefined,
    bio: (entry.bio ?? attrs.bio) as string | null | undefined,
    focusTags: (entry.focusTags ?? attrs.focusTags) as string | null | undefined,
    ownerMasked: (entry.ownerMasked ?? attrs.ownerMasked) as string | null | undefined,
    ownerAddress: (entry.ownerAddress ?? attrs.ownerAddress) as string | null | undefined,
    avatar: normalizeMedia(entry.avatar ?? attrs.avatar),
    cover: normalizeMedia(entry.cover ?? attrs.cover),
    gallery: normalizeGallery(entry.gallery ?? attrs.gallery),
    socialLinks: normalizeSocialLinks(entry.socialLinks ?? attrs.socialLinks),
    walletLinks: (entry.walletLinks ?? attrs.walletLinks) as CommunityProfile["walletLinks"],
    visibility: (entry.visibility ?? attrs.visibility) as CommunityProfile["visibility"],
    contactEnabled: (entry.contactEnabled ?? attrs.contactEnabled) as boolean | null | undefined,
    contactPriceEth: (entry.contactPriceEth ?? attrs.contactPriceEth) as string | null | undefined,
    contactDestinationUrl: (entry.contactDestinationUrl ?? attrs.contactDestinationUrl) as
      | string
      | null
      | undefined,
    contactIntro: (entry.contactIntro ?? attrs.contactIntro) as string | null | undefined,
  };
}

export async function fetchProfileBySlug(slug: string): Promise<CommunityProfile | null> {
  const qs = new URLSearchParams();
  qs.set("filters[slug][$eq]", slug);
  qs.append("populate[avatar]", "*");
  qs.append("populate[cover]", "*");
  qs.append("populate[gallery]", "*");
  qs.append("populate[socialLinks]", "*");
  qs.append("populate[walletLinks]", "*");
  const res = await strapiFetch(`/api/community-profiles?${qs.toString()}`);
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  const json = (await res.json()) as { data?: unknown[] };
  const row = json.data?.[0];
  if (!row || typeof row !== "object") return null;
  return mapEntry(row as Record<string, unknown>);
}

async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const p = path.startsWith("/api") ? path : `/api${path}`;
  return strapiFetch(p, init);
}

export async function requestWalletNonce(
  address: string,
): Promise<{ nonce: string; statement: string }> {
  const res = await authFetch("/api/community-profiles/wallet/nonce", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Nonce failed: ${res.status}`);
  }
  const json = (await res.json()) as { data?: { nonce?: string; statement?: string } };
  const nonce = json.data?.nonce;
  const statement =
    json.data?.statement ?? "Sign in with Ethereum to BUILDCHAIN Community Profile.";
  if (!nonce) throw new Error("Invalid nonce response");
  return { nonce, statement };
}

export async function verifyWalletSignature(message: string, signature: string): Promise<string> {
  const res = await authFetch("/api/community-profiles/wallet/verify", {
    method: "POST",
    body: JSON.stringify({ message, signature }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Verify failed: ${res.status}`);
  }
  const json = (await res.json()) as { data?: { jwt?: string } };
  const jwt = json.data?.jwt;
  if (!jwt) throw new Error("Invalid verify response");
  return jwt;
}

export async function fetchMyProfile(): Promise<CommunityProfile | null> {
  const res = await authFetch("/api/community-profiles/my-profile");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Profile me failed: ${res.status}`);
  const json = (await res.json()) as { data?: unknown };
  const inner = unwrapData<Record<string, unknown>>(json);
  if (!inner) return null;
  return mapEntry(inner);
}

export async function createMyProfile(body: {
  slug: string;
  displayName: string;
  headline?: string;
  bio?: string;
  focusTags?: string;
  socialLinks?: unknown[];
  visibility?: Record<string, boolean>;
  contactEnabled?: boolean;
  contactPriceEth?: string;
  contactDestinationUrl?: string;
  contactIntro?: string;
}): Promise<CommunityProfile> {
  const res = await authFetch("/api/community-profiles/my-profile", {
    method: "POST",
    body: JSON.stringify({
      data: body,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Create failed: ${res.status}`);
  }
  const json = (await res.json()) as { data?: unknown };
  const inner = unwrapData<Record<string, unknown>>(json);
  if (!inner) throw new Error("Invalid create response");
  return mapEntry(inner);
}

export async function updateMyProfile(patch: Partial<CommunityProfile>): Promise<CommunityProfile> {
  const res = await authFetch("/api/community-profiles/my-profile", {
    method: "PUT",
    body: JSON.stringify({
      data: patch,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Save failed: ${res.status}`);
  }
  const json = (await res.json()) as { data?: unknown };
  const inner = unwrapData<Record<string, unknown>>(json);
  if (!inner) throw new Error("Invalid save response");
  return mapEntry(inner);
}

export async function linkExtraWallet(body: {
  chain: "solana" | "sui" | "bitcoin";
  address: string;
  label?: string;
  message?: string;
  signature?: string;
}): Promise<CommunityProfile> {
  const res = await authFetch("/api/community-profiles/my-profile/link-wallet", {
    method: "POST",
    body: JSON.stringify({ data: body }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Link wallet failed: ${res.status}`);
  }
  const json = (await res.json()) as { data?: unknown };
  const inner = unwrapData<Record<string, unknown>>(json);
  if (!inner) throw new Error("Invalid link response");
  return mapEntry(inner);
}
