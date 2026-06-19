import { Link } from "@tanstack/react-router";
import { ArrowRight, Coins, Droplets, Gift, RefreshCw, Sprout, Wallet } from "lucide-react";
import { RedemptionGateProgress } from "@/components/RedemptionGateProgress";
import { BCD_SYMBOL } from "@/lib/bcd-config";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

const LINKS = [
  {
    to: "/swap" as const,
    label: "Swap BCC",
    desc: "Trade on Base via DEX links.",
    Icon: RefreshCw,
  },
  {
    to: "/roots" as const,
    label: "Culture Roots",
    desc: "Treasury staking for believers & builders.",
    Icon: Sprout,
  },
  {
    to: "/liquidity" as const,
    label: "Liquidity hub",
    desc: "Pools, LP lessons, gate progress.",
    Icon: Droplets,
  },
  {
    to: "/wallet/packs" as const,
    label: "Culture packs",
    desc: "Fiat → points + 11.11% BCC bonus track.",
    Icon: Gift,
  },
  {
    to: "/presale" as const,
    label: "Presale",
    desc: "Fixed-price rounds when live.",
    Icon: Coins,
  },
  {
    to: "/profile" as const,
    label: "Earn points",
    desc: "Quests and SIWE tasks on profile.",
    Icon: Wallet,
  },
];

export function BccTokenHomePanel() {
  return (
    <section
      id="token-home"
      className="scroll-mt-24 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-black/40 to-black/80 p-6 md:p-10"
    >
      <p className="mono-label text-amber-200/80">TOKEN HOME</p>
      <h2 className="mt-2 font-heading text-2xl font-semibold text-white md:text-3xl">
        {BCD_SYMBOL} — one place for the economy
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
        {BRAND_DISPLAY_NAME} Coin ties drops, treasury programs, and community rewards. Earn Culture
        Points, watch the liquidity gate, swap when ready — no hidden promises.
      </p>

      <RedemptionGateProgress />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map(({ to, label, desc, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition hover:border-amber-500/30 hover:bg-white/[0.04]"
          >
            <Icon className="h-5 w-5 text-amber-300/90" aria-hidden />
            <span className="mt-3 font-heading font-semibold text-zinc-100">{label}</span>
            <span className="mt-1 text-xs text-zinc-500">{desc}</span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-[#C5FF41] opacity-0 transition group-hover:opacity-100">
              Open <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
