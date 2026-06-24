export type PartnerFlowStep = {
  id: string;
  step: number;
  title: string;
  body: string;
  tag: string;
};

export type PartnerPrinciple = {
  title: string;
  detail: string;
};

export const PARTNER_ESCROW_HEADLINE = "How we do business with partners";

export const PARTNER_ESCROW_SUBHEAD =
  "No handshake deals. USDC locked on Base, service terms hashed on-chain, AI scores delivery, humans can veto — then the contract pays.";

export const PARTNER_FLOW_STEPS: PartnerFlowStep[] = [
  {
    id: "terms",
    step: 1,
    tag: "Terms",
    title: "Promise in JSON, bound by hash",
    body: "Telegram promos, channel ads, investor referrals — every deliverable, KPI, and deadline lives in canonical JSON. Only keccak256(metadata) goes on-chain. Change the terms, change the hash.",
  },
  {
    id: "escrow",
    step: 2,
    tag: "Escrow",
    title: "DAO locks USDC before work starts",
    body: "The treasury funds ServiceDealEscrow on Base. Money stays in the contract — not in a partner's wallet — until fulfillment is ruled.",
  },
  {
    id: "evidence",
    step: 3,
    tag: "Proof",
    title: "Provider submits evidence",
    body: "Analytics exports, UTM reports, screenshots, on-chain attribution. Evidence is hashed and anchored on-chain before any payout logic runs.",
  },
  {
    id: "ai",
    step: 4,
    tag: "AI oracle",
    title: "AI proposes payout (0–100%)",
    body: "Our evaluator compares KPIs vs evidence and proposes payoutBps — full pay, partial pay, or full refund. Reasoning is stored as auditable ruling JSON.",
  },
  {
    id: "council",
    step: 5,
    tag: "Human council",
    title: "Council can veto within 72h",
    body: "Ops multisig reviews AI reasoning and can override the payout during the veto window. Trust is optional; verification is default.",
  },
  {
    id: "settle",
    step: 6,
    tag: "Settle",
    title: "Contract splits automatically",
    body: 'After the window, anyone can settle. Provider receives their share; the DAO gets the remainder. No manual wire, no "we\'ll pay you later."',
  },
];

export const PARTNER_PRINCIPLES: PartnerPrinciple[] = [
  {
    title: "Measurable, not vibes",
    detail:
      "Every deal lists KPIs (members gained, wallet connects, impressions) with evidence types.",
  },
  {
    title: "Partial pay is native",
    detail:
      "6500 bps = 65% to provider, 35% back to treasury. No awkward renegotiation after the fact.",
  },
  {
    title: "Public by design",
    detail:
      "Deal hash, evidence hash, ruling hash — all verifiable. Partners and auditors read the same chain.",
  },
];

export const PARTNER_EXAMPLE_KPI = {
  title: "Example: Telegram channel promo",
  deliverables: [
    { label: "Pinned post (7 days)", weight: "40%", kpi: "200 new members" },
    { label: "UTM investor funnel", weight: "60%", kpi: "25 wallet connects" },
  ],
  amount: "1,000 USDC",
  outcomes: [
    { label: "Full delivery", payout: "100% to provider" },
    { label: "Partial (e.g. 90% of KPIs)", payout: "Weighted partial + refund" },
    { label: "Nothing delivered", payout: "100% refund to DAO" },
  ],
};
