export type PaymentRail = "card" | "x402" | "on-chain" | "recurring";

const LABELS: Record<PaymentRail, string> = {
  card: "Card",
  x402: "USDC · x402",
  "on-chain": "Smart contract",
  recurring: "Card · monthly",
};

const STYLES: Record<PaymentRail, string> = {
  card: "border-lime-400/30 bg-lime-400/10 text-lime-200",
  x402: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  "on-chain": "border-violet-400/30 bg-violet-400/10 text-violet-200",
  recurring: "border-amber-400/30 bg-amber-400/10 text-amber-200",
};

export function PaymentRailBadge({ rail }: { rail: PaymentRail }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STYLES[rail]}`}
    >
      {LABELS[rail]}
    </span>
  );
}
