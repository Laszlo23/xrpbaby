"use client";

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { GlassCard, SectionHeading } from "@/components/profile/profile-ui";
import type { BcidLeaderboardEntry } from "@/lib/reputation/bcid-leaderboard-fn";

function BcidCard({ entry }: { entry: BcidLeaderboardEntry }) {
  const label =
    entry.cultureHandle ??
    entry.publicHandle ??
    entry.did.replace("did:bcid:human:", "bcid-");
  const profileHref = entry.cultureHandle
    ? (`/id/${entry.cultureHandle}` as "/id/$name")
    : "/bcid/leaderboard";

  return (
    <Link
      to={profileHref}
      {...(entry.cultureHandle ? { params: { name: entry.cultureHandle } } : {})}
      className="group flex flex-col rounded-xl border border-white/10 bg-black/30 p-4 transition hover:border-[#C5FF41]/30 hover:bg-[#C5FF41]/5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] text-zinc-600">#{entry.rank}</span>
        <span className="rounded-full border border-[#C5FF41]/30 px-2 py-0.5 font-mono text-[10px] text-[#C5FF41]">
          BCID
        </span>
      </div>
      <p className="mt-2 truncate font-display font-semibold text-white group-hover:text-[#C5FF41]">
        {label}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <p className="text-zinc-600">Builder</p>
          <p className="font-mono text-zinc-300">{entry.builderScore.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-zinc-600">Trust</p>
          <p className="font-mono text-zinc-300">{entry.trust.toFixed(0)}</p>
        </div>
      </div>
    </Link>
  );
}

export function DiscoverBcidGrid({ excludeDid }: { excludeDid?: string | null }) {
  const [entries, setEntries] = useState<BcidLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bcid/leaderboard?limit=8")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok && Array.isArray(d.entries)) {
          setEntries(
            d.entries.filter((e: BcidLeaderboardEntry) => e.did !== excludeDid).slice(0, 6),
          );
        }
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [excludeDid]);

  if (!loading && entries.length === 0) {
    return (
      <section className="space-y-4">
        <SectionHeading title="Discover BCIDs" subtitle="Portable builder identities on Base." />
        <GlassCard hover={false} className="py-8 text-center">
          <p className="text-sm text-zinc-500">Be among the first Human BCIDs on testnet.</p>
          <Link
            to="/bcid/mint"
            className="mt-4 inline-block rounded-full bg-[#C5FF41] px-5 py-2 text-sm font-semibold text-black"
          >
            Mint yours →
          </Link>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <SectionHeading
          title="Discover BCIDs"
          subtitle="Other builders with verifiable reputation — no follower vanity."
        />
        <Link to="/bcid/leaderboard" className="text-xs text-[#C5FF41] hover:underline">
          Full leaderboard →
        </Link>
      </div>
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <BcidCard key={entry.did} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}
