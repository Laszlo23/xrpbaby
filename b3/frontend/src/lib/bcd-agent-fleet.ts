/**
 * Building Culture “agent fleet” — narrative + routing for ERC-8004–style agents.
 * Register identities / reputation on-chain via ecosystem tools (e.g. 8004scan); keep keys off this bundle.
 *
 * @see https://8004scan.io/
 */

export type FleetAgentRole = "ceo" | "growth" | "social" | "trading" | "platform";

export type FleetAgent = {
  /** Must match `AgentShareCampaign` mint param `agentTypeId` (0–255). Fleet starts at 11 agents: 0–10. */
  id: number;
  slug: string;
  name: string;
  tagline: string;
  role: FleetAgentRole;
  /** One paragraph — product / ops intent, not a performance promise. */
  summary: string;
  /** How the agent uses wallets — custody notes only; never embed secrets in the client. */
  walletStrategy: string;
  /** Revenue / monetization surfaces (x402, referrals, mint routes, etc.). */
  monetization: string[];
  /** Pointer for ERC-8004 registration / reputation flows. */
  erc8004Note: string;
};

/** External references for builders registering agents. */
export const ERC8004_ECOSYSTEM_LINKS = {
  scan: "https://8004scan.io/",
} as const;

/**
 * Eleven starter agents: CEO orchestrates; growth + social capture attention;
 * trading personas describe BCD movement policy (execution remains in treasury scripts / contracts).
 */
export const AGENT_FLEET: FleetAgent[] = [
  {
    id: 0,
    slug: "ceo-orchestrator",
    name: "CEO Orchestrator",
    tagline: "Single routing brain for budgets, approvals, and agent hand-offs.",
    role: "ceo",
    summary:
      "Owns the task queue: chooses which sub-agent runs, enforces spend caps, and blocks flows that violate risk or brand rules. Emits structured jobs for workers (API) rather than holding private keys in the browser.",
    walletStrategy:
      "Uses a dedicated multisig or server wallet for orchestration fees only; never stores seed phrases in app env. Large moves require human sign-off off-app.",
    monetization: ["Coordinates fee routing from mints", "Approves x402-priced API tiers"],
    erc8004Note:
      "Register as the top-level identity in your stack; child agents reference this agent’s reputation context on 8004scan.",
  },
  {
    id: 1,
    slug: "growth-acquisition",
    name: "Growth — Acquisition",
    tagline: "Experiments, landing surfaces, and partner funnels.",
    role: "growth",
    summary:
      "Runs structured tests (copy, creative, partner drops) and logs outcomes for the CEO agent. Focus on measurable activation into wallet connect + first mint.",
    walletStrategy:
      "Optional promo wallet funded by marketing budget for paid placements — tracked in treasury spreadsheets, not in client code.",
    monetization: ["Partner rev-share", "Sponsored drop slots"],
    erc8004Note: "Good candidate for a public agent card describing funnel APIs.",
  },
  {
    id: 2,
    slug: "growth-retention",
    name: "Growth — Lifecycle",
    tagline: "Re-engagement, quests, and cohort nudges.",
    role: "growth",
    summary:
      "Targets returning players: mission reminders, leaderboard nudges, Strapi-driven story updates. Works with Points / XP loops already in the app.",
    walletStrategy:
      "Usually stateless; may request per-user payout proofs via SIWE-backed server jobs.",
    monetization: ["Upsell to premium APIs via x402", "Campaign co-promotions"],
    erc8004Note: "Reputation gains when feedback loops prove reliable engagement lifts.",
  },
  {
    id: 3,
    slug: "social-marketing-wallet",
    name: "Social Marketing + Wallet",
    tagline: "Paid social, Warpcast campaigns, tips — with a funded wallet.",
    role: "social",
    summary:
      "Executes social bursts (compose links, sponsored casts, creator stipends). Revenue intent: drive mints and marketplace volume; disclose sponsorship where required.",
    walletStrategy:
      "Custodial or MPC wallet controlled by ops with daily spend limits; rotate keys quarterly. All outbound txs logged.",
    monetization: ["Performance-linked promo budget", "Affiliate-style partner codes"],
    erc8004Note:
      "Ideal public agent: exposes rate cards + payment endpoints; tie feedback on 8004scan.",
  },
  {
    id: 4,
    slug: "farcaster-native",
    name: "Farcaster Native",
    tagline: "Mini-app + conversation loops on Warpcast.",
    role: "social",
    summary:
      "Optimizes Farcaster Mini App surfaces, frames, and social quests (e.g. Neynar-verified tasks). Keeps copy aligned with FAQ disclaimers.",
    walletStrategy:
      "Uses same treasury policy as Social Marketing; avoids automated signer on hot phones.",
    monetization: ["Social quest completion → retention → marketplace GMV"],
    erc8004Note: "Surface ERC-8004 identity when publishing automated responders.",
  },
  {
    id: 5,
    slug: "trading-bcd-treasury",
    name: "Trading — BCD Treasury",
    tagline: "Moves BCD per treasury playbook (accumulate, distribute, LP hints).",
    role: "trading",
    summary:
      "Operational face for BCD movement: routing rewards, liquidity adds, and transparency posts. Does not promise profit — executes policies approved by CEO + counsel.",
    walletStrategy:
      "Hardware or multisig treasury; swaps only through approved routers with slippage caps.",
    monetization: ["Spread capture on OTC/partner deals", "Treasury yield where legally viable"],
    erc8004Note: "Keep attestations for major treasury actions where supported.",
  },
  {
    id: 6,
    slug: "trading-execution",
    name: "Trading — Execution",
    tagline: "Signal ingestion → staged trades (human-gated at low maturity).",
    role: "trading",
    summary:
      "Consumes market + on-chain signals; proposes trades to CEO agent. Start in simulation / paper mode before mainnet automation.",
    walletStrategy:
      "Sub-wallet with tight allowance; circuit breaker stops trading after drawdown thresholds.",
    monetization: ["Fee share on profitable strategies after disclosures"],
    erc8004Note: "Publish capability boundaries on registration metadata.",
  },
  {
    id: 7,
    slug: "trading-risk",
    name: "Trading — Risk Guardian",
    tagline: "Circuit breakers, exposure caps, compliance screens.",
    role: "trading",
    summary:
      "Vetoes flows that breach limits (max single-trade %, jurisdiction lists, illiquid pools). Works as mandatory gate before Execution signs.",
    walletStrategy: "Read-mostly; may hold tiny gas wallet for oracle attestations.",
    monetization: ["Indirect — prevents catastrophic loss"],
    erc8004Note: "Reputation critical; accumulate positive validation signals.",
  },
  {
    id: 8,
    slug: "partnerships-bd",
    name: "Partnerships / BD",
    tagline: "Venues, creators, chains — deal packaging.",
    role: "growth",
    summary:
      "Structures co-branded drops and IRL tie-ins; hands structured payloads to Growth Acquisition.",
    walletStrategy: "Escrow contracts for milestone payouts preferred over informal transfers.",
    monetization: ["Rev-share agreements", "Co-funded mint pools"],
    erc8004Note: "Human-heavy; agent assists drafting + scheduling only.",
  },
  {
    id: 9,
    slug: "analytics-attribution",
    name: "Analytics / Attribution",
    tagline: "Closed-loop measurement for CEO reporting.",
    role: "platform",
    summary:
      "Joins on-chain events (mints, transfers) with off-chain campaigns. Powers dashboards for investors and internal stand-ups.",
    walletStrategy: "Typically keyless readers; optional signed publishes for oracle feeds.",
    monetization: ["Internal efficiency", "Investor reporting leverage"],
    erc8004Note: "Optional oracle publisher agent if you expose signed KPI feeds.",
  },
  {
    id: 10,
    slug: "x402-monetization",
    name: "x402 Monetization",
    tagline: "Sells API access via HTTP 402 / x402 flows.",
    role: "platform",
    summary:
      "Wraps premium endpoints (e.g. BUILDCHAIN analytics snippets) with thirdweb facilitator settlement — aligns with existing `/api/x402/premium` route.",
    walletStrategy:
      "Receives to configured paymaster / treasury addresses from env — see server x402 handler.",
    monetization: ["Per-call micropayments", "Tiered JSON payloads"],
    erc8004Note:
      "Strong fit for agent marketplace listings that advertise machine-readable pricing.",
  },
];

export const CEO_AGENT_ID = 0;

/** Lightweight routing table for orchestration stubs — extend server-side later. */
export const TASK_ROUTE_HINTS: Record<
  string,
  { primary: number; backups: number[]; notes: string }
> = {
  social_burst: {
    primary: 3,
    backups: [4, 1],
    notes: "Social Marketing leads; Farcaster Native assists; Acquisition funds paid slots.",
  },
  growth_experiment: {
    primary: 1,
    backups: [2, 8],
    notes: "Acquisition designs test; Lifecycle nurtures; BD supplies partner payloads.",
  },
  bcd_treasury_move: {
    primary: 5,
    backups: [7, 6],
    notes: "Treasury proposes; Risk vetoes; Execution signs if approved.",
  },
  monetize_api: {
    primary: 10,
    backups: [0],
    notes: "x402 agent prices calls; CEO overrides pricing in emergencies.",
  },
  executive_review: {
    primary: 0,
    backups: [9],
    notes: "CEO orchestrates; Analytics supplies metrics.",
  },
};

export function suggestAgentForTask(taskKey: string): FleetAgent | undefined {
  const hint = TASK_ROUTE_HINTS[taskKey];
  if (!hint) return AGENT_FLEET.find((a) => a.id === CEO_AGENT_ID);
  return AGENT_FLEET.find((a) => a.id === hint.primary) ?? AGENT_FLEET[0];
}
