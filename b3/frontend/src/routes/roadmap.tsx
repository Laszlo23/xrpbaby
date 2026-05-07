import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MapPin } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import {
  fetchRoadmapItems,
  fetchSiteNarrative,
  type StrapiRoadmapItem,
} from "@/lib/strapi-roadmap";

const FALLBACK_ROADMAP: StrapiRoadmapItem[] = [
  {
    id: 1,
    title: "Marketplace liquidity",
    slug: "marketplace",
    phase: "Now",
    quarter: "Live",
    body: "Trade NFT-backed listings on thirdweb Marketplace on Base. Filter the OBC / featured collection when configured.",
    sortOrder: 1,
  },
  {
    id: 2,
    title: "Points & quests",
    slug: "points",
    phase: "Next",
    quarter: "2026",
    body: "Postgres-backed ledger with SIWE — sync wallet identity for fair tasks and future airdrops.",
    sortOrder: 2,
  },
  {
    id: 3,
    title: "Airdrop snapshots",
    slug: "airdrops",
    phase: "Later",
    quarter: "TBD",
    body: "Snapshot ledger balances into Merkle trees or distributor contracts when tokenomics land.",
    sortOrder: 3,
  },
];

export const Route = createFileRoute("/roadmap")({
  head: () =>
    pageHead({
      title: "Roadmap",
      description:
        "BUILDCHAIN product roadmap — marketplace, quests, points, and culture-first infra on Base.",
      path: "/roadmap",
      keywords: ["BUILDCHAIN", "roadmap", "Base", "marketplace"],
    }),
  loader: async () => {
    const [items, narrative] = await Promise.all([fetchRoadmapItems(), fetchSiteNarrative()]);
    return {
      items: items.length ? items : FALLBACK_ROADMAP,
      narrative,
      fromCms: items.length > 0,
    };
  },
  component: RoadmapPage,
});

function RoadmapPage() {
  const { items, narrative, fromCms } = Route.useLoaderData();

  return (
    <MarketingShell
      eyebrow="Ship log"
      tone="purple"
      heroSize="hero"
      articleClassName="max-w-3xl w-full"
      title={narrative?.heroTagline ?? "Roadmap — culture on-chain without the theatre"}
      subtitle={
        narrative?.heroSubcopy ??
        "Marketplace liquidity first, honest points second, airdrops when the ledger says who showed up. Built on Base; edited from Strapi when CMS is live."
      }
      actions={
        narrative?.ctaUrl && narrative.ctaLabel ? (
          <Button asChild size="lg" className="rounded-full">
            {narrative.ctaUrl.startsWith("http") ? (
              <a href={narrative.ctaUrl} target="_blank" rel="noreferrer">
                {narrative.ctaLabel}
              </a>
            ) : (
              <Link to={narrative.ctaUrl}>{narrative.ctaLabel}</Link>
            )}
          </Button>
        ) : (
          <Button asChild size="lg" className="rounded-full">
            <Link to="/marketplace">Open marketplace</Link>
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {!fromCms && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
            Showing default roadmap copy. Run Strapi and publish{" "}
            <span className="font-mono text-xs">roadmap-item</span> entries to replace this from the
            CMS.
          </p>
        )}
        <ol className="space-y-5">
          {items
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item, idx) => (
              <li
                key={item.slug}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 text-neon">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {item.phase ?? "Phase"}
                  </span>
                  {item.quarter ? <span className="text-zinc-600">{item.quarter}</span> : null}
                  <span className="text-zinc-700">#{idx + 1}</span>
                </div>
                <h2 className="mt-3 font-heading text-xl font-semibold text-foreground">
                  {item.title}
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
                  {item.body}
                </p>
              </li>
            ))}
        </ol>
      </div>
    </MarketingShell>
  );
}
