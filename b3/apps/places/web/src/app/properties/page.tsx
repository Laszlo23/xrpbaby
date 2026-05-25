"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ContactConciergeCta } from "@/components/ContactConciergeCta";
import { PoolFinancierProgram } from "@/components/PoolFinancierProgram";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyCardSkeleton } from "@/components/PropertyCardSkeleton";
import { TrustSection } from "@/components/TrustSection";
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

function InvestDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-44 animate-pulse rounded-3xl border border-white/[0.06] bg-zinc-900/60" />
      <div className="h-12 max-w-md animate-pulse rounded-xl bg-zinc-800/70" />
      <section aria-label="Loading listings" className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </section>
    </div>
  );
}

function PropertiesPageContent() {
  const unset = !areListingsConfigured();
  const router = useRouter();
  const listingsChainId = getListingsChainId();
  const chainLabel = getListingsChainDisplayName(listingsChainId);

  const { rows: enriched, loading, nextPropertyId, isDemoFallback } = usePropertyShareList();
  const globalFunding = getGlobalFundingMeter();

  const [selectedMarket, setSelectedMarket] = useState<"primary" | "secondary">("primary");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("market");
    if (m === "secondary") setSelectedMarket("secondary");
    else if (m === "primary") setSelectedMarket("primary");
  }, []);

  /** Properties with an issuer primary-sale entry for the active listings chain. */
  const primaryStrict = useMemo(
    () => enriched.filter((r) => getPrimarySaleForProperty(r.id, listingsChainId)),
    [enriched, listingsChainId],
  );

  /**
   * Primary: issuer-configured sales when present; otherwise full catalog so the tab never renders empty.
   * Secondary: full catalog (AMM / secondary venue applies once pools exist).
   */
  const visibleRows = useMemo(() => {
    if (enriched.length === 0) return [];
    if (selectedMarket === "secondary") return enriched;
    return primaryStrict.length > 0 ? primaryStrict : enriched;
  }, [enriched, selectedMarket, primaryStrict]);

  const showPrimaryFallbackBanner =
    selectedMarket === "primary" && primaryStrict.length === 0 && enriched.length > 0;

  const overview = useMemo(() => {
    if (visibleRows.length === 0) {
      return { avgYield: null as number | null, refTvlUsd: 0, fundedUsd: 0 };
    }
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
    return {
      avgYield: yN ? ySum / yN : null,
      refTvlUsd: tvl,
      fundedUsd: funded,
    };
  }, [visibleRows]);

  function syncMarket(next: "primary" | "secondary") {
    setSelectedMarket(next);
    router.replace(`/properties?market=${next}`, { scroll: false });
  }

  const blendedProgress =
    overview.refTvlUsd > 0 ? Math.min(1, overview.fundedUsd / overview.refTvlUsd) : globalFunding.progress;

  return (
    <div className="mx-auto max-w-[1280px] space-y-10 pb-16">
      <header className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-500/85">Investment hub</p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Investment Opportunities</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Compare tokenized places, reference yields, and funding progress — then open a property to diligence or move to{" "}
          <span className="text-zinc-200">Invest</span> / <span className="text-zinc-200">Trade</span>. Reference figures
          until reconciled on-chain — economics in issuer materials and{" "}
          <Link href="/legal/risk" className="text-emerald-400/90 hover:underline">
            Legal
          </Link>
          .{" "}
          <Link href="/how-it-works" className="text-emerald-400/90 hover:underline">
            How shares work →
          </Link>
        </p>
        {!unset && (
          <p className="text-xs text-zinc-500">
            Registry <span className="font-mono text-zinc-400">nextPropertyId</span>:{" "}
            <span className="font-mono text-emerald-400/90">{nextPropertyId?.toString() ?? "…"}</span> · Listings chain:{" "}
            <span className="text-zinc-300">{chainLabel}</span>
          </p>
        )}
      </header>

      {isDemoFallback ? (
        <p className="rounded-xl border border-amber-400/25 bg-amber-500/[0.08] px-4 py-3 text-sm leading-relaxed text-amber-100/90">
          These cards use <span className="font-medium text-white">reference narratives and imagery</span> from the curated listing catalog.
          Your <code className="font-mono text-xs text-white/90">PropertyRegistry</code> has not been seeded yet (
          <code className="font-mono text-xs">nextPropertyId === 1</code>). After you seed properties on-chain, refresh — live share
          tokens replace these previews.
        </p>
      ) : null}

      {unset ? (
        <p className="text-zinc-400">
          Set Base registry and share-factory env: <code className="text-emerald-400">NEXT_PUBLIC_BASE_REGISTRY</code> and{" "}
          <code className="text-emerald-400">NEXT_PUBLIC_BASE_SHARE_FACTORY</code>.
          Use <code className="text-zinc-300">web/.env.local</code> locally or repo-root <code className="text-zinc-300">.env</code> for Docker builds (
          <code className="text-zinc-300">.env.docker.example</code>).
        </p>
      ) : loading && enriched.length === 0 ? (
        <InvestDashboardSkeleton />
      ) : enriched.length === 0 ? (
        <p className="text-zinc-400">
          No properties yet. Run <code className="text-emerald-400">SeedSevenProperties</code> (fresh registry) or follow{" "}
          <code className="text-zinc-400">deployments/README.md</code>, then refresh.
        </p>
      ) : (
        <>
          {/* 1) Investment overview */}
          <section
            aria-labelledby="investment-overview-heading"
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/95 via-zinc-950 to-black p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl space-y-2">
                <h2 id="investment-overview-heading" className="text-lg font-semibold text-white">
                  Investment overview
                </h2>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Snapshot across the listings visible for <span className="text-zinc-200">{selectedMarket}</span> market —
                  blended reference TVL and community funding narrative. Switch markets below to filter the grid.
                </p>
              </div>
              <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl lg:shrink-0">
                <div className="rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Opportunities</p>
                  <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">{visibleRows.length}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">In current tab</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Avg. ref. yield</p>
                  <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-emerald-300/95">
                    {overview.avgYield != null ? `${overview.avgYield.toFixed(1)}%` : "—"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">Modelled gross (ref.)</p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Ref. TVL (visible)</p>
                  <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                    {overview.refTvlUsd > 0
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                          notation: "compact",
                        }).format(overview.refTvlUsd)
                      : "—"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">Not NAV</p>
                </div>
              </div>
            </div>

            <div className="relative mt-8">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Blended funding progress (reference)</span>
                <span className="font-mono text-zinc-300">{Math.round(blendedProgress * 100)}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800/90 ring-1 ring-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.round(blendedProgress * 1000) / 10}%` }}
                />
              </div>
              <p className="mt-3 text-[11px] leading-snug text-zinc-500">
                Platform narrative benchmark:{" "}
                <span className="font-mono text-zinc-400">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(globalFunding.fundedUsd)}
                </span>{" "}
                across active listings · {globalFunding.investors.toLocaleString()} participants (reference narrative).
              </p>
            </div>
          </section>

          {/* 2) Market tabs (segmented control) */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="inline-flex w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-1 shadow-inner shadow-black/60 sm:w-auto"
              role="tablist"
              aria-label="Market"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedMarket === "primary"}
                onClick={() => syncMarket("primary")}
                className={`relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                  selectedMarket === "primary"
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-black shadow-lg shadow-emerald-900/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Primary market
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedMarket === "secondary"}
                onClick={() => syncMarket("secondary")}
                className={`relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                  selectedMarket === "secondary"
                    ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-900/35"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Secondary market
              </button>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-zinc-500">
              <strong className="text-zinc-300">Primary:</strong> issuer sale (USDC) when configured in{" "}
              <code className="rounded bg-white/[0.06] px-1 font-mono text-[10px]">primary-sales.json</code>.{" "}
              <strong className="text-zinc-300">Secondary:</strong> AMM swaps on Trade when pools exist.
            </p>
          </div>

          {showPrimaryFallbackBanner ? (
            <p className="rounded-xl border border-sky-500/25 bg-sky-950/25 px-4 py-3 text-sm text-sky-100/95">
              <strong className="text-white">No issuer sale mapped for this chain.</strong> Showing the full catalog — add a sale in{" "}
              <code className="rounded bg-black/40 px-1 font-mono text-xs">primary-sales.json</code> to narrow Primary to live issuances.
            </p>
          ) : null}

          {/* 3) Property cards grid — always maps visibleRows when enriched loaded */}
          <section aria-label="Property listings" className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
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

          <ContactConciergeCta />

          {!unset && enriched.length > 0 ? <PoolFinancierProgram /> : null}
          <TrustSection />
        </>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1280px] space-y-10 pb-16">
        <header className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-500/85">Investment hub</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Investment Opportunities</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            Loading listings and reference narratives — issuer data room and Legal for terms.
          </p>
        </header>
        <InvestDashboardSkeleton />
      </div>
    );
  }
  return <PropertiesPageContent />;
}
