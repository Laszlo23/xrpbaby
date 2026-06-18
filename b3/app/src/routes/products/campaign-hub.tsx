import { createFileRoute } from "@tanstack/react-router";

import { ProductPageLayout } from "@/components/products/ProductPageLayout";
import { pillarById } from "@/lib/landing-copy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/products/campaign-hub")({
  head: () =>
    pageHead({
      title: "Campaign Hub — Community Campaigns & Impact",
      description:
        "Create and support community campaigns — social impact, grants, fundraising, local initiatives, and environmental projects.",
      path: "/products/campaign-hub",
      keywords: ["Campaign Hub", "community campaigns", "grants", "fundraising", "Building Culture"],
    }),
  component: CampaignHubProductPage,
});

function CampaignHubProductPage() {
  const pillar = pillarById("campaign-hub");

  return (
    <ProductPageLayout pillar={pillar}>
      <div className="space-y-4 text-zinc-300">
        <h2 className="font-display text-2xl font-bold text-white">Fair drops, real impact</h2>
        <p>
          Campaign Hub is where communities launch and support initiatives — raffle tickets for art,
          stays, and culture; grant-aligned pools; and verifiable onchain participation.
        </p>
        <p>
          Every active campaign links to live proof — ticket supply, member activity, and public
          traction APIs you can audit.
        </p>
      </div>
    </ProductPageLayout>
  );
}
