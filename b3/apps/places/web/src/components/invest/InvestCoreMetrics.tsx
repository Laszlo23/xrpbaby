import Link from "next/link";
import type { DemoPropertyDetail } from "@/lib/demo-properties";
import {
  REFERENCE_YIELD_BAND_LABEL,
  REFERENCE_YIELD_DISCLAIMER,
  formatAnnualRentEur,
  formatPropertyValueEur,
  getEstimatedYieldPercent,
} from "@/lib/demo-properties";

type Props = {
  demo: DemoPropertyDetail;
  sharePriceLabel: string;
  sharePriceSub?: string;
};

export function InvestCoreMetrics({ demo, sharePriceLabel, sharePriceSub }: Props) {
  const yieldPct = getEstimatedYieldPercent(demo);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8" aria-labelledby="core-metrics-heading">
      <h2 id="core-metrics-heading" className="sr-only">
        Reference metrics
      </h2>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Asset value (ref.)</dt>
          <dd className="mt-1 font-mono text-lg text-white">{formatPropertyValueEur(demo)}</dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Annual gross rent</dt>
          <dd className="mt-1 font-mono text-lg text-emerald-300/90">{formatAnnualRentEur(demo.annualRentalIncomeEur)}</dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Share price</dt>
          <dd className="mt-1 font-mono text-lg text-white">{sharePriceLabel}</dd>
          {sharePriceSub ? <p className="mt-1 text-[10px] text-zinc-500">{sharePriceSub}</p> : null}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3 sm:col-span-2 lg:col-span-2">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Est. gross yield (reference)</dt>
          <dd className="mt-1 font-mono text-lg text-brand">{yieldPct.toFixed(2)}% p.a.</dd>
          <dd className="mt-1 text-[10px] text-zinc-500">
            Band shown elsewhere: {REFERENCE_YIELD_BAND_LABEL}. {REFERENCE_YIELD_DISCLAIMER}
          </dd>
          <p className="mt-2 text-[10px] text-zinc-600">
            See{" "}
            <Link href="/legal/risk" className="text-brand hover:underline">
              risks
            </Link>
            .
          </p>
        </div>
      </dl>
    </section>
  );
}
