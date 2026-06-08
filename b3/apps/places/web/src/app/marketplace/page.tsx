import type { Metadata } from "next";
import { MarketplaceBrowse } from "@/components/rwa/MarketplaceBrowse";
import { MARKETPLACE_TAGLINE } from "@/lib/featured-listings";

export const metadata: Metadata = {
  title: `Marketplace — ${MARKETPLACE_TAGLINE}`,
  description: "Browse and invest in tokenized real estate on Base. Build. Believe. Trust.",
};

export default function MarketplacePage() {
  return <MarketplaceBrowse />;
}
