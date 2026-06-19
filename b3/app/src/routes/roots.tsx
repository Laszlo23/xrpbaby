import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { CultureRootsStakingPanel } from "@/components/roots/CultureRootsStakingPanel";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/roots")({
  head: () =>
    pageHead({
      title: `Culture Roots — ${BRAND_DISPLAY_NAME}`,
      description:
        "Treasury-funded BCC staking for early believers and builders — tiered pools, honest participation copy, no guaranteed returns.",
      path: "/roots",
      keywords: ["BCC", "staking", "Culture Roots", "treasury", "builders", "Base"],
    }),
  component: RootsPage,
});

function RootsPage() {
  return (
    <MarketingShell
      eyebrow="BCC · Culture Roots"
      title="Plant roots, share the grove"
      subtitle="Lock BCC in tiered pools. Rewards stream from treasury allocation — coordination and access for builders, not a profit promise."
    >
      <div className="mx-auto max-w-4xl space-y-8 px-4 pb-16 pt-4">
        <CultureRootsStakingPanel />

        <div className="rounded-xl border border-white/[0.06] px-4 py-3 text-sm text-zinc-500">
          <span>
            Places stakes native ETH separately — BCC roots live here. Staking raises your Culture
            Power multiplier on weekly BCC claims when Power is enabled.
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="link" className="h-auto p-0 text-neon" asChild>
              <Link to="/liquidity">LP staking (Aerodrome)</Link>
            </Button>
            <Button variant="link" className="h-auto p-0 text-zinc-400" asChild>
              <Link to="/mission">Token honesty</Link>
            </Button>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
