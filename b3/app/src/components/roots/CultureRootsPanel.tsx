import { Link } from "@tanstack/react-router";
import { ArrowRight, Sprout } from "lucide-react";
import { CultureRootsCountdown } from "@/components/roots/CultureRootsCountdown";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { BCD_SYMBOL } from "@/lib/bcd-config";

export function CultureRootsPanel() {
  return (
    <section className="scroll-mt-24 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-black/40 to-black/80 p-6 md:p-10">
      <p className="mono-label text-emerald-200/80">CULTURE ROOTS</p>
      <h2 className="mt-2 font-heading text-2xl font-semibold text-white md:text-3xl">
        Treasury staking for early believers
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
        The {BRAND_DISPLAY_NAME} treasury doesn&apos;t dump on believers — it grows roots with them.
        Lock {BCD_SYMBOL} in tiered pools; rewards stream from protocol allocation (not inflation).
        Builders earn boosted weight. No guaranteed returns.
      </p>

      <CultureRootsCountdown />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          to="/roots"
          className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition hover:border-emerald-500/30 hover:bg-white/[0.04]"
        >
          <Sprout className="h-5 w-5 text-emerald-300/90" aria-hidden />
          <span className="mt-3 font-heading font-semibold text-zinc-100">Plant roots</span>
          <span className="mt-1 text-xs text-zinc-500">
            Seedling, Builder Grove, Elder Canopy — stake, claim, dashboard.
          </span>
          <span className="mt-3 inline-flex items-center gap-1 text-xs text-[#C5FF41] opacity-0 transition group-hover:opacity-100">
            Open <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
        <Link
          to="/liquidity"
          className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition hover:border-amber-500/30 hover:bg-white/[0.04]"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Compare
          </span>
          <span className="mt-3 font-heading font-semibold text-zinc-100">LP vs Roots</span>
          <span className="mt-1 text-xs text-zinc-500">
            Aerodrome gauge staking is LP infrastructure — Culture Roots is pure BCC lock-up.
          </span>
          <span className="mt-3 inline-flex items-center gap-1 text-xs text-[#C5FF41] opacity-0 transition group-hover:opacity-100">
            Liquidity hub <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>
    </section>
  );
}
