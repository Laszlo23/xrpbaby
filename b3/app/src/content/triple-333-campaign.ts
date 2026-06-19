import { TRIPLE_333_BUCKET_USD, TRIPLE_333_ROUND_USD, TRIPLE_333_TICKET_GOAL } from "@/lib/packs";
import { TREASURY_SAFE_ADDRESS } from "@/lib/treasury-revenue-rules";

export type Triple333Bucket = {
  id: string;
  label: string;
  usd: number;
  description: string;
  walletLabel: string;
};

export const TRIPLE_333_BUCKETS: Triple333Bucket[] = [
  {
    id: "ai_ops",
    label: "AI & servers",
    usd: TRIPLE_333_BUCKET_USD,
    description: "Inference, RPC, hosting, databases, and CI for builders.",
    walletLabel: "Agent ops wallet",
  },
  {
    id: "winner",
    label: "Winner",
    usd: TRIPLE_333_BUCKET_USD,
    description: "One ticket holder after a verifiable on-chain or published draw.",
    walletLabel: "Prize escrow",
  },
  {
    id: "marketing",
    label: "Marketing",
    usd: TRIPLE_333_BUCKET_USD,
    description: "Creators, ads, Grove, and mini-app growth experiments.",
    walletLabel: "Growth multisig",
  },
];

export const TRIPLE_333_COPY = {
  title: "Triple 333",
  tagline: "Every round funds the machine, the myth, and the megaphone.",
  roundTotalUsd: TRIPLE_333_ROUND_USD,
  ticketGoal: TRIPLE_333_TICKET_GOAL,
  ticketPriceUsd: 3,
  treasurySafe: TREASURY_SAFE_ADDRESS,
  rules: [
    `${TRIPLE_333_TICKET_GOAL} tickets × $3 = $${TRIPLE_333_ROUND_USD} per round.`,
    `Each round splits equally: $${TRIPLE_333_BUCKET_USD} AI/ops · $${TRIPLE_333_BUCKET_USD} winner · $${TRIPLE_333_BUCKET_USD} marketing.`,
    "Pay with card (Stripe) or ETH on Base when the on-chain campaign is wired.",
    "Not an investment. No guaranteed return. See /legal/terms.",
  ],
} as const;
