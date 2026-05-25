"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DemoPropertyDetail } from "@/lib/demo-properties";
import {
  REFERENCE_YIELD_DISCLAIMER,
  formatAnnualRentEur,
  formatPropertyValueEur,
  getEstimatedYieldPercent,
  getReferencePricePerShareUnits,
} from "@/lib/demo-properties";
import { demoAvailableShares, demoWholeTokenSupply } from "@/lib/demo-investment-math";
import { getFundingStats } from "@/lib/funding-stats";

type Props = {
  propertyId: bigint;
  demo?: DemoPropertyDetail;
  symbol: string;
  tradeHref: string;
};

const PRESETS_EUR = [500, 1_000, 5_000, 10_000];
const PRESETS_USD = [500, 1_000, 5_000, 10_000];

function formatMoney(currency: "EUR" | "USD", n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

function AllocationSlider({
  goalRef,
  notional,
  onPick,
}: {
  goalRef: number;
  notional: number;
  onPick: (n: number) => void;
}) {
  const max = Math.min(500_000, Math.max(10_000, Math.floor(goalRef * 0.03)));
  const sliderVal = Number.isFinite(notional) && notional > 0 ? Math.min(Math.max(notional, 100), max) : 100;
  return (
    <input
      type="range"
      min={100}
      max={max}
      step={Math.max(50, Math.floor(max / 500))}
      value={sliderVal}
      onChange={(e) => onPick(Number(e.target.value))}
      className="mt-4 w-full accent-brand"
      aria-label="Allocation amount"
    />
  );
}

export function PropertyInvestmentCalculator({ propertyId, demo, symbol, tradeHref }: Props) {
  const goalRef = demo?.illustrativePropertyValueUsd ?? 10_000_000;
  const currency = demo?.simulatorCurrency ?? "USD";
  const presets = currency === "EUR" ? PRESETS_EUR : PRESETS_USD;

  const [notionalStr, setNotionalStr] = useState(currency === "EUR" ? "1000" : "1000");
  const pricePerShareRef = demo ? getReferencePricePerShareUnits(demo) : null;

  const notional = useMemo(() => {
    const n = parseFloat(notionalStr.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [notionalStr]);

  const shareUsd = demo?.illustrativeShareUsd ?? 1000;
  const funding = getFundingStats(propertyId, goalRef);
  const cap = demoWholeTokenSupply(goalRef);
  const available = demoAvailableShares(propertyId, goalRef);

  const fraction = goalRef > 0 ? notional / goalRef : 0;

  const estTokens = useMemo(() => {
    if (!demo || notional <= 0) return null;
    if (pricePerShareRef != null && pricePerShareRef > 0) return notional / pricePerShareRef;
    return notional / shareUsd;
  }, [demo, notional, pricePerShareRef, shareUsd]);

  const projectedAnnualRent = useMemo(() => {
    if (!demo || notional <= 0) return null;
    return demo.annualRentalIncomeEur * fraction;
  }, [demo, notional, fraction]);

  const yieldPct = demo ? getEstimatedYieldPercent(demo) : 0;

  return (
    <section id="invest" className="glass-card scroll-mt-28 p-6">
      <h2 className="text-lg font-semibold text-white">Investment simulator</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Planning model — actual economics follow issuer documents and on-chain execution. {REFERENCE_YIELD_DISCLAIMER}
      </p>

      <div className="mt-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Choose allocation ({currency === "EUR" ? "€" : "$"} reference)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setNotionalStr(String(p))}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                notionalStr === String(p)
                  ? "border-brand bg-brand/15 text-brand-light"
                  : "border-white/15 text-zinc-400 hover:border-white/25 hover:text-white"
              }`}
            >
              {formatMoney(currency, p)}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Custom amount ({currency})
          <input
            type="text"
            inputMode="decimal"
            value={notionalStr}
            onChange={(e) => setNotionalStr(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 font-mono text-lg text-white focus:border-brand/50 focus:outline-none"
          />
        </label>
        <AllocationSlider goalRef={goalRef} notional={notional} onPick={(n) => setNotionalStr(String(n))} />
      </div>

      <div className="mt-6 grid gap-4 rounded-xl border border-white/[0.06] bg-black/30 p-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">You receive (model)</p>
          <p className="mt-1 font-mono text-xl text-brand">
            {estTokens != null ? estTokens.toFixed(4) : "—"} <span className="text-sm text-zinc-400">{symbol}</span>
          </p>
          <p className="mt-2 text-[11px] text-zinc-500">
            Ref. price per token ~{" "}
            {pricePerShareRef != null
              ? `${formatMoney(currency, pricePerShareRef)} (asset ÷ supply cap)`
              : `~${currency === "EUR" ? "€" : "$"}${shareUsd.toLocaleString()} / token (fallback)`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Projected gross rent share (model)</p>
          <p className="mt-1 font-mono text-xl text-emerald-300/90">
            {projectedAnnualRent != null ? formatAnnualRentEur(projectedAnnualRent) : "—"}{" "}
            <span className="text-xs font-normal text-zinc-500">/ yr</span>
          </p>
          <p className="mt-2 text-[11px] text-zinc-500">
            Scaled from reference gross rent × (your allocation ÷ reference asset value). Yield band{" "}
            {yieldPct.toFixed(1)}% gross (model).
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gold-500/20 bg-gold-950/[0.15] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gold-400/90">Portfolio preview (after)</p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Reference allocation</dt>
            <dd className="mt-0.5 font-mono text-white">{notional > 0 ? formatMoney(currency, notional) : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Expected annual income (model)</dt>
            <dd className="mt-0.5 font-mono text-gold-200">
              {projectedAnnualRent != null ? formatAnnualRentEur(projectedAnnualRent) : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500">Asset</dt>
            <dd className="mt-0.5 text-zinc-200">{demo?.investorCardTitle ?? demo?.headline ?? symbol}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[10px] text-zinc-500">
          Single-asset preview — combine with other holdings on{" "}
          <Link href="/portfolio" className="text-brand hover:underline">
            Portfolio
          </Link>
          .
        </p>
      </div>

      <dl className="mt-6 grid gap-3 border-t border-white/[0.06] pt-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-zinc-500">Token supply cap (model)</dt>
          <dd className="font-mono text-zinc-200">{cap.toLocaleString("en-US")} shares</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Available (reference)</dt>
          <dd className="font-mono text-zinc-200">{available.toLocaleString("en-US")} shares</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Round progress (demo)</dt>
          <dd className="text-brand">{Math.round(funding.progress * 100)}%</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Reference asset value</dt>
          <dd className="font-mono text-zinc-200">{demo ? formatPropertyValueEur(demo) : "—"}</dd>
        </div>
      </dl>

      <Link
        href={tradeHref}
        className="mt-6 block w-full rounded-full bg-gradient-to-r from-brand to-gold-600 py-3.5 text-center text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-brand/20 hover:opacity-95"
      >
        Continue to invest
      </Link>
    </section>
  );
}
