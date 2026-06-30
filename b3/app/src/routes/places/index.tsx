import { createFileRoute } from "@tanstack/react-router";

import { PlacesPortfolioHub } from "@/components/places/PlacesPortfolioHub";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/places/")({
  head: () =>
    pageHead({
      title: "Places Portfolio",
      description:
        "Tokenized Austrian real estate on Base — Berggasse flagship and curated RWA assets with REOC metadata and Chainlink-aligned compliance.",
      path: "/places",
      keywords: ["BUILDCHAIN", "places", "RWA", "real estate", "Berggasse", "Chainlink"],
    }),
  component: PlacesPortfolioPage,
});

function PlacesPortfolioPage() {
  return <PlacesPortfolioHub />;
}
