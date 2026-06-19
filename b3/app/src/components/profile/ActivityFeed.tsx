"use client";

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { GlassCard, SectionHeading, StatusBadge } from "@/components/profile/profile-ui";
import type { ActivityCategory, ShowcaseActivityItem } from "@/lib/profile/showcase-types";
import type { FounderShowcaseConfig } from "@/lib/profile/founder-showcase";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: ActivityCategory; label: string }[] = [
  { id: "product", label: "Product Updates" },
  { id: "community", label: "Community Posts" },
  { id: "onchain", label: "Onchain Activity" },
  { id: "social", label: "Social Signal" },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function isInternalUrl(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

function ActivityCard({ item }: { item: ShowcaseActivityItem }) {
  const isCurated = item.source === "curated";
  const badgeLabel = isCurated ? "Milestone" : "Cast";
  const badgeTone = isCurated ? "beta" : "default";

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {item.title}
          </p>
          <StatusBadge label={badgeLabel} tone={badgeTone} />
        </div>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.excerpt}</p>
      <p className="mt-2 font-mono text-[10px] text-zinc-600">
        @{item.authorHandle} · {formatDate(item.publishedAt)}
      </p>
    </>
  );

  const className =
    "block rounded-xl border border-white/[0.06] bg-black/30 p-4 transition hover:border-[#00E5FF]/20 hover:bg-white/[0.03]";

  if (isInternalUrl(item.url)) {
    return (
      <Link to={item.url} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <a href={item.url} target="_blank" rel="noreferrer noopener" className={className}>
      {body}
    </a>
  );
}

export function ActivityFeed({
  activity,
  config,
  neynarEnabled,
}: {
  activity: Record<ActivityCategory, ShowcaseActivityItem[]>;
  config: FounderShowcaseConfig;
  neynarEnabled: boolean;
}) {
  const [active, setActive] = useState<ActivityCategory>("product");
  const items = activity[active];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading title="Activity" subtitle="Platform milestones + live Farcaster signal." />
        <div className="flex flex-wrap gap-2 text-xs">
          <a
            href={config.warpcastPersonalUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-zinc-500 hover:text-[#00E5FF]"
          >
            @{config.warpcastPersonalUsername}
          </a>
          <span className="text-zinc-700">·</span>
          <a
            href={config.warpcastBrandUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-zinc-500 hover:text-[#00E5FF]"
          >
            @{config.warpcastBrandUsername}
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const count = activity[cat.id].length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActive(cat.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active === cat.id
                  ? "border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF]"
                  : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300",
              )}
            >
              {cat.label}
              {count > 0 ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      <GlassCard hover={false} className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => <ActivityCard key={item.id} item={item} />)
        ) : (
          <p className="py-6 text-center text-sm text-zinc-500">
            {neynarEnabled
              ? `No ${CATEGORIES.find((c) => c.id === active)?.label.toLowerCase()} yet.`
              : "Live Farcaster casts appear when NEYNAR_API_KEY is configured."}
          </p>
        )}
      </GlassCard>
    </section>
  );
}
