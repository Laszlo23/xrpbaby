"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatEther, zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import { ComplianceStatus } from "@/components/ComplianceStatus";
import { FundingMeter } from "@/components/FundingMeter";
import { TrustSection } from "@/components/TrustSection";
import { erc20Abi } from "@/lib/contracts";
import { areListingsConfigured, getListingsChainId } from "@/lib/listings-config";
import { nativeCurrencySymbol } from "@/lib/native-currency-label";
import { useListingsProtocolAddresses } from "@/lib/use-listings-protocol-addresses";
import { demoAvailableShares, demoWholeTokenSupply } from "@/lib/demo-investment-math";
import { PropertyImageCarousel } from "@/components/PropertyImageCarousel";
import { PropertyShareButton } from "@/components/PropertyShareButton";
import {
  REFERENCE_YIELD_BAND_LABEL,
  REFERENCE_YIELD_DISCLAIMER,
  formatAnnualRentEur,
  formatIllustrativeEconomics,
  formatPropertyValueEur,
  formatSquareMeters,
  getDemoImageSlides,
  getEstimatedYieldPercent,
  getReferencePricePerShareUnits,
} from "@/lib/demo-properties";
import { getFundingStats } from "@/lib/funding-stats";
import { getPublicDocumentById, getPublicDocumentPreviewPaths, publicDocumentHref } from "@/lib/public-documents";
import { PropertyInvestmentCalculator } from "@/components/PropertyInvestmentCalculator";
import { PropertyDealRoomStrip } from "@/components/PropertyDealRoomStrip";
import { PropertyInvestTrustStrip } from "@/components/PropertyInvestTrustStrip";
import { PropertyLocationMap } from "@/components/PropertyLocationMap";
import { getPropertyGeoById } from "@/lib/property-geo";
import { usePropertyShareList } from "@/lib/usePropertyShareList";

export default function PropertyDetailPage() {
  const params = useParams();
  const idStr = typeof params.id === "string" ? params.id : params.id?.[0] ?? "";
  const propertyId = useMemo(() => {
    try {
      return BigInt(idStr || "0");
    } catch {
      return 0n;
    }
  }, [idStr]);

  const { proofNft, explorer: explorerBase } = useListingsProtocolAddresses();
  const unset = !areListingsConfigured();
  const listingsChainId = getListingsChainId();
  const listingsNative = nativeCurrencySymbol();

  const { chainRows, loading } = usePropertyShareList();
  const row = chainRows.find((r) => r.id === propertyId);

  const [tab, setTab] = useState<"overview" | "financials" | "documents" | "blockchain">("overview");

  const { data: totalSupplyWei } = useReadContract({
    chainId: listingsChainId,
    address: row?.tokenAddress ?? zeroAddress,
    abi: erc20Abi,
    functionName: "totalSupply",
    query: {
      enabled: Boolean(row?.tokenAddress),
      staleTime: 60_000,
      gcTime: 300_000,
    },
  });

  const demo = row?.demo;
  const goalUsd = demo?.illustrativePropertyValueUsd ?? 10_000_000;
  const fundingCurrency = demo?.creditLines?.length ? "EUR" : "USD";
  const funding = propertyId > 0n ? getFundingStats(propertyId, goalUsd) : getFundingStats(1n, goalUsd);

  if (!idStr || propertyId === 0n) {
    return (
      <div className="py-12 text-center text-zinc-500">
        <p>Invalid property id.</p>
        <Link href="/properties" className="mt-4 inline-block text-gold-400 hover:underline">
          ← Back to properties
        </Link>
      </div>
    );
  }

  if (unset) {
    return (
      <p className="text-zinc-400">
        Set registry and share factory in <code className="text-zinc-300">web/.env.local</code> (or repo-root <code className="text-zinc-300">.env</code> for Docker):{" "}
        <code className="text-gold-400">NEXT_PUBLIC_BASE_REGISTRY</code> and <code className="text-gold-400">NEXT_PUBLIC_BASE_SHARE_FACTORY</code> (see{" "}
        <code className="text-zinc-300">.env.docker.example</code>).
      </p>
    );
  }

  if (loading && !row) {
    return <p className="animate-pulse text-zinc-500">Loading property…</p>;
  }

  if (!row) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-400">No share token for property #{idStr}.</p>
        <Link href="/properties" className="mt-4 inline-block text-gold-400 hover:underline">
          ← Properties
        </Link>
      </div>
    );
  }

  const economics = demo ? formatIllustrativeEconomics(demo) : null;
  const explorerToken = `${explorerBase}/address/${row.tokenAddress}`;
  const proofConfigured = proofNft !== zeroAddress;
  const totalSupplyStr =
    totalSupplyWei !== undefined ? Number(formatEther(totalSupplyWei)).toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—";
  const remainingShares = demo ? demoAvailableShares(propertyId, goalUsd).toLocaleString("en-US") : "—";
  const sharePrice = demo?.illustrativeShareUsd != null ? `~$${demo.illustrativeShareUsd.toLocaleString()}` : "—";
  const propertyGeo = getPropertyGeoById(Number(idStr));
  const assetValue =
    demo?.illustrativePropertyValueUsd != null ? formatPropertyValueEur(demo) : "—";
  const modelTokenCap = demo && demo.illustrativePropertyValueUsd != null ? demoWholeTokenSupply(goalUsd) : null;
  const refPricePerShareUnits = demo ? getReferencePricePerShareUnits(demo) : null;
  const simCurrency = demo?.simulatorCurrency ?? "USD";
  const refPriceFormatted =
    refPricePerShareUnits != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: simCurrency === "EUR" ? "EUR" : "USD",
          maximumFractionDigits: refPricePerShareUnits < 100 ? 2 : 0,
        }).format(refPricePerShareUnits)
      : "—";

  const tabBtn = (id: typeof tab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setTab(id)}
      className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition ${
        tab === id ? "border-brand text-white" : "border-transparent text-muted hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-[1280px] space-y-10 pb-16">
      <div className="group relative overflow-hidden rounded-3xl border border-white/[0.08]">
        <div className="relative w-full bg-zinc-900">
          {demo ? (
            <>
              <div className="absolute right-4 top-4 z-30 sm:right-8 sm:top-8">
                <PropertyShareButton propertyId={idStr} title={demo.headline} />
              </div>
              <PropertyImageCarousel
                slides={getDemoImageSlides(demo, { limit: 48 })}
                priorityFirst
                aspectClassName="aspect-[5/3] min-h-[220px] w-full sm:min-h-[280px] sm:aspect-[2.2/1]"
                sizes="100vw"
                dotsClassName="top-4 sm:top-6"
              />
              <div className="pointer-events-none absolute inset-0 z-[14] bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 z-[15] p-6 sm:p-10">
                {demo.discoveryCategory && (
                  <p className="mb-2 inline-block rounded-full border border-gold-400/30 bg-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-gold-300">
                    {demo.discoveryCategory}
                  </p>
                )}
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-400/90">Culture Land listing #{idStr}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {demo.investorCardTitle ?? demo.headline ?? row.name}
                </h1>
                <p className="mt-2 text-sm text-zinc-300">{demo.investorCardSubtitle ?? demo.location ?? row.symbol}</p>
                {demo.emotionalHero ? (
                  <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-white/95 sm:text-lg">
                    {demo.emotionalHero}
                  </p>
                ) : null}
                {demo.investorCardTitle && demo.headline !== demo.investorCardTitle ? (
                  <p className="mt-1 text-xs text-zinc-500">{demo.headline}</p>
                ) : null}
                <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">{demo.propertyType}</p>
              </div>
            </>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center text-zinc-600 sm:aspect-[2.4/1]">
              No image
            </div>
          )}
        </div>
      </div>

      {demo ? (
        <nav
          aria-label="Property journey"
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-400 sm:gap-3"
        >
          <span className="w-full text-[10px] font-normal tracking-wide text-zinc-500 sm:w-auto">Journey</span>
          {(
            [
              ["#story", "Discover"],
              ["#structure", "Structure"],
              ["#financials", "Economics"],
              ["#rights", "Rights"],
              ["#exit", "Exit"],
              ["#community", "Community"],
              ["#invest", "Invest"],
            ] as const
          ).map(([href, label]) => (
            <a key={href} href={href} className="rounded-full border border-white/[0.06] px-3 py-1 text-zinc-300 transition hover:border-brand/40 hover:text-white">
              {label}
            </a>
          ))}
        </nav>
      ) : null}

      {demo ? <PropertyDealRoomStrip propertyIdStr={idStr} /> : null}

      {(demo?.buildingStory || demo?.whyItMatters) && (
        <section id="story" className="scroll-mt-28 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">{demo!.buildingStory ? "Building story" : demo!.whyItMattersTitle ?? "Why this building matters"}</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
            {(demo!.buildingStory ?? demo!.whyItMatters)!.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      )}

      {demo && ((demo.assetStructureBullets?.length ?? 0) > 0 || demo.ownershipModel) ? (
        <section id="structure" className="scroll-mt-28 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">Asset structure</h2>
          <p className="mt-1 text-xs text-muted">Reference-only — custody and issuer mechanics follow offering documents.</p>
          {demo.assetStructureBullets && demo.assetStructureBullets.length > 0 ? (
            <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-muted">
              {demo.assetStructureBullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : demo.ownershipModel ? (
            <p className="mt-4 text-sm leading-relaxed text-muted">{demo.ownershipModel}</p>
          ) : null}
          <p className="mt-4 text-xs text-muted">
            PDFs and plans appear under <span className="text-zinc-400">Architecture &amp; plans</span> or the Documents tab.
          </p>
        </section>
      ) : null}

      {demo ? (
        <section id="financials" className="scroll-mt-28 space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white">Financial breakdown (reference)</h2>
            <p className="mt-1 text-xs text-muted">
              Reference economics for discovery — full economics in issuer data room and Legal. {REFERENCE_YIELD_DISCLAIMER}
            </p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Property value (ref.)</dt>
                <dd className="mt-1 font-mono text-sm text-white">{assetValue}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Annual gross rent (ref.)</dt>
                <dd className="mt-1 font-mono text-sm text-white">{formatAnnualRentEur(demo.annualRentalIncomeEur)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Modelled gross yield</dt>
                <dd className="mt-1 font-mono text-sm text-brand">{getEstimatedYieldPercent(demo).toFixed(1)}% p.a.</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Token supply cap (model)</dt>
                <dd className="mt-1 font-mono text-sm text-white">{modelTokenCap != null ? modelTokenCap.toLocaleString("en-US") : "—"} shares</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-muted">Reference price per token ({simCurrency})</dt>
                <dd className="mt-1 font-mono text-sm text-white">{refPriceFormatted}</dd>
                <p className="mt-2 text-[10px] text-muted">Derived from reference asset value ÷ model cap — same basis as the simulator.</p>
              </div>
            </dl>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Property value</p>
              <p className="mt-1 font-mono text-lg text-white">{assetValue}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Per-token ref. ({simCurrency})</p>
              <p className="mt-1 font-mono text-lg text-white">{refPriceFormatted}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Reference yield band</p>
              <p className="mt-1 text-lg font-semibold text-brand">{REFERENCE_YIELD_BAND_LABEL} p.a.</p>
              <p className="mt-2 text-[10px] leading-snug text-muted">{REFERENCE_YIELD_DISCLAIMER}</p>
              <p className="mt-2 text-[11px] text-muted">
                Modelled gross: <span className="font-mono text-white">{getEstimatedYieldPercent(demo).toFixed(1)}%</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Live supply (chain)</p>
              <p className="mt-1 font-mono text-lg text-white">{totalSupplyStr}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Tokens remaining (model)</p>
              <p className="mt-1 font-mono text-lg text-white">{remainingShares}</p>
            </div>
          </div>

          <FundingMeter stats={funding} label="Funding progress (reference)" currency={fundingCurrency} />
        </section>
      ) : null}

      {demo?.investorRightsBullets && demo.investorRightsBullets.length > 0 ? (
        <section id="rights" className="scroll-mt-28 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">Investor rights &amp; economics</h2>
          <p className="mt-1 text-xs text-muted">
            Summary only — see{" "}
            <Link href="/legal" className="text-brand hover:underline">
              Legal &amp; risks
            </Link>{" "}
            and issuer documents.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-muted">
            {demo.investorRightsBullets.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {demo?.exitOptionsBullets && demo.exitOptionsBullets.length > 0 ? (
        <section id="exit" className="scroll-mt-28 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">Exit &amp; liquidity (reference paths)</h2>
          <p className="mt-1 text-xs text-muted">Not a promise of liquidity, timing, or price — paths depend on issuer terms and markets.</p>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-muted">
            {demo.exitOptionsBullets.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {demo ? (
        <section id="community" className="scroll-mt-28 rounded-2xl border border-brand/20 bg-brand/[0.06] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">Community &amp; round context</h2>
          <p className="mt-2 text-sm text-muted">
            Reference campaign stats for orientation — not live TVL or weekly volume. Use them alongside issuer disclosure.
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Round progress (reference)</dt>
              <dd className="mt-1 font-mono text-sm text-white">{Math.round(funding.progress * 100)}%</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Investors (round model)</dt>
              <dd className="mt-1 font-mono text-sm text-white">{funding.investors.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Share price ref.</dt>
              <dd className="mt-1 font-mono text-sm text-white">{sharePrice}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-muted">Reference yield band</dt>
              <dd className="mt-1 font-mono text-sm text-brand">{REFERENCE_YIELD_BAND_LABEL} p.a.</dd>
              <p className="mt-2 text-[10px] leading-snug text-muted">{REFERENCE_YIELD_DISCLAIMER}</p>
            </div>
          </dl>
          {demo.communityUsers && demo.communityUsers.length > 0 ? (
            <div className="mt-6 border-t border-white/[0.08] pt-6">
              <p className="text-sm font-medium text-white">Who uses this place</p>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-muted">
                {demo.communityUsers.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {demo.fundingRoundNote ? <p className="mt-4 text-xs text-muted">{demo.fundingRoundNote}</p> : null}
        </section>
      ) : null}

      {demo?.greenPrint && demo.greenPrint.length > 0 ? (
        <section className="rounded-2xl border border-eco/20 bg-eco/[0.06] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">Green Print</h2>
          <p className="mt-1 text-xs text-muted">Partner sustainability framing — verify against audits and issuer disclosure.</p>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted">
            {demo.greenPrint.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {demo?.brokerOrDataRoomNotice ? (
        <section className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">Broker / data room notice (third party)</h2>
          <p className="mt-1 text-xs text-amber-200/80">
            Third-party brokerage text — verify deadlines, commissions, and contacts independently before relying on them.
          </p>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
            {demo.brokerOrDataRoomNotice.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      ) : null}

      <ComplianceStatus />

      {demo && (demo.vision || demo.architectureNarrative || (demo.documentIds && demo.documentIds.length > 0)) ? (
        <div className="space-y-6">
          {demo.vision ? (
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white">Vision</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{demo.vision}</p>
            </section>
          ) : null}
          {(demo.architectureNarrative || (demo.documentIds && demo.documentIds.length > 0)) && (
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white">Architecture &amp; plans</h2>
              {demo.architectureNarrative ? <p className="mt-3 text-sm leading-relaxed text-muted">{demo.architectureNarrative}</p> : null}
              {demo.documentIds && demo.documentIds.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {demo.documentIds.map((docId) => {
                    const doc = getPublicDocumentById(docId);
                    if (!doc) return null;
                    const previewSrc = getPublicDocumentPreviewPaths(doc)[0];
                    return (
                      <li key={docId} className="space-y-2 rounded-xl border border-white/[0.06] bg-black/20 p-3 sm:p-4">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <Link href={`/documents/${docId}`} className="text-sm font-medium text-brand hover:underline">
                            {doc.title} — View reader →
                          </Link>
                          <a
                            href={publicDocumentHref(doc.filePath)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-muted hover:text-brand hover:underline"
                          >
                            Open PDF (new tab)
                          </a>
                        </div>
                        {previewSrc ? (
                          <Link
                            href={`/documents/${docId}`}
                            className="relative block h-28 max-w-md overflow-hidden rounded-lg border border-white/[0.08] bg-zinc-900 sm:h-32"
                          >
                            <Image
                              src={previewSrc}
                              alt={`${doc.title} — preview`}
                              fill
                              className="object-contain object-center"
                              sizes="(max-width: 640px) 100vw, 28rem"
                            />
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              <p className="mt-3 text-xs text-muted">
                Plans support diligence — verify dimensions and legal descriptions against issuer materials and the land register.
              </p>
            </section>
          )}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex flex-wrap gap-6 border-b border-white/[0.08]">
            {tabBtn("overview", "Overview")}
            {tabBtn("financials", "Financials")}
            {tabBtn("documents", "Documents")}
            {tabBtn("blockchain", "Blockchain data")}
          </div>

          {tab === "overview" && (
            <div className="space-y-6">
              <section className="glass-card p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-white">Overview</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {demo?.thesis ?? "On-chain fractional share for this registry property."}
                </p>
                {demo?.highlights && (
                  <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted">
                    {demo.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </section>
              {demo && (
                <section className="glass-card p-6 sm:p-8">
                  <h2 className="text-lg font-semibold text-white">Property facts</h2>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">Type</dt>
                      <dd className="mt-1 text-sm text-white">{demo.propertyType}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">Gross floor area</dt>
                      <dd className="mt-1 font-mono text-sm text-white">{formatSquareMeters(demo.squareMeters)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">
                        {demo.propertyType === "Mixed-use" || demo.propertyType === "Mixed-use adaptive reuse"
                          ? "Units"
                          : "Residential units"}
                      </dt>
                      <dd className="mt-1 text-sm text-white">
                        {demo.unitCountLabel ?? demo.units.toLocaleString("en-US")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">Annual gross rent</dt>
                      <dd className="mt-1 font-mono text-sm text-white">{formatAnnualRentEur(demo.annualRentalIncomeEur)}</dd>
                    </div>
                  </dl>
                </section>
              )}
              <section className="glass-card p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-white">Location</h2>
                <p className="mt-2 text-sm text-muted">{demo?.location ?? "See property headline for region."}</p>
                {propertyGeo ? (
                  <div className="mt-4">
                    <PropertyLocationMap geo={propertyGeo} />
                  </div>
                ) : (
                  <div className="mt-4 flex aspect-[2/1] max-h-56 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80">
                    <p className="text-xs text-muted">Map unavailable for this listing.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {tab === "financials" && (
            <section className="glass-card p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white">Financials (reference)</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className={demo?.creditLines?.length ? "sm:col-span-2" : ""}>
                  <dt className="text-xs uppercase tracking-wide text-muted">
                    {demo?.creditLines?.length ? "Loan / facility (reference)" : "Property value (reference)"}
                  </dt>
                  <dd className="mt-1 text-sm text-white">
                    {demo?.creditLines?.length ? (
                      <ul className="list-inside list-disc space-y-1 font-mono text-sm">
                        {demo.creditLines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : demo?.illustrativePropertyValueUsd != null ? (
                      <span className="font-mono">~${(demo.illustrativePropertyValueUsd / 1e6).toFixed(1)}M</span>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Share price ref.</dt>
                  <dd className="mt-1 font-mono text-white">
                    {demo?.illustrativeShareUsd != null ? `~$${demo.illustrativeShareUsd.toLocaleString()}` : "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-muted">Yield narrative</dt>
                  <dd className="mt-1 text-sm text-muted">{demo?.targetRange ?? "—"}</dd>
                </div>
              </dl>
              {economics && <p className="mt-4 text-xs text-muted">{economics}</p>}
            </section>
          )}

          {tab === "documents" && (
            <section className="glass-card p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white">Documents</h2>
              <p className="mt-3 text-sm text-muted">
                Offering memorandum, subscription agreement, and risk factors should live off-chain with issuer
                control. Hash commitments on-chain if required.
              </p>
              {demo?.documentIds && demo.documentIds.length > 0 && (
                <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
                  {demo.documentIds.map((docId) => {
                    const doc = getPublicDocumentById(docId);
                    if (!doc) return null;
                    return (
                      <li key={docId} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <Link href={`/documents/${docId}`} className="text-sm font-medium text-brand hover:underline">
                          {doc.title} — View reader →
                        </Link>
                        <a
                          href={publicDocumentHref(doc.filePath)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-muted hover:text-brand hover:underline"
                        >
                          Open PDF (new tab)
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-6 text-sm text-muted">
                See{" "}
                <Link href="/legal" className="text-brand hover:underline">
                  Legal &amp; risks
                </Link>{" "}
                for platform disclaimers.
              </p>
            </section>
          )}

          {tab === "blockchain" && (
            <div className="space-y-6">
              <section className="glass-card p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-white">Ownership &amp; contracts</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Shares are ERC-20 tokens minted by the PropertyShareFactory. Transfers may be restricted by
                  ComplianceRegistry for regulated offerings.
                </p>
                <p className="mt-3 font-mono text-xs text-muted break-all">Token: {row.tokenAddress}</p>
                <Link
                  href={explorerToken}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
                >
                  View on explorer →
                </Link>
              </section>
              {proofConfigured && (
                <section className="glass-card border border-brand/25 bg-brand/[0.06] p-6 sm:p-8">
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand">Investor proof</p>
                  <h2 className="mt-2 text-lg font-semibold text-white">Certificate NFT</h2>
                  <p className="mt-2 text-sm text-muted">
                    Mint a soulbound proof on the Trade page after you hold shares (switch wallet to the listing chain).
                  </p>
                  <Link
                    href={`/trade?property=${idStr}`}
                    className="mt-4 inline-flex rounded-full border border-brand/40 bg-brand/15 px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/25"
                  >
                    Open trade →
                  </Link>
                </section>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <PropertyInvestTrustStrip propertyId={propertyId} tokenAddress={row.tokenAddress} explorerBase={explorerBase} demo={demo} />

          <PropertyInvestmentCalculator
            propertyId={propertyId}
            demo={demo}
            symbol={row.symbol}
            tradeHref={`/trade?property=${idStr}`}
          />

          <div className="space-y-4 rounded-2xl border border-brand/20 bg-surface-elevated/90 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Next step</h2>
              {demo ? <PropertyShareButton propertyId={idStr} title={demo.headline} variant="compact" /> : null}
            </div>
            <p className="text-sm text-muted">
              Review the <strong className="text-zinc-300">simulator</strong> and trust checks, then execute on Trade when ready. Primary USDC (if
              configured) and secondary {listingsNative} pools live on the trade page.
            </p>
            <a
              href="#invest"
              className="block w-full rounded-full bg-brand py-3 text-center text-sm font-semibold text-[#0A0A0A] transition hover:bg-brand-light"
            >
              Review investment
            </a>
            <Link
              href={`/invest?property=${idStr}`}
              className="block w-full rounded-full border border-white/15 py-3 text-center text-sm font-semibold text-zinc-200 transition hover:border-brand/40 hover:text-white"
            >
              Open invest journey
            </Link>
            <Link
              href={`/trade?property=${idStr}`}
              className="block w-full rounded-full border border-white/15 py-3 text-center text-sm font-semibold text-zinc-200 transition hover:border-brand/40 hover:text-white"
            >
              Continue to Trade (advanced liquidity)
            </Link>
            <Link href={explorerToken} target="_blank" rel="noreferrer" className="block text-center text-xs text-muted hover:text-brand">
              View token on explorer →
            </Link>
          </div>

          <TrustSection />
        </div>
      </div>
    </div>
  );
}
