"use client";

import type { FundingStats } from "@/lib/funding-stats";

function fmtMoney(n: number, currency: "USD" | "EUR") {
  return new Intl.NumberFormat(currency === "EUR" ? "de-AT" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

type Props = {
  stats: FundingStats;
  /** Compact row for cards */
  variant?: "hero" | "compact";
  label?: string;
  /** Display currency for funded/goal amounts (stats are still nominal numbers) */
  currency?: "USD" | "EUR";
  /** Illustrative properties onboarded — from platform stats on homepage */
  propertiesOnboarded?: number;
};

export function FundingMeter({
  stats,
  variant = "hero",
  label = "Community funding",
  currency = "USD",
  propertiesOnboarded,
}: Props) {
  const fmt = (n: number) => fmtMoney(n, currency);
  const pct = Math.round(stats.progress * 1000) / 10;

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] text-muted">
          <span>{label}</span>
          <span className="font-mono text-action">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-forest-deep/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-eco to-eco-light transition-all duration-700"
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <p className="text-[10px] text-muted">
          {fmt(stats.fundedUsd)} / {fmt(stats.goalUsd)} · {stats.investors.toLocaleString()} investors ·{" "}
          {stats.countries} countries
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card-strong relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-action/15 blur-2xl" />
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-eco-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl text-white sm:text-3xl">
        <span className="text-gradient-eco">{fmt(stats.fundedUsd)}</span>
        <span className="text-muted"> / {fmt(stats.goalUsd)}</span>
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-forest-deep/90">
        <div
          className="h-full rounded-full bg-gradient-to-r from-eco via-eco-light to-action shadow-lg shadow-eco/25 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted">Investors</p>
          <p className="font-semibold tabular-nums text-canvas">{stats.investors.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Countries</p>
          <p className="font-semibold tabular-nums text-canvas">{stats.countries}</p>
        </div>
        {propertiesOnboarded != null ? (
          <div>
            <p className="text-xs text-muted">Properties</p>
            <p className="font-semibold tabular-nums text-canvas">{propertiesOnboarded}</p>
          </div>
        ) : null}
        <div>
          <p className="text-xs text-muted">Funded</p>
          <p className="font-semibold tabular-nums text-action">{pct}%</p>
        </div>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Community funding snapshot for the product narrative — not a live offering or performance track record. Wire
        oracle-backed metrics for your own reporting.
      </p>
    </div>
  );
}
