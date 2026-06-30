import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2 } from "lucide-react";

/**
 * Clarifies Play experience drops vs compliance-gated property shares (Places / REOC).
 */
export function PlayPlacesBand() {
  return (
    <section
      id="places-lane"
      className="scroll-mt-24 border-b border-white/[0.06] bg-gradient-to-br from-[rgb(69_26_3/0.12)] via-[#070707] to-black px-4 py-10 md:scroll-mt-28 md:px-8 md:py-12"
      aria-labelledby="play-places-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-200">
            <Building2 className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
              Places · REOC
            </p>
            <h2
              id="play-places-heading"
              className="mt-2 font-heading text-xl font-semibold tracking-tight text-white md:text-2xl"
            >
              Property shares are a different lane than Play drops
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
              Tickets here unlock experiences and vault access. Tokenized Austrian real estate —
              Berggasse and curated assets — lives on Places with compliance-gated investor
              journeys.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/places"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#C47C59] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#d4926f] active:scale-[0.98]"
          >
            Explore Places
            <ArrowUpRight size={16} aria-hidden />
          </Link>
          <Link
            to="/investors"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:text-white active:scale-[0.98]"
          >
            Investor overview
            <ArrowUpRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
