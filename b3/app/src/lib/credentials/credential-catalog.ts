/** Credential Center — catalog slugs and static metadata (mirrors DB seed). */

export const CREDENTIAL_SLUGS = [
  "builder",
  "contributor",
  "community-leader",
  "verified-human",
  "trusted-agent",
  "verified-project",
  "limited-merch-holder",
] as const;

export type CredentialSlug = (typeof CREDENTIAL_SLUGS)[number];

export type CredentialCatalogEntry = {
  slug: CredentialSlug;
  name: string;
  description: string;
  category: "human" | "builder" | "agent" | "project" | "community";
  purpose: string;
  unlocks: string[];
  earnSummary: string;
  icon: "hammer" | "seedling" | "crown" | "shield" | "bot" | "building" | "shirt";
  accent: string;
};

export const CREDENTIAL_CATALOG: CredentialCatalogEntry[] = [
  {
    slug: "builder",
    name: "Builder Credential",
    description: "Prove shipped work — Studio projects, grant milestones, and onchain deploys.",
    category: "builder",
    purpose: "Prove shipped work for grants, partners, and builder programs.",
    unlocks: ["BC Studio priority", "Builder Agent beta", "Grant-proof export badge"],
    earnSummary: "Publish a Studio project, verified grant contribution, or 3+ build tasks.",
    icon: "hammer",
    accent: "#C5FF41",
  },
  {
    slug: "contributor",
    name: "Contributor Credential",
    description: "Sustained community participation through quests, campaigns, and Culture Points.",
    category: "community",
    purpose: "Show consistent participation in the Building Culture ecosystem.",
    unlocks: ["Campaign Hub creator tools", "Culture Points multipliers", "Forest stage boost"],
    earnSummary: "500+ Culture Points, 10+ quests, or 3 campaign participations.",
    icon: "seedling",
    accent: "#00E5FF",
  },
  {
    slug: "community-leader",
    name: "Community Leader Credential",
    description: "Recognize organizers — referrals, ambassador tasks, and Farcaster reach.",
    category: "community",
    purpose: "Highlight trusted organizers and distribution partners.",
    unlocks: ["Ambassador program", "Co-marketing requests", "Leaderboard featured slot"],
    earnSummary: "5+ referrals, founding/elder tier, or 1k+ Farcaster followers with leader tasks.",
    icon: "crown",
    accent: "#FFD700",
  },
  {
    slug: "verified-human",
    name: "Verified Human Credential",
    description: "Sybil-resistant human verification for high-trust access.",
    category: "human",
    purpose: "Reduce bots and enable Places, treasury-adjacent, and high-value agent flows.",
    unlocks: ["Places investor flows", "High-value agent runs", "Verified badge on profile"],
    earnSummary: "Coinbase KYC, Human Passport, or other Web3.bio isHuman attestation.",
    icon: "shield",
    accent: "#839788",
  },
  {
    slug: "trusted-agent",
    name: "Trusted Agent Credential",
    description: "Onchain agent discovery trust for ERC-8004 and Limx-style wallets.",
    category: "agent",
    purpose: "Signal that an AI agent is registered, reviewed, and budget-capped.",
    unlocks: ["Agent OS catalog listing", "x402 discovery", "Public spend cap display"],
    earnSummary: "Registered agent.json + treasury review, or approved Limx/0G Agent ID.",
    icon: "bot",
    accent: "#A78BFA",
  },
  {
    slug: "verified-project",
    name: "Verified Project Credential",
    description: "Ecosystem apps with verifiable impact — Grant Proof, Places, Atlas.",
    category: "project",
    purpose: "Prove project legitimacy for grants, partners, and ecosystem map placement.",
    unlocks: ["Ecosystem map node", "Grant application auto-fill", "Partner directory"],
    earnSummary: "Grant Proof verification, Places compliance, or BC team issuance.",
    icon: "building",
    accent: "#C47C59",
  },
  {
    slug: "limited-merch-holder",
    name: "Limited Merch Holder",
    description: "Physical Building Culture tee with inside-label QR — clothing plus credential.",
    category: "community",
    purpose: "Prove you hold a numbered edition from a funded merch batch.",
    unlocks: [
      "Merch-holder channel access",
      "Edition serial on profile",
      "Culture Points on claim",
    ],
    earnSummary: "Buy a limited tee and scan the inside label at /merch/claim.",
    icon: "shirt",
    accent: "#D4AF37",
  },
];

export type CredentialCatalogItem = CredentialCatalogEntry & { tier: number };

export function getStaticCredentialCatalog(): CredentialCatalogItem[] {
  return CREDENTIAL_CATALOG.map((c) => ({ ...c, tier: 1 }));
}

export function credentialBySlug(slug: string): CredentialCatalogEntry | undefined {
  return CREDENTIAL_CATALOG.find((c) => c.slug === slug);
}

export const BC_ISSUER_SLUG = "building-culture";

export const ACCESS_RULES = [
  {
    slug: "grant-agent-contributor",
    resourceType: "agent",
    resourceId: "grant_agent",
    minReputation: null,
    requiredCredentialSlugs: ["contributor"],
    description: "Grant Agent runs require Contributor Credential or 100 BCC.",
  },
  {
    slug: "studio-builder",
    resourceType: "feature",
    resourceId: "studio_priority",
    minReputation: 3.5,
    requiredCredentialSlugs: ["builder"],
    description: "BC Studio priority queue for Builder Credential holders.",
  },
] as const;

export { QUEST_BADGES as QUEST_BADGE_CATALOG } from "@/components/rewards/BadgeRevealModal";
