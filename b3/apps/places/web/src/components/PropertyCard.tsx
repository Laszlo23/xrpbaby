"use client";

import Link from "next/link";
import { zeroAddress } from "viem";
import { PropertyImageCarousel } from "@/components/PropertyImageCarousel";
import { PropertyShareButton } from "@/components/PropertyShareButton";
import {
  REFERENCE_YIELD_BAND_LABEL,
  REFERENCE_YIELD_DISCLAIMER,
  formatAnnualRentEur,
  formatPropertyValueEur,
  getEstimatedYieldPercent,
  type DemoPropertyDetail,
} from "@/lib/demo-properties";
import { getPropertyHeroSlides } from "@/lib/property-public-images";
import { getFundingStats } from "@/lib/funding-stats";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";
import { FundingMeter } from "@/components/FundingMeter";

type PropertyCardProps = {
  propertyId: bigint;
  tokenAddress: `0x${string}`;
  name: string;
  symbol: string;
  demo?: DemoPropertyDetail;
};

export function PropertyCard({ propertyId, tokenAddress, name, symbol, demo }: PropertyCardProps) {
  const { explorer } = useProtocolAddresses();
  const isPlaceholderToken = tokenAddress === zeroAddress;
  const explorerToken = `${explorer}/address/${tokenAddress}`;
  const goalUsd = demo?.illustrativePropertyValueUsd ?? 10_000_000;
  const funding = getFundingStats(propertyId, goalUsd);
  const fundingCurrency = demo?.creditLines?.length ? "EUR" : "USD";
  const yieldPct = demo ? getEstimatedYieldPercent(demo) : null;
  const priceShare = demo?.illustrativeShareUsd ?? 1000;
  const idStr = propertyId.toString();

  const cardTitle = demo?.investorCardTitle ?? demo?.headline ?? name;
  const cardSubtitle =
    demo?.investorCardSubtitle ??
    (demo ? `${demo.location.split("·")[0]?.trim() ?? demo.location} — ${demo.propertyType}` : "Registered property");
  const unitsLine =
    demo?.unitCountLabel ??
    (demo ? `${demo.units.toLocaleString("en-US")} ${demo.units === 1 ? "unit" : "units"}` : "—");
  const unitsHeader =
    demo &&
    (demo.propertyType === "Mixed-use" || demo.propertyType === "Mixed-use adaptive reuse")
      ? "Units"
      : "Residential units";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-elevated/90 shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-1 hover:border-emerald-500/35 hover:shadow-2xl hover:shadow-emerald-950/20">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
        {demo ? (
          <>
            <PropertyImageCarousel
              slides={getPropertyHeroSlides(propertyId, demo)}
              priorityFirst={propertyId <= 2n}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
            />
            <div className="pointer-events-none absolute inset-0 z-[14] bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            {demo.discoveryCategory && (
              <div className="absolute left-3 top-3 z-[16] rounded-full border border-eco/35 bg-black/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-eco-light backdrop-blur-sm">
                {demo.discoveryCategory}
              </div>
            )}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[15] p-4">
              <h2 className="text-lg font-semibold tracking-tight text-white">{cardTitle}</h2>
              <p className="text-xs text-eco-light">{cardSubtitle}</p>
              <p className="mt-2 text-[11px] font-mono tabular-nums text-canvas/90">
                {Math.round(funding.progress * 100)}% funded · {funding.investors.toLocaleString()} investors
              </p>
            </div>
          </>
        ) : (
          <div className="relative flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-forest to-black p-6 text-center">
            <p className="text-sm text-muted">On-chain property — add listing imagery in metadata to show photos here.</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5 rounded-b-2xl p-6">
        {demo && (
          <dl className="grid grid-cols-1 gap-4 rounded-xl border border-eco/15 bg-forest/40 p-4 text-[13px] sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Property value</dt>
              <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-canvas">{formatPropertyValueEur(demo)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Annual rental income</dt>
              <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-canvas">
                {formatAnnualRentEur(demo.annualRentalIncomeEur)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Reference yield band</dt>
              <dd className="mt-1 space-y-2">
                <div className="font-mono text-lg font-semibold tabular-nums text-eco-light">{REFERENCE_YIELD_BAND_LABEL} p.a.</div>
                <p className="text-[10px] leading-snug text-muted">{REFERENCE_YIELD_DISCLAIMER}</p>
                {yieldPct != null ? (
                  <p className="text-[11px] text-muted">
                    Modelled gross from reference rent ÷ reference value:{" "}
                    <span className="font-mono text-canvas">{yieldPct.toFixed(1)}%</span>
                  </p>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{unitsHeader}</dt>
              <dd className="mt-1 text-sm font-medium capitalize text-canvas">{unitsLine}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Gross floor area</dt>
              <dd className="mt-1 font-mono text-sm text-canvas">{demo.squareMeters.toLocaleString("en-US")} m²</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">Price / share (ref.)</dt>
              <dd className="mt-1 font-mono text-base font-semibold tabular-nums text-canvas">
                ~${priceShare.toLocaleString("en-US")}
              </dd>
            </div>
          </dl>
        )}

        <FundingMeter stats={funding} variant="compact" label="Funding progress" currency={fundingCurrency} />

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
          <span className="rounded-md border border-eco/20 bg-eco/10 px-2 py-0.5 font-mono text-canvas/90">
            Property #{idStr}
          </span>
          <span className="font-mono text-muted">
            {symbol} · {name}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-eco/10 pt-6 sm:flex-row sm:flex-wrap">
          {isPlaceholderToken ? (
            <span className="inline-flex min-h-[44px] flex-1 cursor-default items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-center text-sm font-semibold text-zinc-500 sm:order-first sm:flex-none">
              Trading after on-chain seed
            </span>
          ) : (
            <Link
              href={`/invest?property=${idStr}`}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-action px-6 py-2.5 text-center text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-action/25 transition hover:bg-action-light sm:order-first sm:flex-none"
            >
              Invest
            </Link>
          )}
          <Link
            href={`/properties/${idStr}`}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-white/15 py-2.5 text-center text-sm font-semibold text-canvas transition hover:border-white/25 hover:bg-white/[0.06] sm:flex-none sm:px-6"
          >
            View Details
          </Link>
          {demo && <PropertyShareButton propertyId={idStr} title={demo.headline} variant="compact" />}
          <p className="w-full text-center text-[11px] text-muted sm:order-last">Buy a piece of the cake — community-owned slices.</p>
          {isPlaceholderToken ? (
            <span className="w-full py-2 text-center text-[11px] text-amber-200/90 sm:w-auto">
              Share token not deployed — explorer link available after seed.
            </span>
          ) : (
            <Link
              href={explorerToken}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 text-center text-xs text-muted hover:text-canvas sm:w-auto sm:px-3"
            >
              Explorer
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
