import type { Address } from "viem";

export type SocialBadge = {
  id: string;
  label: string;
  tier: "gold" | "primary";
  desc: string;
};

export type TimelineItem = {
  kind: "mint" | "badge" | "social" | "rep" | "cast";
  title: string;
  meta: string;
  days: number;
  href?: string;
};

export type CommunityItem = {
  name: string;
  members: number;
  role: string;
  imageUrl?: string;
};

export type FarcasterProfile = {
  fid: number;
  username: string;
  displayName: string;
  bio: string;
  pfpUrl: string;
  followerCount: number;
  followingCount: number;
  profileUrl: string;
  verifiedAccounts: Array<{ platform: string; username: string }>;
  verifiedAddresses: string[];
};

export type ResolvedName = {
  name: string;
  type: "basename" | "ens";
  avatarUrl?: string;
};

export type NftHolding = {
  contractAddress: string;
  tokenId: string;
  name: string;
  imageUrl?: string;
  isCultureLayer?: boolean;
};

export type SocialProfile = {
  status: "resolved" | "partial" | "empty";
  owner: Address;
  farcaster: FarcasterProfile | null;
  basename: ResolvedName | null;
  holdings: NftHolding[];
  badges: SocialBadge[];
  timeline: TimelineItem[];
  communities: CommunityItem[];
  cultureScore: number;
  followers: number;
  following: number;
  avatarUrl: string | null;
  displayName: string | null;
  accent: "gold" | "primary";
  sources: string[];
  warnings: string[];
};

export type SocialProviderResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
