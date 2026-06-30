"use client";

import Link from "next/link";

import { FeaturedPortfolioStrip } from "@/components/portfolio/FeaturedPortfolioStrip";
import { useFeaturedPortfolioCards } from "@/components/portfolio/useFeaturedPortfolioCards";

export function MarketplaceFeaturedPortfolio() {
  const cards = useFeaturedPortfolioCards("/marketplace");

  if (cards.length === 0) return null;

  return (
    <div className="space-y-4">
      <FeaturedPortfolioStrip cards={cards} title="Curated portfolio" />
      <p className="text-xs text-zinc-500">
        Reference economics — verify in issuer data room.{" "}
        <Link href="https://app.buildingcultureid.space/places" className="text-[hsl(38_25%_48%)] hover:underline">
          Full editorial portfolio on app ↗
        </Link>
      </p>
    </div>
  );
}
