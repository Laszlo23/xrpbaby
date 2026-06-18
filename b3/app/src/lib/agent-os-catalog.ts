/**
 * Building Culture Agent OS — public agent catalog (from agentos/building_culture_seed.json + XML).
 */

export type AgentOsStatus = "live" | "beta" | "coming_soon";

export type AgentOsAgent = {
  id: string;
  name: string;
  purpose: string;
  mainJob: string;
  approvalNeeded: boolean;
  status: AgentOsStatus;
  priceLabel: string | null;
  ctaRoute: string | null;
  ctaLabel: string | null;
};

export const AGENT_OS_PROJECT = {
  name: "Building Culture",
  tagline: "Pay with USDC on Base. Agents run 24/7 with human approval on outbound actions.",
  products: ["Community", "Identity", "Agents", "Economy", "Capital"],
} as const;

export const RESEARCH_AGENT_SYSTEM_PROMPT = `You are the Building Culture Research Agent. Your job is to research Web3, AI, ecosystem trends, competitors, grants, and product strategies for culture builders.

Rules:
- Never promise token price, guaranteed returns, or financial advice.
- Stay ethical, transparent, and practical for non-technical builders.
- Cite uncertainty when data may be stale.

Output format (markdown):
1) **Summary** — 2–4 sentences
2) **Key findings** — bullet list
3) **Comparison or options** — short table or bullets when relevant
4) **Recommendations** — 2–5 actionable next steps
5) **Risks or caveats** — if any`;

const BRAND_BLOCKLIST =
  /\b(100x|guaranteed returns|moon\b|airdrop hunter|price target|financial advice)\b/i;

export function researchBrandGuard(text: string): { ok: true } | { ok: false; reason: string } {
  if (BRAND_BLOCKLIST.test(text)) {
    return { ok: false, reason: "brand_guard_blocked" };
  }
  return { ok: true };
}

export function x402ResearchPrice(): string {
  return process.env.X402_RESEARCH_PRICE?.trim() || "$0.05";
}

/** Layer 3 agents — primary public catalog. */
export const AGENT_OS_CATALOG: AgentOsAgent[] = [
  {
    id: "research_agent",
    name: "Research Agent",
    purpose: "Web3, AI, ecosystem and competitor research",
    mainJob: "Research projects, markets, competitors, grants, and product strategies.",
    approvalNeeded: false,
    status: "live",
    priceLabel: x402ResearchPrice() + " / query (USDC on Base)",
    ctaRoute: "/agent-os",
    ctaLabel: "Run research",
  },
  {
    id: "marketing_agent",
    name: "Marketing Agent",
    purpose: "Social, campaigns, and onchain marketing (Grove)",
    mainJob: "Draft and schedule Farcaster, X, and campaign posts with human approval.",
    approvalNeeded: true,
    status: "beta",
    priceLabel: "Coming soon",
    ctaRoute: "/agent-os",
    ctaLabel: "Agent OS",
  },
  {
    id: "grant_agent",
    name: "Grant Agent",
    purpose: "Find grants, sponsorships, ecosystem funding",
    mainJob: "Create grant-ready proof pages and application drafts.",
    approvalNeeded: true,
    status: "live",
    priceLabel: "100 BCC / run",
    ctaRoute: "/agent-os#grant-agent",
    ctaLabel: "Run Grant Agent",
  },
  {
    id: "builder_agent",
    name: "Builder Agent",
    purpose: "Ship projects, pages, and proof artifacts (BC Studio)",
    mainJob: "Generate project pages, proof artifacts, and builder deliverables.",
    approvalNeeded: true,
    status: "beta",
    priceLabel: "Coming soon",
    ctaRoute: "/studio",
    ctaLabel: "BC Studio",
  },
];

/** Internal agents not surfaced in Layer 3 stack UI. */
export const SECONDARY_AGENTS: AgentOsAgent[] = [
  {
    id: "chief_of_staff",
    name: "Chief of Staff Agent",
    purpose: "Daily priorities, task management, roadmap coordination",
    mainJob: "Unify priorities, roadmap, posts, community, grants, and revenue tasks.",
    approvalNeeded: true,
    status: "coming_soon",
    priceLabel: null,
    ctaRoute: null,
    ctaLabel: null,
  },
  {
    id: "content_agent",
    name: "Content Agent",
    purpose: "Create Farcaster, LinkedIn, Telegram, Blog content",
    mainJob: "Turn one idea into posts across platforms.",
    approvalNeeded: true,
    status: "beta",
    priceLabel: "Coming soon",
    ctaRoute: null,
    ctaLabel: null,
  },
  {
    id: "community_agent",
    name: "Community Agent",
    purpose: "Onboarding, engagement, ambassador tracking",
    mainJob: "Welcome members, answer FAQs, track engagement, suggest ambassadors.",
    approvalNeeded: true,
    status: "beta",
    priceLabel: "Coming soon",
    ctaRoute: "/join",
    ctaLabel: "Join community",
  },
  {
    id: "growth_agent",
    name: "Growth Agent",
    purpose: "Partnerships, referrals, growth loops",
    mainJob: "Generate sustainable revenue pathways and partner pipeline.",
    approvalNeeded: true,
    status: "beta",
    priceLabel: "Coming soon",
    ctaRoute: "/campaign",
    ctaLabel: "Campaigns",
  },
];

export function getResearchAgent(): AgentOsAgent {
  const agent = AGENT_OS_CATALOG.find((a) => a.id === "research_agent");
  if (!agent) throw new Error("research_agent missing from catalog");
  return agent;
}
