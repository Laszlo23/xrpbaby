"use client";

import Link from "next/link";
import { buildPortfolioMarqueeStats, PortfolioMarquee } from "@bc/places-portfolio";

export function HomePortfolioEditorialBand() {
  return (
    <div className="places-portfolio mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-white/[0.08] bg-[hsl(0_0%_5%)] text-left">
      <PortfolioMarquee stats={buildPortfolioMarqueeStats()} />
      <div className="border-t border-[hsl(0_0%_100%/0.1)] px-5 py-4 sm:px-6">
        <p className="pp-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(38_25%_48%)]">
          RWA portfolio · Base mainnet
        </p>
        <p className="pp-display mt-2 text-lg italic text-[hsl(30_15%_92%)] sm:text-xl">
          Berggasse flagship + three curated Austrian assets
        </p>
        <p className="mt-2 text-sm text-[hsl(30_10%_92%/0.5)]">
          Tokenized heritage with REOC metadata and Chainlink-aligned compliance — explore the full grid below.
        </p>
        <Link
          href="https://app.buildingcultureid.space/places"
          target="_blank"
          rel="noreferrer noopener"
          className="pp-mono mt-3 inline-block text-[11px] uppercase tracking-[0.15em] text-[hsl(38_25%_48%)] hover:underline"
        >
          App portfolio hub ↗
        </Link>
      </div>
    </div>
  );
}
