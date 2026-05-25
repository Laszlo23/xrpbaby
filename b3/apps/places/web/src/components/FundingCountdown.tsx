"use client";

import type { GlobalPlatformStats } from "@/lib/funding-stats";

function fmtUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

type Props = {
  stats: GlobalPlatformStats;
};

export function FundingCountdown({ stats }: Props) {
  const pct = Math.round(stats.progress * 1000) / 10;
  return (
    <div className="glass-card-strong relative overflow-hidden border-eco/25 p-6">
      <div className="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-eco/15 blur-2xl" />
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Community funding</p>
      <p className="mt-2 font-mono text-lg text-white sm:text-xl">
        {fmtUsd(stats.fundedUsd)} <span className="text-muted">/ {fmtUsd(stats.goalUsd)}</span>
      </p>
      <div className="mt-3 flex flex-wrap items-baseline gap-2 text-sm">
        <span className="rounded-full border border-action/30 bg-action/10 px-2.5 py-0.5 text-action-light">
          {stats.daysRemaining} days remaining
        </span>
        <span className="text-muted">{pct}% funded</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-forest-deep/90">
        <div
          className="h-full rounded-full bg-gradient-to-r from-eco via-eco-light to-action transition-all duration-700"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className="mt-3 text-[11px] text-muted">
        {stats.propertiesFunded} properties in active raise · reference community-funding narrative
      </p>
    </div>
  );
}
