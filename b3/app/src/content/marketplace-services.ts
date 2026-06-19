/**
 * Marketplace service SKUs — x402 USDC deliverables backed by the agent delivery squad.
 */

export type ServiceBrief = Record<string, string>;

export type ServiceAgentRole =
  | "orchestrator"
  | "builder"
  | "qa"
  | "red_team"
  | "growth"
  | "finance"
  | "client_success";

export type ServiceBriefField = {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
};

export type ServiceMilestoneDef = {
  index: number;
  title: string;
  description: string;
  percentOfTotal: number;
};

export type ServiceMarginBreakdown = {
  apiInfraUsd: number;
  humanReviewHours: number;
  humanReviewRateUsd: number;
  reinvestPercent: number;
};

export type MarketplaceServiceSku = {
  slug: string;
  title: string;
  oneLiner: string;
  promise: string;
  deliverables: string[];
  milestones: ServiceMilestoneDef[];
  /** x402 kickoff / deposit price label, e.g. "$777" */
  kickoffPrice: string;
  /** Parsed numeric USDC for checkout */
  kickoffUsdc: number;
  retainerPrice?: string;
  retainerUsdc?: number;
  microPrice?: string;
  microUsdc?: number;
  agentSquad: ServiceAgentRole[];
  estimatedDays: number;
  briefFields: ServiceBriefField[];
  margin: ServiceMarginBreakdown;
  playbookNotes: string[];
};

export const SERVICE_AGENT_LABELS: Record<ServiceAgentRole, string> = {
  orchestrator: "Orchestrator (CEO)",
  builder: "Builder (BC Studio + deploy)",
  qa: "QA (smoke + human UAT)",
  red_team: "Red Team (security review)",
  growth: "Growth (Limx + Grove + SEO)",
  finance: "Finance (x402 + treasury)",
  client_success: "Client Success (intake + handoff)",
};

export const MARKETPLACE_SERVICES: MarketplaceServiceSku[] = [
  {
    slug: "svc-farcaster-777",
    title: "Farcaster Growth Agent",
    oneLiner: "Spin up a Farcaster agent persona and grow toward 777 verified web3 connections.",
    promise:
      "Human-reviewed posts, connection strategy, and weekly ops — no autonomous outbound without your approval.",
    deliverables: [
      "Farcaster agent persona brief + voice guide",
      "Connection growth plan toward 777 verified web3 builders",
      "Weekly content calendar (human-approved before publish)",
      "Grove + Limx growth experiments scoped to your niche",
      "Monthly progress report with connection metrics",
    ],
    milestones: [
      {
        index: 0,
        title: "Kickoff + persona setup",
        description: "Intake, voice guide, and first-week content plan.",
        percentOfTotal: 100,
      },
    ],
    kickoffPrice: "$777",
    kickoffUsdc: 777,
    retainerPrice: "$77/week",
    retainerUsdc: 77,
    agentSquad: ["orchestrator", "growth", "client_success", "qa", "finance"],
    estimatedDays: 14,
    briefFields: [
      {
        id: "brand",
        label: "Brand / project name",
        placeholder: "Your project or personal brand",
        required: true,
        maxLength: 120,
      },
      {
        id: "voice",
        label: "Voice & tone",
        placeholder: "How should posts sound? Topics to lean into or avoid?",
        required: true,
        multiline: true,
        maxLength: 2000,
      },
      {
        id: "goals",
        label: "Growth goals",
        placeholder: "Target audience, current Farcaster handle, connection count today",
        required: true,
        multiline: true,
        maxLength: 2000,
      },
    ],
    margin: {
      apiInfraUsd: 45,
      humanReviewHours: 12,
      humanReviewRateUsd: 55,
      reinvestPercent: 25,
    },
    playbookNotes: [
      "CEO queues grove_tick + social_burst after kickoff payment.",
      "All casts require inbox approval before publish.",
      "Retainer invoiced weekly via x402 link (separate from kickoff).",
    ],
  },
  {
    slug: "svc-funnel-full",
    title: "Full UI/UX Web Funnel",
    oneLiner: "Landing → funnel → product pages, mobile-first, Core Web Vitals + SEO baseline.",
    promise: "Deploy to the Building Culture stack with milestone sign-off at each 33% gate.",
    deliverables: [
      "Discovery brief + sitemap",
      "Mobile-first UI/UX for landing, funnel, and product pages",
      "Core Web Vitals + SEO baseline (Lighthouse gate)",
      "Staging deploy on BC stack with smoke checklist",
      "Handoff doc + 30-day fix window for critical bugs",
    ],
    milestones: [
      {
        index: 0,
        title: "Discovery + wireframes",
        description: "Sitemap, wireframes, and milestone 1 sign-off.",
        percentOfTotal: 33,
      },
      {
        index: 1,
        title: "Build + staging",
        description: "Implemented pages on staging with QA smoke pass.",
        percentOfTotal: 33,
      },
      {
        index: 2,
        title: "SEO + production deploy",
        description: "Lighthouse gate, red team review, production deploy.",
        percentOfTotal: 34,
      },
    ],
    kickoffPrice: "$2,777",
    kickoffUsdc: 2777,
    agentSquad: [
      "orchestrator",
      "builder",
      "qa",
      "red_team",
      "growth",
      "client_success",
      "finance",
    ],
    estimatedDays: 21,
    briefFields: [
      {
        id: "product",
        label: "Product / offer",
        placeholder: "What are you selling or launching?",
        required: true,
        maxLength: 500,
      },
      {
        id: "pages",
        label: "Pages needed",
        placeholder: "List pages: landing, pricing, FAQ, etc.",
        required: true,
        multiline: true,
        maxLength: 2000,
      },
      {
        id: "refs",
        label: "Reference links",
        placeholder: "Sites you like, brand assets, Figma links",
        multiline: true,
        maxLength: 2000,
      },
    ],
    margin: {
      apiInfraUsd: 120,
      humanReviewHours: 35,
      humanReviewRateUsd: 55,
      reinvestPercent: 25,
    },
    playbookNotes: [
      "Builder agent runs BC Studio + deploy_app per milestone.",
      "QA runs smoke_verify before each milestone handoff.",
      "Red team OWASP + wallet/connect review before production.",
    ],
  },
  {
    slug: "svc-replay-guy",
    title: "Replay Guy (Web3)",
    oneLiner: "Monitors Farcaster/X, drafts replies in your voice — you approve before send.",
    promise:
      "Social reply agent with human-in-the-loop approval. Demo the product by watching drafts in your inbox.",
    deliverables: [
      "Voice capture brief from your best posts/replies",
      "Farcaster + X monitoring for mentions and threads",
      "Draft replies in inbox (approve before send)",
      "Weekly engagement summary",
      "Optional micro x402 per draft for agent/automation buyers",
    ],
    milestones: [
      {
        index: 0,
        title: "Voice setup + first drafts",
        description: "Voice guide and first week of monitored drafts.",
        percentOfTotal: 100,
      },
    ],
    kickoffPrice: "$177/mo",
    kickoffUsdc: 177,
    microPrice: "$0.15/reply draft",
    microUsdc: 0.15,
    agentSquad: ["orchestrator", "growth", "client_success", "qa", "finance"],
    estimatedDays: 7,
    briefFields: [
      {
        id: "handles",
        label: "Social handles",
        placeholder: "Farcaster username, X handle, links to profile",
        required: true,
        maxLength: 500,
      },
      {
        id: "voice_samples",
        label: "Voice samples",
        placeholder: "Paste 3–5 replies or posts that sound like you",
        required: true,
        multiline: true,
        maxLength: 4000,
      },
      {
        id: "topics",
        label: "Topics & boundaries",
        placeholder: "What to engage on vs. ignore; competitors; tone limits",
        multiline: true,
        maxLength: 2000,
      },
    ],
    margin: {
      apiInfraUsd: 25,
      humanReviewHours: 4,
      humanReviewRateUsd: 55,
      reinvestPercent: 25,
    },
    playbookNotes: [
      "Inbox kind `replay` — drafts queue for approval.",
      "Reuse outreach approval pattern; no autonomous send.",
      "Monthly renewal via x402 or micro per draft.",
    ],
  },
];

export function getMarketplaceService(slug: string): MarketplaceServiceSku | undefined {
  return MARKETPLACE_SERVICES.find((s) => s.slug === slug);
}

export function serviceKickoffX402Price(sku: MarketplaceServiceSku): string {
  return `$${sku.kickoffUsdc.toFixed(sku.kickoffUsdc % 1 ? 2 : 0)}`;
}

export function serviceMarginEstimateUsd(sku: MarketplaceServiceSku): {
  cogs: number;
  labor: number;
  reinvest: number;
  margin: number;
} {
  const labor = sku.margin.humanReviewHours * sku.margin.humanReviewRateUsd;
  const cogs = sku.margin.apiInfraUsd + labor;
  const reinvest = (sku.kickoffUsdc * sku.margin.reinvestPercent) / 100;
  const margin = sku.kickoffUsdc - cogs - reinvest;
  return { cogs, labor, reinvest, margin };
}

export function servicesCatalogManifest(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, "");
  return {
    schema_version: "1",
    product: "buildchain_services_v1",
    services: MARKETPLACE_SERVICES.map((s) => ({
      slug: s.slug,
      title: s.title,
      kickoffUsdc: s.kickoffUsdc,
      kickoffPrice: s.kickoffPrice,
      retainerUsdc: s.retainerUsdc,
      microUsdc: s.microUsdc,
      page: `${base}/marketplace/services/${s.slug}`,
    })),
    checkout: `${base}/api/marketplace/services/checkout`,
    pay: `${base}/api/marketplace/services/pay`,
  };
}
