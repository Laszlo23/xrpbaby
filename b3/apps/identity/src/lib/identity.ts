// Offchain placeholder profile data (XP, badges, communities) — SSR-safe deterministic mocks.
import {
  fetchIdentityByName,
  isContractConfigured,
  type OnchainIdentity,
} from "@/lib/chain/identityContract";
import { parseIdentityFullName } from "@/lib/chain/tlds";
import { fetchSocialProfile } from "@/lib/social/aggregate";
import type { SocialProfile } from "@/lib/social/types";

const ALL_BADGES = [
  { id: "founding", label: "Founding member", tier: "gold", desc: "Among the first 5,000 to claim identity on the culture layer." },
  { id: "verified", label: "Verified human", tier: "primary", desc: "Proof-of-personhood attested onchain." },
  { id: "farcaster", label: "Farcaster native", tier: "primary", desc: "Social graph + casts wired to this identity." },
  { id: "patron", label: "Patron", tier: "gold", desc: "Has supported 5+ creators on the network." },
  { id: "builder", label: "Builder", tier: "primary", desc: "Shipped a project tagged with this name." },
  { id: "resident", label: "Resident", tier: "primary", desc: "Verified physical residency tied to a .home claim." },
  { id: "salon", label: "Salon host", tier: "gold", desc: "Hosts a recurring token-gated salon." },
  { id: "dao-ops", label: "DAO operator", tier: "primary", desc: "Active governance role across 2+ DAOs." },
  { id: "architect", label: "Architect", tier: "primary", desc: "Practicing architect or studio principal." },
  { id: "early-base", label: "Early Base", tier: "gold", desc: "On Base before block 5M." },
  { id: "regen", label: "Regen", tier: "primary", desc: "Funds public goods on Gitcoin / Octant." },
  { id: "curator", label: "Curator", tier: "primary", desc: "Has shaped 3+ collections on the protocol." },
] as const;

const TIMELINE_TEMPLATES = [
  { kind: "mint", title: "Identity minted", meta: "block #18,210,442 · Base mainnet" },
  { kind: "badge", title: "Earned Verified Human", meta: "world id · proof attested" },
  { kind: "social", title: "Linked Farcaster", meta: "fid 21084 · @{handle}" },
  { kind: "rep", title: "+420 XP — Salon participation", meta: "tribeca.home · 4 attendees vouched" },
  { kind: "badge", title: "Earned Patron", meta: "supported 5 creators · 0.42 ETH lifetime" },
  { kind: "social", title: "Joined .culture DAO", meta: "vote weight 1.4x · founding boost" },
] as const;

const COMMUNITY_TEMPLATES = [
  { name: "Salon Tribeca", members: 412, role: "Resident" },
  { name: ".culture DAO", members: 2104, role: "Founding voter" },
  { name: "Base Builders", members: 8841, role: "Member" },
  { name: "Atelier Network", members: 318, role: "Curator" },
];

// Fast deterministic hash (FNV-1a) — never random, never wall-clock.
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rngFor(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function shortHex(n: number, len = 4) {
  return n.toString(16).padStart(8, "0").slice(0, len);
}

export type IdentityProfile = ReturnType<typeof profileFor>;

export type ProfileView =
  | { kind: "unclaimed"; fullName: string }
  | {
      kind: "claimed";
      onchain: OnchainIdentity;
      social: IdentityProfile;
      socialGraph: SocialProfile;
    };

export async function getProfileView(fullName: string): Promise<ProfileView> {
  const parsed = parseIdentityFullName(fullName);
  if (!parsed) {
    throw new Error("Invalid identity name");
  }

  if (!isContractConfigured) {
    throw new Error(
      "Identity contract is not configured. Set VITE_IDENTITY_CONTRACT_ADDRESS in your environment.",
    );
  }

  const onchain = await fetchIdentityByName(fullName);
  const canonical = `${parsed.handle}.${parsed.tld}`;

  if (!onchain) {
    return { kind: "unclaimed", fullName: canonical };
  }

  const [social, socialGraph] = await Promise.all([
    Promise.resolve(profileFor(onchain.fullName)),
    fetchSocialProfile(onchain.owner, onchain),
  ]);

  return { kind: "claimed", onchain, social, socialGraph };
}

/** Placeholder social/reputation modules only — not onchain owner or mint date. */
export function profileFor(fullName: string) {
  const clean = fullName.toLowerCase().trim();
  const parts = clean.split(".");
  const handle = parts[0] || "unknown";
  const tld = parts[1] || "culture";

  const seed = hash(clean);
  const rng = rngFor(seed);

  const address =
    "0x" +
    shortHex(seed, 8) +
    shortHex(hash(clean + "a") >>> 0, 8) +
    shortHex(hash(clean + "b") >>> 0, 8) +
    shortHex(hash(clean + "c") >>> 0, 8) +
    shortHex(hash(clean + "d") >>> 0, 8);

  const xp = Math.floor(rng() * 9200 + 800);
  const level = Math.min(99, Math.floor(xp / 250) + 1);
  const nextLevelXp = level * 250;
  const progress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  const badgeCount = 3 + Math.floor(rng() * 4);
  const indices = new Set<number>();
  while (indices.size < badgeCount) {
    indices.add(Math.floor(rng() * ALL_BADGES.length));
  }
  const badges = Array.from(indices).map((i) => ALL_BADGES[i]);

  const mintedDays = Math.floor(rng() * 320 + 12);
  const mintedAt = new Date(Date.UTC(2026, 0, 1) - mintedDays * 86400_000);

  const followers = Math.floor(rng() * 18000 + 240);
  const following = Math.floor(rng() * 800 + 40);
  const vouches = Math.floor(rng() * 90 + 8);

  const timeline = TIMELINE_TEMPLATES.map((t, i) => ({
    ...t,
    meta: t.meta.replace("{handle}", handle),
    days: Math.floor(rng() * 40) + i * 12,
  }));

  const communities = COMMUNITY_TEMPLATES.slice(0, 2 + Math.floor(rng() * 2));

  const isGold = badges.some((b) => b.tier === "gold");

  return {
    fullName: `${handle}.${tld}`,
    handle,
    tld,
    address,
    shortAddress: `${address.slice(0, 6)}…${address.slice(-4)}`,
    xp,
    level,
    nextLevelXp,
    progress,
    badges,
    mintedAt,
    followers,
    following,
    vouches,
    timeline,
    communities,
    accent: isGold ? ("gold" as const) : ("primary" as const),
  };
}
