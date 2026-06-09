"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ContactConciergeCta } from "@/components/ContactConciergeCta";
import { PoolFinancierProgram } from "@/components/PoolFinancierProgram";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyCardSkeleton } from "@/components/PropertyCardSkeleton";
import { TrustSection } from "@/components/TrustSection";
import { FilterBar, type FilterState } from "@/components/rwa/FilterBar";
import { MarketplaceHero } from "@/components/rwa/MarketplaceHero";
import { FEATURED_PROPERTY_IDS } from "@/lib/featured-listings";
import { getEstimatedYieldPercent } from "@/lib/demo-properties";
import { getFundingStats, getGlobalFundingMeter } from "@/lib/funding-stats";
import {
  areListingsConfigured,
  getListingsChainDisplayName,
  getListingsChainId,
} from "@/lib/listings-config";
import { getPrimarySaleForProperty } from "@/lib/primary-sales-config";
import { useHydrated } from "@/lib/use-hydrated";
import { usePropertyShareList } from "@/lib/usePropertyShareList";
import { track } from "@/lib/analytics";

function InvestDashboardSkeleton() {
  return (
    <section aria-label="Loading listings" className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </section>
  );
}

const defaultFilters: FilterState = {
  search: "",
  country: "",
  city: "",
  minYield: "",
  maxYield: "",
  verifiedOnly: false,
};

function MarketplaceBrowseContent() {
  const unset = !areListingsConfigured();
  const router = useRouter();
  const listingsChainId = getListingsChainId();
  const chainLabel = getListingsChainDisplayName(listingsChainId);
  const { rows: enriched, loading, nextPropertyId, isDemoFallback } = usePropertyShareList();
  const globalFunding = getGlobalFundingMeter();
  const [selectedMarket, setSelectedMarket] = useState<"primary" | "secondary">("primary");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    track("rwa_marketplace_view", { path: "/marketplace" });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("market");
    if (m === "secondary") setSelectedMarket("secondary");
    else if (m === "primary") setSelectedMarket("primary");
  }, []);

  const primaryStrict = useMemo(
    () => enriched.filter((r) => getPrimarySaleForProperty(r.id, listingsChainId)),
    [enriched, listingsChainId],
  );

  const visibleRows = useMemo(() => {
    if (enriched.length === 0) return [];
    let rows = enriched;
    if (selectedMarket === "primary" && primaryStrict.length > 0) {
      const primaryIds = new Set(primaryStrict.map((r) => r.id.toString()));
      rows = [
        ...primaryStrict,
        ...enriched.filter((r) => !primaryIds.has(r.id.toString())),
      ];
    }

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      rows = rows.filter((r) => {
        const title = (r.demo?.headline ?? r.name).toLowerCase();
        const loc = (r.demo?.location ?? "").toLowerCase();
        return title.includes(q) || loc.includes(q) || r.symbol.toLowerCase().includes(q);
      });
    }
    if (filters.country) {
      rows = rows.filter((r) => (r.demo?.location ?? "").toLowerCase().includes(filters.country.toLowerCase()));
    }
    if (filters.city) {
      rows = rows.filter((r) => (r.demo?.location ?? "").toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.minYield) {
      const min = Number(filters.minYield);
      rows = rows.filter((r) => r.demo && getEstimatedYieldPercent(r.demo) >= min);
    }
    if (filters.maxYield) {
      const max = Number(filters.maxYield);
      rows = rows.filter((r) => r.demo && getEstimatedYieldPercent(r.demo) <= max);
    }

    return rows;
  }, [enriched, selectedMarket, primaryStrict, filters]);

  const featuredRows = useMemo(
    () => enriched.filter((r) => FEATURED_PROPERTY_IDS.includes(r.id.toString())),
    [enriched],
  );

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const r of enriched) {
      const loc = r.demo?.location ?? "";
      const parts = loc.split(",").map((s: string) => s.trim());
      if (parts.length > 1) set.add(parts[parts.length - 1]);
    }
    return [...set].sort();
  }, [enriched]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const r of enriched) {
      const loc = r.demo?.location ?? "";
      const city = loc.split(",")[0]?.trim();
      if (city) set.add(city);
    }
    return [...set].sort();
  }, [enriched]);

  const showPrimaryFallbackBanner =
    selectedMarket === "primary" && primaryStrict.length === 0 && enriched.length > 0;

  const showPrimaryPartialBanner =
    selectedMarket === "primary" &&
    primaryStrict.length > 0 &&
    primaryStrict.length < enriched.length;

  const overview = useMemo(() => {
    if (visibleRows.length === 0) return { avgYield: null as number | null, refTvlUsd: 0, fundedUsd: 0 };
    let ySum = 0;
    let yN = 0;
    let tvl = 0;
    let funded = 0;
    for (const r of visibleRows) {
      if (r.demo) {
        ySum += getEstimatedYieldPercent(r.demo);
        yN += 1;
      }
      const g = r.demo?.illustrativePropertyValueUsd ?? 10_000_000;
      const fs = getFundingStats(r.id, g);
      tvl += g;
      funded += fs.fundedUsd;
    }
    return { avgYield: yN ? ySum / yN : null, refTvlUsd: tvl, fundedUsd: funded };
  }, [visibleRows]);

  function syncMarket(next: "primary" | "secondary") {
    setSelectedMarket(next);
    router.replace(`/marketplace?market=${next}`, { scroll: false });
  }

  const blendedProgress =
    overview.refTvlUsd > 0 ? Math.min(1, overview.fundedUsd / overview.refTvlUsd) : globalFunding.progress;

  return (
    <div className="mx-auto max-w-[1280px] space-y-10 pb-16">
      <MarketplaceHero />

      {!unset && (
        <p className="text-xs text-zinc-500">
          Registry <span className="font-mono text-zinc-400">nextPropertyId</span>:{" "}
          <span className="font-mono text-bc-cyan">{nextPropertyId?.toString() ?? "…"}</span> · Listings chain:{" "}
          <span className="text-zinc-300">{chainLabel}</span>
        </p>
      )}

      {isDemoFallback ? (
        <p className="rounded-xl border border-amber-400/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100/90">
          Reference narratives until on-chain registry is seeded. Connect wallet and list via{" "}
          <Link href="/list" className="text-bc-lime underline">
            List a property
          </Link>
          .
        </p>
      ) : null}

      {unset ? (
        <p className="text-zinc-400">
          Set <code className="text-bc-cyan">NEXT_PUBLIC_BASE_REGISTRY</code> and{" "}
          <code className="text-bc-cyan">NEXT_PUBLIC_BASE_SHARE_FACTORY</code> in env.
        </p>
      ) : loading && enriched.length === 0 ? (
        <InvestDashboardSkeleton />
      ) : enriched.length === 0 ? (
        <p className="text-zinc-400">
          No properties yet.{" "}
          <Link href="/list" className="text-bc-lime hover:underline">
            Be the first to list →
          </Link>
        </p>
      ) : (
        <>
          {featuredRows.length > 0 ? (
            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold text-white">Featured</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {featuredRows.map((row) => (
                  <div key={row.tokenAddress} className="min-w-[280px] max-w-[320px] shrink-0">
                    <PropertyCard
                      propertyId={row.id}
                      tokenAddress={row.tokenAddress}
                      name={row.name}
                      symbol={row.symbol}
                      demo={row.demo}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <FilterBar filters={filters} onChange={setFilters} countries={countries} cities={cities} />

            <div className="space-y-8">
              <section className="bc-glass-strong relative overflow-hidden rounded-3xl p-6 sm:p-8">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Opportunities</p>
                    <p className="mt-1 font-mono text-2xl font-semibold text-white">{visibleRows.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Avg. ref. yield</p>
                    <p className="mt-1 font-mono text-2xl font-semibold text-bc-cyan">
                      {overview.avgYield != null ? `${overview.avgYield.toFixed(1)}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Funding progress</p>
                    <p className="mt-1 font-mono text-2xl font-semibold text-white">
                      {Math.round(blendedProgress * 100)}%
                    </p>
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-1" role="tablist">
                  {(["primary", "secondary"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={selectedMarket === m}
                      onClick={() => syncMarket(m)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        selectedMarket === m
                          ? "bg-bc-lime text-black"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {m === "primary" ? "Primary market" : "Secondary market"}
                    </button>
                  ))}
                </div>
                <Link href="/marketplace/map" className="text-sm text-bc-cyan hover:underline">
                  Open map view →
                </Link>
              </div>

              {showPrimaryFallbackBanner ? (
                <p className="rounded-xl border border-sky-500/25 bg-sky-950/25 px-4 py-3 text-sm text-sky-100/95">
                  Showing full catalog — add primary sales in <code className="font-mono text-xs">primary-sales.json</code>.
                </p>
              ) : null}

              {showPrimaryPartialBanner ? (
                <p className="rounded-xl border border-emerald-500/25 bg-emerald-950/25 px-4 py-3 text-sm text-emerald-100/95">
                  <strong className="text-white">{primaryStrict.length}</strong> propert
                  {primaryStrict.length === 1 ? "y has" : "ies have"} a live issuer sale (USDC). The rest are
                  browse-only until primary sales are added in{" "}
                  <code className="font-mono text-xs">primary-sales.json</code> — or switch to{" "}
                  <button
                    type="button"
                    className="text-bc-cyan underline"
                    onClick={() => syncMarket("secondary")}
                  >
                    Secondary market
                  </button>
                  .
                </p>
              ) : null}

              <section aria-label="Property listings" className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
                {visibleRows.map((row) => (
                  <PropertyCard
                    key={row.tokenAddress}
                    propertyId={row.id}
                    tokenAddress={row.tokenAddress}
                    name={row.name}
                    symbol={row.symbol}
                    demo={row.demo}
                  />
                ))}
              </section>
            </div>
          </div>

          <ContactConciergeCta />
          {!unset && enriched.length > 0 ? <PoolFinancierProgram /> : null}
          <TrustSection />
        </>
      )}
    </div>
  );
}

export function MarketplaceBrowse() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] space-y-10 pb-16">
        <MarketplaceHero />
        <InvestDashboardSkeleton />
      </div>
    );
  }
  return <MarketplaceBrowseContent />;
}
