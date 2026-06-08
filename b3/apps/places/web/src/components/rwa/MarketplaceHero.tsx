import Link from "next/link";
import { MARKETPLACE_SUBTAGLINE, MARKETPLACE_TAGLINE } from "@/lib/featured-listings";

export function MarketplaceHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bc-glass-strong bc-spotlight p-8 sm:p-10">
      <div className="relative z-10 max-w-2xl space-y-4">
        <p className="mono-label !text-bc-lime">RWA MARKETPLACE</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          <span className="bc-text-gradient">{MARKETPLACE_TAGLINE}</span>
        </h1>
        <p className="text-sm text-zinc-400 sm:text-base">{MARKETPLACE_SUBTAGLINE}</p>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
          Browse tokenized real estate on Base. Fractional shares with compliance gating — not the culture NFT
          marketplace. Reference economics in issuer materials.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/list"
            className="rounded-full bg-bc-lime px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white"
          >
            List a property
          </Link>
          <Link
            href="/marketplace/map"
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-white transition hover:border-bc-cyan/50"
          >
            Map view
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-bc-cyan/50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
