import { BUILDER_PULL_QUOTES, BUILDER_PROFILE } from "@/content/builder-chronicle";
import type { EcosystemStatus } from "@/lib/landing-ecosystem";

export const LANDING_TAGLINE = "Build Together. Grow Together. Own Together." as const;

export const LANDING_HERO = {
  eyebrow: "DIGITAL NATION · LIVE",
  headline: "Who are you?",
  headlineAccent: "What can you build?",
  subhead:
    "Building Culture is identity, reputation, agents, and economy — one stack for builders who create real impact.",
  subheadSecondary:
    "Who am I · What can I do · What can I earn · What can I build · Who can help me. BCC is the economic layer underneath.",
  valueProps: [
    { label: "Claim .culture", emoji: "🪪" },
    { label: "Earn Culture Score", emoji: "📈" },
    { label: "Run AI Agents", emoji: "🤖" },
    { label: "Earn BCC", emoji: "🌱" },
    { label: "Build Together", emoji: "🤝" },
  ],
  ctas: {
    join: { label: "Join Building Culture", href: "/join" as const },
    explore: { label: "Explore Ecosystem", href: "#products" as const },
    contribute: { label: "Start Contributing", href: "/play" as const },
  },
} as const;

export type PillarProductId = "culture-id" | "campaign-hub" | "ai-agents" | "bcc";

export type ProductPageId = PillarProductId | "grant-proof";

export type PillarProductCopy = {
  id: ProductPageId;
  name: string;
  emoji: string;
  tagline: string;
  features: string[];
  productPageHref: string;
  primaryActionHref: string;
  primaryCta: string;
  status: EcosystemStatus;
};

/** Grant Proof product page — ecosystem satellite, not a core pillar. */
export const GRANT_PROOF_PRODUCT: PillarProductCopy = {
  id: "grant-proof",
  name: "Grant Proof",
  emoji: "🏆",
  tagline: "Transparent proof of impact.",
  features: [
    "Contributions",
    "Donations",
    "Rewards",
    "Grants",
    "Community milestones",
  ],
  productPageHref: "/products/grant-proof",
  primaryActionHref: "/grant-proof",
  primaryCta: "View verification",
  status: "live",
};

export const WHY_NOW_COPY = {
  eyebrow: "WHY NOW",
  headline: "Three waves.",
  headlineAccent: "One culture layer.",
  subhead:
    "The internet connected information. Blockchain connected value. AI connected intelligence. Building Culture connects identity, reputation, agents, and economy into one stack.",
  eras: [
    {
      id: "internet",
      label: "1990s–2000s",
      title: "Internet",
      body: "Information connected globally — websites, email, and the first digital communities.",
    },
    {
      id: "blockchain",
      label: "2010s",
      title: "Blockchain",
      body: "Value became programmable — wallets, tokens, and verifiable ownership on open rails.",
    },
    {
      id: "ai",
      label: "2020s",
      title: "AI",
      body: "Intelligence became accessible — agents, copilots, and autonomous workflows at scale.",
    },
    {
      id: "culture",
      label: "Now",
      title: "Culture Layer",
      body: "Identity + reputation + agents + economy — one portable stack for builders who create real impact.",
    },
  ],
} as const;

export type EcosystemFlowStep = {
  id: string;
  label: string;
  href: string;
};

export const ECOSYSTEM_FLOW_STEPS: EcosystemFlowStep[] = [
  { id: "user", label: "User", href: "/join" },
  { id: "culture", label: ".culture", href: "/pass" },
  { id: "score", label: "Culture Score", href: "/profile" },
  { id: "bcc", label: "BCC", href: "/bcc/dashboard" },
  { id: "agent", label: "Agent", href: "/agent-fleet" },
  { id: "marketplace", label: "Marketplace", href: "/marketplace" },
  { id: "community", label: "Community", href: "#ecosystem" },
];

export type FounderTimelineMilestone = {
  year: string;
  title: string;
  body: string;
};

export const FOUNDER_TIMELINE: FounderTimelineMilestone[] = [
  {
    year: "1998",
    title: "Websites",
    body: "Building on the open web when pages were still being invented — craft before crypto.",
  },
  {
    year: "2015",
    title: "Bitcoin",
    body: "Wallet-native value and programmable money — the shift from users to owners.",
  },
  {
    year: "2017",
    title: "NFTs",
    body: "Onchain culture objects — provenance, community, and digital identity experiments.",
  },
  {
    year: "2025",
    title: "Building Culture",
    body: "A culture economy on Base — identity, places, art, BCC utility, and proof-first communities.",
  },
  {
    year: "2026",
    title: "Culture Layer",
    body: "Five layers unified — community, identity, agents, economy, and capital in one digital nation.",
  },
];

export const PILLAR_PRODUCTS: PillarProductCopy[] = [
  {
    id: "culture-id",
    name: "Building Culture ID",
    emoji: "🆔",
    tagline: "Your portable Web3 reputation.",
    features: [
      "Proof of contribution",
      "Grant history",
      "Community participation",
      "Verifiable achievements",
      "Soulbound credentials",
    ],
    productPageHref: "/products/culture-id",
    primaryActionHref: "/pass",
    primaryCta: "Claim your .culture name",
    status: "live",
  },
  {
    id: "campaign-hub",
    name: "Campaign Hub",
    emoji: "🎯",
    tagline: "Create and support community campaigns.",
    features: [
      "Social impact",
      "Grants",
      "Fundraising",
      "Local initiatives",
      "Environmental projects",
    ],
    productPageHref: "/products/campaign-hub",
    primaryActionHref: "/play",
    primaryCta: "Browse campaigns",
    status: "live",
  },
  {
    id: "ai-agents",
    name: "Agent OS",
    emoji: "🤖",
    tagline: "Community-powered AI workforce.",
    features: [
      "Grant Agent",
      "Community Agent",
      "Marketing Agent",
      "Partnership Agent",
      "Research & Content Agents",
    ],
    productPageHref: "/products/ai-agents",
    primaryActionHref: "/agent-fleet",
    primaryCta: "Meet the fleet",
    status: "live",
  },
  {
    id: "bcc",
    name: "BCC",
    emoji: "🌱",
    tagline: "The economic layer underneath everything.",
    features: [
      "Staking & rewards",
      "Grant funding",
      "Agent shares",
      "Treasury transparency",
      "Community-owned capital",
    ],
    productPageHref: "/bcc/dashboard",
    primaryActionHref: "/bcc/dashboard",
    primaryCta: "Explore BCC",
    status: "live",
  },
];

export const MANIFESTO_LINES = [
  { contrast: "Most platforms extract value.", ours: "We distribute it." },
  { contrast: "Most platforms create users.", ours: "We create owners." },
  { contrast: "Most platforms chase attention.", ours: "We build culture." },
] as const;

export type SuccessStory = {
  id: string;
  category: "Builder" | "Campaign" | "Agent" | "Impact" | "Places";
  title: string;
  excerpt: string;
  href: string;
  external?: boolean;
};

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "builder",
    category: "Builder",
    title: BUILDER_PROFILE.displayName,
    excerpt: BUILDER_PULL_QUOTES[0],
    href: "/story",
  },
  {
    id: "campaign",
    category: "Campaign",
    title: "Fair drops & raffles",
    excerpt:
      "Community campaigns for art, stays, and culture — every ticket mint is verifiable on Base.",
    href: "/play",
  },
  {
    id: "agent",
    category: "Agent",
    title: "CEO Orchestrator",
    excerpt:
      "Eleven coordinated AI agents route growth, social, treasury, and grant workflows — aligned with ERC-8004.",
    href: "/agent-fleet",
  },
  {
    id: "impact",
    category: "Impact",
    title: "Ankommen AI",
    excerpt:
      "AI companion for newcomers in Austria — housing, benefits, documents, and jobs in 14 languages.",
    href: "https://ankommen.buildingcultureid.space",
    external: true,
  },
  {
    id: "places",
    category: "Places",
    title: "Community-funded real estate",
    excerpt:
      "Places brings compliance-gated investor journeys and RWA rails — real buildings, real transparency.",
    href: "/places",
  },
];

export const PLACES_LANE = {
  eyebrow: "REAL-WORLD IMPACT",
  headline: "We also bring",
  headlineAccent: "places back to life.",
  subhead:
    "Community-owned real estate is one proof lane — not the whole story. Invest in culture, property, and verifiable impact together.",
  investorHeadline: "Invest in more than property.",
  investorAccent: "Invest in culture.",
  investorSubhead:
    "Building Culture combines the physical, digital, and human layers of real estate — built for the next century of community capital.",
  ctas: {
    places: { label: "Explore Places", href: "/places" as const },
    investors: { label: "Investor deck", href: "/investors" as const },
  },
} as const;

export const FUTURE_NETWORK = {
  eyebrow: "BUILDING CULTURE NETWORK",
  headline: "A network where",
  promises: [
    "Every contribution matters",
    "Every reputation is portable",
    "Every community can thrive",
    "Every member can participate",
  ],
  closing: "Powered by AI. Secured by blockchain. Owned by community.",
} as const;

export const ROADMAP_SHIPPED = [
  "Building Culture ID",
  "Campaign Hub (Play)",
  "AI Agent Fleet",
  "Grant Proof verifier",
  "Building Culture Art",
  "WohnAI · AI Real Estate Agent",
  "Building Culture MiniApp",
  "Culture Atlas",
] as const;

export const ROADMAP_UPCOMING = [
  {
    title: "Portable reputation graph",
    note: "Cross-community credentials and contribution history",
  },
  {
    title: "Expanded Campaign Hub",
    note: "Grants, fundraising, and local initiative tooling",
  },
  {
    title: "Global Building Culture Network",
    note: "City-by-city expansion of the movement",
  },
  {
    title: "Tokenized Property Marketplace",
    note: "Onchain ownership of curated, real-world assets",
  },
] as const;

export function pillarById(id: PillarProductId): PillarProductCopy {
  const pillar = PILLAR_PRODUCTS.find((p) => p.id === id);
  if (!pillar) throw new Error(`Unknown pillar: ${id}`);
  return pillar;
}
