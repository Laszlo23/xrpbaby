import { Link } from "@tanstack/react-router";

import { PaymentRailBadge, type PaymentRail } from "@/components/wallet/PaymentRailBadge";

type PaymentTile = {
  title: string;
  description: string;
  to: string;
  rail: PaymentRail;
  hash?: string;
};

const TILES: PaymentTile[] = [
  {
    title: "Culture packs",
    description: "One-time Culture Points — card checkout from $0.70",
    to: "/wallet/packs",
    rail: "card",
  },
  {
    title: "Culture Monthly",
    description: "€7/mo recurring — same points as the Culture pack each month",
    to: "/wallet/packs",
    rail: "recurring",
    hash: "subscribe",
  },
  {
    title: "Presale (on-chain)",
    description: "Buy BCC in the fixed-price sale round on Base",
    to: "/presale",
    rail: "on-chain",
  },
  {
    title: "BCC fair launch",
    description: "wBCC fair launch on BNB Chain",
    to: "/bcc/fair-launch",
    rail: "on-chain",
  },
  {
    title: "Marketplace",
    description: "Limited merch — pay with card or USDC on Base",
    to: "/marketplace/merch",
    rail: "x402",
  },
  {
    title: "API billing",
    description: "Pay-per-call for agents & trading — card or x402",
    to: "/billing",
    rail: "card",
  },
  {
    title: "Partner escrow",
    description: "USDC locked in ServiceDealEscrow on Base",
    to: "/how-we-partner",
    rail: "on-chain",
  },
];

export function WalletPaymentsGrid() {
  return (
    <section className="space-y-3">
      <div>
        <p className="mono-label text-zinc-500">Pay & earn</p>
        <p className="mt-1 text-sm text-zinc-400">
          Card (Stripe), USDC on Base (x402), or direct smart-contract checkout.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {TILES.map((tile) => (
          <Link
            key={tile.title}
            to={tile.to}
            hash={tile.hash}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-base font-semibold text-white">{tile.title}</p>
              <PaymentRailBadge rail={tile.rail} />
            </div>
            <p className="mt-2 text-xs text-zinc-400">{tile.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
