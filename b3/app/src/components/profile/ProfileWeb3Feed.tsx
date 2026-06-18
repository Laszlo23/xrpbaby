"use client";

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { GlassCard, SectionHeading, StatusBadge } from "@/components/profile/profile-ui";
import type {
  ActivityCategory,
  ShowcaseActivityItem,
} from "@/lib/profile/showcase-types";
import { cn } from "@/lib/utils";

const FEED_TAB_ORDER: ActivityCategory[] = ["social", "onchain", "product", "community"];

function pickDefaultFeedTab(
  activity: Record<ActivityCategory, ShowcaseActivityItem[]>,
): ActivityCategory {
  for (const id of FEED_TAB_ORDER) {
    if (activity[id].length > 0) return id;
  }
  return "social";
}

const CATEGORIES: { id: ActivityCategory; label: string; emoji: string }[] = [
  { id: "product", label: "Product", emoji: "🛠" },
  { id: "community", label: "Community", emoji: "🌲" },
  { id: "onchain", label: "Onchain", emoji: "⛓" },
  { id: "social", label: "Social", emoji: "💬" },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function ActivityCard({ item }: { item: ShowcaseActivityItem }) {
  const isCurated = item.source === "curated";
  const isOnchain = item.category === "onchain" || item.source === "onchain";

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{item.title}</p>
          <StatusBadge
            label={isOnchain ? "Tx" : isCurated ? "Milestone" : "Cast"}
            tone={isOnchain ? "exploring" : isCurated ? "beta" : "default"}
          />
        </div>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.excerpt}</p>
      <p className="mt-2 font-mono text-[10px] text-zinc-600">
        {item.authorHandle !== "onchain" ? `@${item.authorHandle}` : "Base"} · {formatDate(item.publishedAt)}
      </p>
    </>
  );

  const className =
    "block rounded-xl border border-white/[0.06] bg-black/30 p-4 transition hover:border-[#00E5FF]/20 hover:bg-white/[0.03]";

  if (item.url.startsWith("/")) {
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

export function ProfileWeb3Feed({
  activity,
  farcasterUsername,
  neynarEnabled,
}: {
  activity: Record<ActivityCategory, ShowcaseActivityItem[]>;
  farcasterUsername?: string | null;
  neynarEnabled: boolean;
}) {
  const totalCount = CATEGORIES.reduce((n, c) => n + activity[c.id].length, 0);
  const [active, setActive] = useState<ActivityCategory>(() => pickDefaultFeedTab(activity));
  const items = activity[active];

  if (totalCount === 0 && !farcasterUsername) {
    return (
      <section className="space-y-4">
        <SectionHeading title="Web3 feed" subtitle="Casts and onchain activity appear when linked." />
        <GlassCard hover={false} className="py-10 text-center text-sm text-zinc-500">
          Link Farcaster or ENS to this wallet to populate your feed.
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading
          title="Web3 feed"
          subtitle="Live Farcaster casts + recent Base transactions."
        />
        {farcasterUsername ? (
          <a
            href={`https://warpcast.com/${farcasterUsername}`}
            target="_blank"
            rel="noreferrer noopener"
            className="font-mono text-xs text-zinc-500 hover:text-[#8B5CF6]"
          >
            @{farcasterUsername} on Farcaster →
          </a>
        ) : null}
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
                  ? "border-[#C5FF41]/40 bg-[#C5FF41]/10 text-[#C5FF41]"
                  : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300",
              )}
            >
              <span className="mr-1">{cat.emoji}</span>
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
              ? `No ${CATEGORIES.find((c) => c.id === active)?.label.toLowerCase()} activity yet.`
              : "Configure NEYNAR_API_KEY for live Farcaster casts."}
          </p>
        )}
      </GlassCard>
    </section>
  );
}
