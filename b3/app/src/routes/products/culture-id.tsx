import { createFileRoute } from "@tanstack/react-router";

import { ProductPageLayout } from "@/components/products/ProductPageLayout";
import { pillarById } from "@/lib/landing-copy";
import { identityMintPriceShort } from "@/lib/identity/mint-price";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/products/culture-id")({
  head: () =>
    pageHead({
      title: "Building Culture ID — Portable Web3 Reputation",
      description:
        "Claim your .culture name on Base. Proof of contribution, grant history, community participation, and verifiable achievements.",
      path: "/products/culture-id",
      keywords: ["Building Culture ID", "culture pass", "Web3 identity", "reputation", "Base"],
    }),
  component: CultureIdProductPage,
});

function CultureIdProductPage() {
  const pillar = pillarById("culture-id");

  return (
    <ProductPageLayout pillar={pillar}>
      <div className="space-y-4 text-zinc-300">
        <h2 className="font-display text-2xl font-bold text-white">Portable reputation</h2>
        <p>
          Your Building Culture ID is a .culture name on Base — a portable identity layer that
          travels with you across campaigns, grants, and community modules.
        </p>
        <p>
          Mint for {identityMintPriceShort}. Pay with BCC for an 11.11% discount when the v2 pay
          rail is configured.
        </p>
      </div>
    </ProductPageLayout>
  );
}
