export const FOUNDER_SHOWCASE_NAME = "laszlo.culture";

export type ActivityCategory = "product" | "community" | "onchain" | "social";

export type FeaturedBuildStatus = "live" | "beta" | "exploring";

export type FeaturedBuild = {
  id: string;
  title: string;
  description: string;
  status: FeaturedBuildStatus;
  href: string;
};

export type CultureScoreDimension = {
  id: string;
  label: string;
  percent: number;
};

export type CultureScoreRank = {
  label: string;
  rank?: number;
};

export type BuilderSignalItem = {
  id: string;
  label: string;
};

export type FounderMetricsConfig = {
  followerFallback: number;
  productCountLabel: string;
  communityOwnedLabel: string;
};

export type EcosystemNode = {
  id: string;
  label: string;
  href?: string;
  externalUrl?: string;
};

export type CuratedActivityItem = {
  id: string;
  category: ActivityCategory;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: string;
  authorHandle: string;
};

export type FounderShowcaseConfig = {
  displayName: string;
  handle: string;
  /** @deprecated use heroHeadline + heroManifesto */
  bio: string;
  heroHeadline: string;
  heroManifesto: string[];
  /** Blue punk PFP — replace with laszlo-blue-punk.webp when available */
  avatarUrl: string | null;
  warpcastPersonalUrl: string;
  warpcastBrandUrl: string;
  warpcastPersonalUsername: string;
  warpcastBrandUsername: string;
  exploreHref: string;
  contactEmail: string;
  partnerHref: string;
  cultureScore: number;
  cultureScoreNote: string;
  cultureScoreRank: CultureScoreRank;
  cultureScoreDimensions: CultureScoreDimension[];
  metrics: FounderMetricsConfig;
  ecosystemRoot: string;
  ecosystemNodes: EcosystemNode[];
  curatedActivity: CuratedActivityItem[];
  featuredBuilds: FeaturedBuild[];
  builderSignals: BuilderSignalItem[];
  collaboration: {
    title: string;
    body: string;
    lookingFor: string[];
    ctaLabel: string;
    ctaHref: string;
  };
};

const STATUS_LABEL: Record<FeaturedBuildStatus, string> = {
  live: "Live",
  beta: "Beta",
  exploring: "Exploring",
};

export function featuredBuildStatusLabel(status: FeaturedBuildStatus): string {
  return STATUS_LABEL[status];
}

export function isFounderShowcaseProfile(fullName: string): boolean {
  return fullName.trim().toLowerCase() === FOUNDER_SHOWCASE_NAME;
}

export function getFounderShowcaseConfig(fullName: string): FounderShowcaseConfig | null {
  if (!isFounderShowcaseProfile(fullName)) return null;
  return LASZLO_SHOWCASE;
}

export const LASZLO_ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: "ai-agents", label: "AI Agents", href: "/agent-os" },
  { id: "campaign-hub", label: "Campaign Hub", href: "/play" },
  { id: "grant-proof", label: "Grant Proof", href: "/grant-proof" },
  {
    id: "culture-atlas",
    label: "Culture Atlas",
    externalUrl: "https://buildingcultureid.space/demo/atlas/",
  },
  { id: "wohnai", label: "WohnAI", externalUrl: "https://wohnai.buildingcultureid.space/" },
  { id: "bcdai", label: "BCDAI", externalUrl: "https://bcdai.buildingcultureid.space/" },
  { id: "earth", label: "Earth Layer", href: "/earth" },
  { id: "bcc", label: "BCC Token", href: "/mission" },
];

export const LASZLO_CURATED_ACTIVITY: CuratedActivityItem[] = [
  {
    id: "milestone-agent-os",
    category: "product",
    title: "Agent OS dashboard",
    excerpt:
      "Budget-conscious Agent OS with x402-paid Research agent — browser agents for growth, research, and coordination.",
    url: "/agent-os",
    publishedAt: "2026-03-01T12:00:00.000Z",
    authorHandle: "buildingcultu3",
  },
  {
    id: "milestone-grant-proof",
    category: "product",
    title: "Grant Proof verifier",
    excerpt: "Transparent proof of impact — verifiable contributions, grants, and community milestones.",
    url: "/grant-proof",
    publishedAt: "2026-01-15T10:00:00.000Z",
    authorHandle: "buildingcultu3",
  },
  {
    id: "milestone-culture-layer",
    category: "onchain",
    title: "Culture Layer identity #1",
    excerpt: "laszlo.culture minted on Base — founding Culture Layer name and portable reputation anchor.",
    url: "/id/laszlo.culture",
    publishedAt: "2025-11-01T08:00:00.000Z",
    authorHandle: "bihary41418",
  },
  {
    id: "milestone-culture-atlas",
    category: "community",
    title: "Culture Atlas open call",
    excerpt: "Community-owned cultural archive — musicians, storytellers, and curators welcome to contribute.",
    url: "/creators",
    publishedAt: "2025-10-20T14:00:00.000Z",
    authorHandle: "buildingcultu3",
  },
  {
    id: "milestone-bcc-base",
    category: "onchain",
    title: "BCC on Base mainnet",
    excerpt: "Community credits live on Base — earn, hold, and participate in the culture economy.",
    url: "/mission",
    publishedAt: "2025-09-01T09:00:00.000Z",
    authorHandle: "buildingcultu3",
  },
  {
    id: "milestone-campaign-hub",
    category: "product",
    title: "Campaign Hub shipped",
    excerpt: "Fair drops, raffles, and community campaigns — the main member loop for Building Culture.",
    url: "/play",
    publishedAt: "2025-08-01T11:00:00.000Z",
    authorHandle: "buildingcultu3",
  },
  {
    id: "milestone-building-culture",
    category: "product",
    title: "Building Culture platform",
    excerpt: "Proof-first culture economy on Base — identity, places, art, BCC utility, and community ownership.",
    url: "/",
    publishedAt: "2025-05-17T16:00:00.000Z",
    authorHandle: "bihary41418",
  },
  {
    id: "milestone-join",
    category: "community",
    title: "Community growth",
    excerpt: "Join Building Culture — onboarding, quests, and Forest hub for builders and creators.",
    url: "/join",
    publishedAt: "2025-06-01T10:00:00.000Z",
    authorHandle: "buildingcultu3",
  },
];

export const LASZLO_SHOWCASE: FounderShowcaseConfig = {
  displayName: "Laszlo Bihary",
  handle: "laszlo.culture",
  bio: "Building Culture — a reputation layer for humans, builders, communities and AI agents.",
  heroHeadline: "Building Culture.",
  heroManifesto: [
    "A reputation layer for humans, builders, communities and AI agents.",
    "Turning participation into ownership.",
    "Turning culture into capital.",
    "Turning identity into proof.",
  ],
  avatarUrl: "/profile/laszlo-blue-punk.svg",
  warpcastPersonalUrl: "https://warpcast.com/bihary41418",
  warpcastBrandUrl: "https://warpcast.com/buildingcultu3",
  warpcastPersonalUsername: "bihary41418",
  warpcastBrandUsername: "buildingcultu3",
  exploreHref: "/products/ai-agents",
  contactEmail: "laszlo.bihary@gmail.com",
  partnerHref: "mailto:laszlo.bihary@gmail.com?subject=Building%20Culture%20partnership",
  cultureScore: 6.801,
  cultureScoreNote: "from Farcaster + onchain",
  cultureScoreRank: {
    label: "Top 2% of Culture Layer builders",
  },
  cultureScoreDimensions: [
    { id: "social", label: "Social Reach", percent: 28 },
    { id: "onchain", label: "Onchain Activity", percent: 22 },
    { id: "badges", label: "Badges", percent: 15 },
    { id: "age", label: "Identity Age", percent: 12 },
    { id: "ecosystem", label: "Ecosystem Participation", percent: 23 },
  ],
  metrics: {
    followerFallback: 2679,
    productCountLabel: "20+",
    communityOwnedLabel: "100%",
  },
  ecosystemRoot: "Culture Layer",
  ecosystemNodes: LASZLO_ECOSYSTEM_NODES,
  curatedActivity: LASZLO_CURATED_ACTIVITY,
  featuredBuilds: [
    {
      id: "building-culture",
      title: "Building Culture",
      description:
        "AI-powered identity, reputation, and community layer for onchain builders.",
      status: "live",
      href: "/",
    },
    {
      id: "mangrove-ai",
      title: "Mangrove AI",
      description: "AI-powered tree counting and impact verification system.",
      status: "beta",
      href: "#",
    },
    {
      id: "tokenized-re",
      title: "Tokenized Real Estate",
      description:
        "Experiments around RWA, ownership, and real estate-backed digital assets.",
      status: "exploring",
      href: "/products/culture-id",
    },
    {
      id: "agent-ecosystem",
      title: "Agent Ecosystem",
      description:
        "Browser-based AI agents for growth, automation, research, and autonomous business workflows.",
      status: "live",
      href: "/agent-os",
    },
  ],
  builderSignals: [
    { id: "web", label: "25+ years building for the web" },
    { id: "marketing", label: "15+ years digital marketing & SEO" },
    { id: "btc", label: "Early Bitcoin & NFT adopter" },
    { id: "gitcoin", label: "Gitcoin Citizen" },
    { id: "base", label: "Building on Base" },
    { id: "founder", label: "Founder of Building Culture" },
  ],
  collaboration: {
    title: "Open to builders, partners, investors, and culture-aligned collaborators.",
    body: "Building Culture is growing into an AI-powered identity and reputation layer for creators, builders, communities, and onchain ecosystems.",
    lookingFor: [
      "Strategic partners",
      "Investors",
      "Growth experts",
      "Web3 communities",
      "Grant opportunities",
      "Distribution partners",
    ],
    ctaLabel: "Start a conversation",
    ctaHref: "mailto:laszlo.bihary@gmail.com?subject=Building%20Culture%20collaboration",
  },
};

export function ecosystemNodeHref(node: EcosystemNode): string | undefined {
  return node.href ?? node.externalUrl;
}

export function isExternalEcosystemNode(node: EcosystemNode): boolean {
  return !node.href && Boolean(node.externalUrl);
}

export function openSeaAssetUrl(
  chainId: number | undefined,
  contract: string | undefined,
  tokenId: string | undefined,
): string | null {
  if (!contract || !tokenId) return null;
  if (chainId === 8453 || chainId === undefined) {
    return `https://opensea.io/assets/base/${contract}/${tokenId}`;
  }
  return `https://opensea.io/assets/base/${contract}/${tokenId}`;
}
