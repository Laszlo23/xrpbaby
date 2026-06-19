import { BUILDER_PULL_QUOTES, BUILDER_PROFILE } from "@/content/builder-chronicle";
import type { EcosystemStatus } from "@/lib/landing-ecosystem";

export const LANDING_TAGLINE = "Build Together. Grow Together. Own Together." as const;

export const LANDING_NORTH_STAR =
  "Building Culture is the trust layer where people, communities, businesses, and AI agents build reputation, earn credentials, and unlock access together." as const;

export const LANDING_HERO = {
  eyebrow: "TRUST LAYER · LIVE ON BASE",
  headline: "Who are you?",
  headlineAccent: "What can you build?",
  subhead: "Create your Culture ID. Earn credentials. Build reputation. Unlock access.",
  valueProps: [
    { label: "Culture ID", emoji: "🪪" },
    { label: "Credentials", emoji: "📜" },
    { label: "Reputation", emoji: "⭐" },
    { label: "Access", emoji: "🔓" },
  ],
  ctas: {
    join: { label: "Join Building Culture", href: "/join" as const },
    explore: { label: "Explore credentials", href: "/credentials" as const },
    contribute: { label: "Claim Culture ID", href: "/pass" as const },
  },
} as const;

export type PillarProductId = "culture-id" | "credentials" | "reputation" | "access";

export type ProductPageId = PillarProductId | "grant-proof" | "campaign-hub" | "ai-agents" | "bcc";

export type PillarProductCopy = {
  id: ProductPageId;
  name: string;
  emoji: string;
  tagline: string;
  question: string;
  features: string[];
  productPageHref: string;
  primaryActionHref: string;
  primaryCta: string;
  status: EcosystemStatus;
  /** Landing nav anchor id */
  sectionId?: string;
};

/** Grant Proof product page — ecosystem satellite, not a core pillar. */
export const GRANT_PROOF_PRODUCT: PillarProductCopy = {
  id: "grant-proof",
  name: "Grant Proof",
  emoji: "🏆",
  tagline: "Transparent proof of impact.",
  question: "What impact can you prove?",
  features: ["Contributions", "Donations", "Rewards", "Grants", "Community milestones"],
  productPageHref: "/products/grant-proof",
  primaryActionHref: "/grant-proof",
  primaryCta: "View verification",
  status: "live",
};

export const WHY_NOW_COPY = {
  eyebrow: "WHY NOW",
  headline: "Four waves.",
  headlineAccent: "One trust layer.",
  subhead:
    "Information connected the world. Blockchains connected value. AI connected intelligence. Building Culture connects proof, reputation, and access for people and agents.",
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
      title: "Trust Layer",
      body: "Culture ID + verifiable credentials + portable reputation + gated access + agent economy — one stack that works across chains.",
    },
  ],
} as const;

export type EcosystemFlowStep = {
  id: string;
  label: string;
  href: string;
};

export const LANDING_FLOW_PRIMARY: EcosystemFlowStep[] = [
  { id: "culture-id", label: "Culture ID", href: "/pass" },
  { id: "credentials", label: "Credentials", href: "/credentials" },
  { id: "reputation", label: "Reputation", href: "/id/laszlo.culture/reputation" },
  { id: "access", label: "Access", href: "/credentials" },
];

export const LANDING_FLOW_SECONDARY: EcosystemFlowStep[] = [
  { id: "agents", label: "Agents", href: "/agent-os" },
  { id: "economy", label: "Economy", href: "/marketplace" },
];

/** @deprecated Use LANDING_FLOW_PRIMARY + LANDING_FLOW_SECONDARY */
export const ECOSYSTEM_FLOW_STEPS: EcosystemFlowStep[] = [
  ...LANDING_FLOW_PRIMARY,
  ...LANDING_FLOW_SECONDARY,
];

export const LANDING_FLOW_COPY = {
  eyebrow: "HOW IT WORKS",
  headline: "Culture ID → Credentials → Reputation → Access",
  body: "This is who you become — one identity loop for builders, communities, businesses, and agents.",
  secondaryLead: "Then agents work and value settles in the economy.",
} as const;

export const PILLARS_SECTION = {
  eyebrow: "THE TRUST LAYER",
  headline: "Culture ID → Credentials →",
  headlineAccent: "Reputation → Access",
  body: "Four questions every builder, community, business, and agent can answer — claim your ID, earn credentials, build reputation, unlock access.",
  ctas: {
    claim: { label: "Claim Culture ID", href: "/pass" as const },
    credentials: { label: "Explore credentials", href: "/credentials" as const },
  },
} as const;

export const TRUST_LAYER_SECTION = {
  eyebrow: "TRUST LAYER",
  headline: "The trust layer for builders and agents",
  body: "Claim your Culture ID. Earn credentials for real contributions. Turn proof into reputation. Unlock agents, campaigns, and marketplace tools. Settle value with BCC across chains.",
  ctas: {
    claim: { label: "Claim Culture ID", href: "/pass" as const },
    credentials: { label: "Explore credentials", href: "/credentials" as const },
  },
} as const;

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
    name: "Culture ID",
    emoji: "🆔",
    tagline: "Your portable identity anchor.",
    question: "Who are you?",
    features: [
      ".culture name on Base",
      "Linked wallets",
      "Credential wallet",
      "Public profile",
      "Portable across chains",
    ],
    productPageHref: "/products/culture-id",
    primaryActionHref: "/pass",
    primaryCta: "Claim Culture ID",
    status: "live",
    sectionId: "identity",
  },
  {
    id: "credentials",
    name: "Credentials",
    emoji: "📜",
    tagline: "Verifiable proof you can show.",
    question: "What have you done?",
    features: [
      "Builder Credential",
      "Contributor Credential",
      "Community Leader Credential",
      "Verified Human Credential",
      "Trusted Agent Credential",
      "Verified Project Credential",
    ],
    productPageHref: "/credentials",
    primaryActionHref: "/credentials",
    primaryCta: "View credentials",
    status: "live",
    sectionId: "credentials",
  },
  {
    id: "reputation",
    name: "Reputation",
    emoji: "⭐",
    tagline: "Trust that travels with you.",
    question: "Why should I trust you?",
    features: [
      "Culture Reputation score",
      "Contribution history",
      "Leaderboard ranking",
      "Portable across communities",
      "Human and agent profiles",
    ],
    productPageHref: "/id/laszlo.culture/reputation",
    primaryActionHref: "/credentials/leaderboard",
    primaryCta: "View leaderboard",
    status: "live",
    sectionId: "reputation",
  },
  {
    id: "access",
    name: "Access",
    emoji: "🔓",
    tagline: "Earned unlocks across the ecosystem.",
    question: "What can you unlock?",
    features: [
      "Campaigns & fair drops",
      "Grants & initiatives",
      "Marketplace tools",
      "Forest hub access",
      "Agent OS gates",
    ],
    productPageHref: "/products/campaign-hub",
    primaryActionHref: "/credentials",
    primaryCta: "Explore access",
    status: "live",
    sectionId: "access",
  },
];

/** Ecosystem product — not a core landing pillar. */
export const AGENT_OS_PRODUCT: PillarProductCopy = {
  id: "ai-agents",
  name: "Agent OS",
  emoji: "🤖",
  tagline: "Trusted agents with budgets.",
  question: "Who can help me?",
  features: [
    "Research Agent",
    "Grant Agent",
    "Limx revenue agent",
    "x402 paid APIs",
    "Human approval on outbound",
  ],
  productPageHref: "/products/ai-agents",
  primaryActionHref: "/agent-os",
  primaryCta: "Meet Agent OS",
  status: "live",
};

/** Capital layer — not a core landing pillar. */
export const BCC_PRODUCT: PillarProductCopy = {
  id: "bcc",
  name: "Economy (BCC)",
  emoji: "🌱",
  tagline: "Chain-agnostic value layer.",
  question: "What can you earn?",
  features: [
    "Culture Points → BCC",
    "Marketplace settlement",
    "Treasury transparency",
    "Agent shares",
    "Multi-rail ready",
  ],
  productPageHref: "/bcc/dashboard",
  primaryActionHref: "/bcc/dashboard",
  primaryCta: "Explore BCC",
  status: "live",
};

/** Campaign Hub product page — Access satellite, not a core pillar. */
export const CAMPAIGN_HUB_PRODUCT: PillarProductCopy = {
  id: "campaign-hub",
  name: "Campaign Hub",
  emoji: "🎯",
  tagline: "Create and support community campaigns.",
  question: "What can you unlock?",
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
};

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

const ALL_PRODUCT_COPY: PillarProductCopy[] = [
  ...PILLAR_PRODUCTS,
  AGENT_OS_PRODUCT,
  BCC_PRODUCT,
  GRANT_PROOF_PRODUCT,
  CAMPAIGN_HUB_PRODUCT,
];

export function pillarById(id: PillarProductId): PillarProductCopy {
  const pillar = PILLAR_PRODUCTS.find((p) => p.id === id);
  if (!pillar) throw new Error(`Unknown pillar: ${id}`);
  return pillar;
}

export function productById(id: ProductPageId): PillarProductCopy {
  const product = ALL_PRODUCT_COPY.find((p) => p.id === id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return product;
}
