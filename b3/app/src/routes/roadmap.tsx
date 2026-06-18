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
    id: 10,
    title: "Culture Score v2",
    slug: "culture-score",
    phase: "Now",
    quarter: "Live",
    body: "Quest, referral, and build dimensions on /profile and /forest — portable builder reputation.",
    sortOrder: 1,
  },
  {
    id: 11,
    title: "First BCC loop",
    slug: "bcc-loop",
    phase: "Now",
    quarter: "Live",
    body: "Onboarding → Culture Points → first BCC grant → Grant Agent (100 BCC) → score growth.",
    sortOrder: 2,
  },
  {
    id: 12,
    title: "Grant Agent MVP",
    slug: "grant-agent",
    phase: "Now",
    quarter: "Live",
    body: "Pay 100 BCC — agent finds grants and drafts applications. Distinct from org /grant-proof.",
    sortOrder: 3,
  },
  {
    id: 13,
    title: "Treasury rules published",
    slug: "treasury",
    phase: "Now",
    quarter: "Live",
    body: "40% Treasury / 30% Buyback / 20% Builders / 10% Burn on /bcc/dashboard.",
    sortOrder: 4,
  },
  {
    id: 14,
    title: "Agent Shares BCC vault",
    slug: "agent-shares",
    phase: "Next",
    quarter: "2026",
    body: "Stake BCC into Grant Agent — target 30/30/30/10 revenue split for stakers, treasury, builder, burn.",
    sortOrder: 5,
  },
  {
    id: 15,
    title: "Stake BCC → unlock agents",
    slug: "bcc-access",
    phase: "Next",
    quarter: "2026",
    body: "25+ BCC balance unlocks premium agent tier; full points→BCC redemption when liquidity gate opens.",
    sortOrder: 6,
  },
  {
    id: 1,
    title: "Marketplace liquidity",
    slug: "marketplace",
    phase: "Now",
    quarter: "Live",
    body: "Trade NFT-backed listings on thirdweb Marketplace on Base.",
    sortOrder: 7,
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
  const { items, narrative, fromCms } = Route.useLoaderData() as {
    items: StrapiRoadmapItem[];
    narrative: Awaited<ReturnType<typeof fetchSiteNarrative>>;
    fromCms: boolean;
  };

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
