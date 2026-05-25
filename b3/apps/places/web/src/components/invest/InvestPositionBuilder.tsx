"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import type { DemoPropertyDetail } from "@/lib/demo-properties";
import {
  REFERENCE_YIELD_DISCLAIMER,
  formatAnnualRentEur,
  formatPropertyValueEur,
  getEstimatedYieldPercent,
} from "@/lib/demo-properties";
import type { PrimarySaleQuote } from "@/lib/use-primary-sale-quote";

type Props = {
  demo: DemoPropertyDetail;
  symbol: string;
  propertyTitle: string;
  referenceAssetValue: number;
  availableSharesModel: number;
  portfolioValueRefUsd: number;
  propertiesHeldCount: number;
  alreadyOwnsSelected: boolean;
  quote: PrimarySaleQuote;
  wholeShares: number;
  onWholeSharesChange: (n: number) => void;
};

function incomeForShares(
  demo: DemoPropertyDetail,
  refDenom: number,
  unitPriceUsd: number,
  shares: number,
): number {
  const totalUsd = shares * unitPriceUsd;
  const frac = totalUsd / (refDenom > 0 ? refDenom : 1);
  return demo.annualRentalIncomeEur * frac;
}

export function InvestPositionBuilder({
  demo,
  symbol,
  propertyTitle,
  referenceAssetValue,
  availableSharesModel,
  portfolioValueRefUsd,
  propertiesHeldCount,
  alreadyOwnsSelected,
  quote,
  wholeShares,
  onWholeSharesChange,
}: Props) {
  const unitPriceUsd = useMemo(() => {
    if (quote.onChainSale && quote.pricePerShare !== undefined) {
      return Number(formatUnits(quote.pricePerShare, quote.effectiveDecimals));
    }
    return demo.illustrativeShareUsd ?? 1000;
  }, [quote.onChainSale, quote.pricePerShare, quote.effectiveDecimals, demo.illustrativeShareUsd]);

  const paySymbol = quote.onChainSale ? quote.paySymbol : "USDC";

  const totalUsd = Math.max(0, wholeShares * unitPriceUsd);
  const refDenom = referenceAssetValue > 0 ? referenceAssetValue : 1;
  const fraction = totalUsd / refDenom;
  const projectedAnnualRent =
    demo.annualRentalIncomeEur != null ? demo.annualRentalIncomeEur * fraction : 0;
  const ownershipPct = fraction * 100;
  const yieldPct = getEstimatedYieldPercent(demo);
  const yourSliceAssetEur = demo.illustrativePropertyValueUsd != null ? demo.illustrativePropertyValueUsd * fraction : 0;

  const maxWhole = Math.max(
    1,
    Math.min(
      Number.isFinite(availableSharesModel) ? Math.floor(availableSharesModel) : 999_999,
      999_999,
    ),
  );

  const sliderMaxUsd = Math.min(
    unitPriceUsd * maxWhole,
    Math.max(unitPriceUsd * 10, 50_000),
  );
  const [sliderUsd, setSliderUsd] = useState(unitPriceUsd * wholeShares || unitPriceUsd);

  useEffect(() => {
    setSliderUsd(wholeShares * unitPriceUsd);
  }, [unitPriceUsd, wholeShares]);

  function bump(delta: number) {
    const next = Math.min(maxWhole, Math.max(1, wholeShares + delta));
    onWholeSharesChange(next);
    setSliderUsd(next * unitPriceUsd);
  }

  function onSlider(usd: number) {
    const safe = Math.max(unitPriceUsd, Math.min(sliderMaxUsd, usd));
    setSliderUsd(safe);
    const n = Math.max(1, Math.floor(safe / unitPriceUsd));
    onWholeSharesChange(Math.min(maxWhole, n));
  }

  const projectedPortfolio = portfolioValueRefUsd + totalUsd;
  const projectedPropsCount =
    propertiesHeldCount + (!alreadyOwnsSelected && wholeShares > 0 ? 1 : 0);

  /** Visual bar: boost tiny percentages so the strip reads emotionally (still labeled numerically). */
  const barPct = Math.min(100, Math.max(3, Math.sqrt(ownershipPct * 120)));

  const monthlyRent = projectedAnnualRent / 12;
  const presets = [1, 10, 50].filter((n) => n <= maxWhole);

  return (
    <section className="rounded-2xl border border-brand/25 bg-brand/[0.06] p-6 sm:p-8" aria-labelledby="buy-box-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="buy-box-heading" className="text-lg font-semibold text-white">
            Buy box
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Whole shares × reference price. Modelled income uses gross rent × your stake ÷ reference asset value.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/[0.1] bg-black/35 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Your ownership</p>
        <p className="mt-1 text-base font-medium text-white">{propertyTitle}</p>
        <p className="mt-3 text-3xl font-semibold tabular-nums text-brand">{ownershipPct.toFixed(4)}%</p>
        <p className="mt-1 text-xs text-zinc-500">Reference economic interest in the asset (not land title).</p>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-emerald-500 transition-all duration-500"
            style={{ width: `${barPct}%` }}
          />
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-zinc-500">Property value (reference)</dt>
            <dd className="mt-1 font-mono text-lg text-white">{formatPropertyValueEur(demo)}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-zinc-500">Your share of value (model)</dt>
            <dd className="mt-1 font-mono text-lg text-emerald-200">
              {yourSliceAssetEur > 0
                ? new Intl.NumberFormat("de-AT", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(yourSliceAssetEur)
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Shares (whole)</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease shares"
            onClick={() => bump(-1)}
            disabled={wholeShares <= 1}
            className="rounded-xl border border-white/15 px-4 py-2 text-lg font-semibold text-white transition hover:border-brand/40 disabled:opacity-30"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center font-mono text-2xl text-white">{wholeShares}</span>
          <button
            type="button"
            aria-label="Increase shares"
            onClick={() => bump(1)}
            disabled={wholeShares >= maxWhole}
            className="rounded-xl border border-white/15 px-4 py-2 text-lg font-semibold text-white transition hover:border-brand/40 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 text-sm">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500">Price per whole share</p>
        <p className="mt-1 font-mono text-white">
          {unitPriceUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })} {paySymbol}
          {!quote.onChainSale ? (
            <span className="ml-2 text-[11px] font-normal text-amber-200/90">(reference — no primary sale bound)</span>
          ) : null}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-wide text-zinc-500">Total</p>
        <p className="mt-1 font-mono text-xl text-emerald-300/90">
          {totalUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })} {paySymbol}
        </p>
      </div>

      <div className="mt-6">
        <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Target investment ({paySymbol})
          <input
            type="range"
            min={unitPriceUsd}
            max={sliderMaxUsd}
            step={Math.max(unitPriceUsd, Math.floor(unitPriceUsd / 10))}
            value={Math.min(sliderMaxUsd, Math.max(unitPriceUsd, sliderUsd))}
            onChange={(e) => onSlider(Number(e.target.value))}
            className="mt-2 w-full accent-brand"
          />
        </label>
        <p className="mt-1 text-[11px] text-zinc-500">
          Snaps to whole shares · max {maxWhole.toLocaleString()} shares (model cap).
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-emerald-500/20 bg-emerald-950/[0.12] px-4 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400/90">Income engine (model)</p>
        <p className="mt-3 font-mono text-2xl text-emerald-100">{formatAnnualRentEur(projectedAnnualRent)}</p>
        <p className="text-xs text-zinc-500">Estimated yearly gross rent share</p>
        <p className="mt-2 font-mono text-sm text-zinc-300">
          {formatAnnualRentEur(monthlyRent)} <span className="text-zinc-500">/ month (÷12)</span>
        </p>
        <p className="mt-3 text-[10px] leading-snug text-zinc-500">{REFERENCE_YIELD_DISCLAIMER}</p>
        {presets.length > 0 ? (
          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">Passive income simulator</p>
            <ul className="mt-2 space-y-1.5 font-mono text-sm text-zinc-200">
              {presets.map((n) => (
                <li key={n}>
                  {n} shares → {formatAnnualRentEur(incomeForShares(demo, refDenom, unitPriceUsd, n))} / yr
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 rounded-xl border border-white/[0.08] bg-zinc-950/50 p-4 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">You receive (model)</p>
          <p className="mt-1 font-mono text-lg text-brand">
            {wholeShares} {symbol}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Est. gross yield</p>
          <p className="mt-1 font-mono text-lg text-white">{yieldPct.toFixed(2)}% p.a.</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Ownership (reference)</p>
          <p className="mt-1 font-mono text-lg text-white">{ownershipPct.toFixed(4)}%</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gold-500/20 bg-gold-950/[0.15] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gold-400/90">Portfolio preview (reference)</p>
        <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Current holdings (ref. USD)</dt>
            <dd className="mt-0.5 font-mono text-white">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                portfolioValueRefUsd,
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">After this sizing (ref. USD)</dt>
            <dd className="mt-0.5 font-mono text-gold-100">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                projectedPortfolio,
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Δ exposure from this line (ref.)</dt>
            <dd className="mt-0.5 font-mono text-white">
              +
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                totalUsd,
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Incremental yearly income (model)</dt>
            <dd className="mt-0.5 font-mono text-emerald-200">{formatAnnualRentEur(projectedAnnualRent)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500">Properties with exposure (model)</dt>
            <dd className="mt-0.5 font-mono text-white">{projectedPropsCount}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[10px] text-zinc-500">
          Reference weighting — not NAV. Manage positions on{" "}
          <Link href="/portfolio" className="text-brand hover:underline">
            Portfolio
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
