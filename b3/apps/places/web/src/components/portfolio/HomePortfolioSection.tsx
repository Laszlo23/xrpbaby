"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  FEATURED_PROPERTY_IDS,
  PortfolioGrid,
  PortfolioMarquee,
  buildPortfolioCard,
  buildPortfolioMarqueeStats,
  getCatalogEntry,
} from "@bc/places-portfolio";

import { NextPortfolioLink } from "@/components/portfolio/NextPortfolioLink";
import { getPlacesMediaOrigin } from "@/lib/places-origins";
import { usePropertyShareList } from "@/lib/usePropertyShareList";

export function HomePortfolioSection() {
  const mediaOrigin = getPlacesMediaOrigin();
  const { chainRows } = usePropertyShareList();

  const cards = useMemo(() => {
    return FEATURED_PROPERTY_IDS.map((propertyId) => {
      const row = chainRows.find((r) => r.id === BigInt(propertyId));
      const sharesLabel = row
        ? `${getCatalogEntry(propertyId)?.symbol ?? row.symbol} · on-chain`
        : `${getCatalogEntry(propertyId)?.symbol ?? "OG"} · on-chain`;

      return buildPortfolioCard({
        propertyId,
        placesSiteOrigin: mediaOrigin,
        detailHref: `/marketplace/${propertyId}`,
        sharesLabel,
      });
    }).filter(Boolean) as NonNullable<ReturnType<typeof buildPortfolioCard>>[];
  }, [chainRows, mediaOrigin]);

  return (
    <section className="places-portfolio relative z-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-[hsl(0_0%_5%)]">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-[hsl(0_0%_100%/0.1)] px-6 py-6 sm:flex-row sm:items-end sm:px-8">
        <div>
          <p className="pp-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(38_25%_48%)]">
            Curated portfolio
          </p>
          <h2 className="pp-display mt-2 text-2xl italic tracking-tight text-[hsl(30_15%_92%)] sm:text-3xl">
            Featured properties
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[hsl(30_10%_92%/0.5)]">
            Berggasse flagship plus three Austrian assets — REOC metadata and Chainlink-aligned compliance on Base.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/marketplace" className="pp-mono text-[11px] uppercase tracking-[0.15em] text-[hsl(38_25%_48%)] hover:underline">
            Full catalog →
          </Link>
          <a
            href="https://app.buildingcultureid.space/places"
            target="_blank"
            rel="noreferrer noopener"
            className="pp-mono text-[11px] uppercase tracking-[0.15em] text-[hsl(30_10%_92%/0.45)] hover:text-[hsl(30_15%_92%)]"
          >
            App portfolio ↗
          </a>
        </div>
      </div>

      <PortfolioMarquee stats={buildPortfolioMarqueeStats()} />
      <PortfolioGrid
        cards={cards}
        LinkComponent={NextPortfolioLink}
        onViewAllHref="/marketplace"
      />
    </section>
  );
}
