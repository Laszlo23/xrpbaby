"use client";

import Link from "next/link";
import { PropertyImageCarousel } from "@/components/PropertyImageCarousel";
import { getCultureLandDisplayForDemoPropertyId } from "@/lib/culture-land-portfolio";
import {
  REFERENCE_YIELD_BAND_LABEL,
  REFERENCE_YIELD_DISCLAIMER,
  formatAnnualRentEur,
  formatPropertyValueEur,
  getDemoImageSlides,
  getEstimatedYieldPercent,
  type DemoPropertyDetail,
} from "@/lib/demo-properties";
import { getFundingStats } from "@/lib/funding-stats";
import { FundingMeter } from "@/components/FundingMeter";

type Props = {
  propertyId: number;
  demo: DemoPropertyDetail;
};

/** Listing-style card when chain data is unavailable — links to property detail only. */
export function PropertyShowcaseCard({ propertyId, demo }: Props) {
  const cl = getCultureLandDisplayForDemoPropertyId(propertyId);
  const idStr = String(propertyId);
  const goalUsd = demo.illustrativePropertyValueUsd ?? 10_000_000;
  const funding = getFundingStats(BigInt(propertyId), goalUsd);
  const fundingCurrency = demo.creditLines?.length ? "EUR" : "USD";
  const yieldPct = getEstimatedYieldPercent(demo);
  const priceShare = demo.illustrativeShareUsd ?? 1000;
  const cardTitle = demo.investorCardTitle ?? cl?.title ?? demo.headline;
  const cardSubtitle =
    demo.investorCardSubtitle ??
    (cl ? `${cl.region} · ${cl.tagline}` : demo.location);
  const unitsLine =
    demo.unitCountLabel ??
    `${demo.units.toLocaleString("en-US")} ${demo.units === 1 ? "unit" : "units"}`;
  const unitsHeader =
    demo.propertyType === "Mixed-use" || demo.propertyType === "Mixed-use adaptive reuse"
      ? "Units"
      : "Residential units";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-eco/20 bg-surface-elevated/90 shadow-2xl shadow-black/40 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-eco/40 hover:shadow-xl">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
        <PropertyImageCarousel
          slides={getDemoImageSlides(demo)}
          priorityFirst={propertyId <= 2}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
        />
        <div className="pointer-events-none absolute inset-0 z-[14] bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[15] p-4">
          <h2 className="text-lg font-semibold tracking-tight text-white">{cardTitle}</h2>
          <p className="text-xs text-eco-light">{cardSubtitle}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-muted">{demo.propertyType}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 rounded-b-2xl p-6">
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
              <p className="text-[11px] text-muted">
                Modelled gross:{" "}
                <span className="font-mono text-canvas">{yieldPct.toFixed(1)}%</span>
              </p>
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

        <FundingMeter stats={funding} variant="compact" label="Funding progress" currency={fundingCurrency} />

        <div className="mt-auto flex flex-col gap-3 border-t border-eco/10 pt-6 sm:flex-row">
          <Link
            href={`/trade?property=${idStr}`}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-action px-6 py-2.5 text-center text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-action/25 transition hover:bg-action-light"
          >
            Invest in this building
          </Link>
          <Link
            href={`/properties/${idStr}`}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-eco/40 py-2.5 text-center text-sm font-semibold text-canvas transition hover:border-eco/70 hover:bg-eco/10 sm:px-6"
          >
            View property details
          </Link>
        </div>
        <p className="text-center text-[11px] text-muted">Buy a piece of the cake — community-owned slices.</p>
      </div>
    </article>
  );
}
