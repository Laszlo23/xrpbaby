import type { ComputedCultureScore } from "@/lib/identity/culture-score";
import type {
  CultureIdentityGraph,
  MemberProfileBridge,
  Web3BioCredentials,
} from "@/lib/identity/identity-graph-types";
import type { ActivityCategory } from "@/lib/profile/founder-showcase";

export type { ActivityCategory };

export type ActivitySource = "curated" | "neynar" | "onchain";

export type ShowcaseActivityItem = {
  id: string;
  category: ActivityCategory;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string;
  authorHandle: string;
  source?: ActivitySource;
};

export type ShowcaseNftItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  chainLabel: string;
  openSeaUrl: string | null;
  isIdentity?: boolean;
};

export type CultureIdentityEnrichment = {
  ok: true;
  followerCount: number | null;
  neynarEnabled: boolean;
  avatarImageUrl: string | null;
  nfts: ShowcaseNftItem[];
  activity: Record<ActivityCategory, ShowcaseActivityItem[]>;
  web3bio: CultureIdentityGraph | null;
  credentials: Web3BioCredentials | null;
  cultureScore: ComputedCultureScore;
  member: MemberProfileBridge | null;
};

/** @deprecated Use CultureIdentityEnrichment */
export type ShowcaseEnrichment = CultureIdentityEnrichment;
