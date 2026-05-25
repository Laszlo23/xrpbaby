import type { DemoPropertyDetail } from "@/lib/demo-properties";
import { getInvestmentRuleRows, LIQUIDITY_RULES_REFERENCE_DISCLAIMER } from "@/lib/invest-reference-copy";

type Props = {
  demo: DemoPropertyDetail | undefined;
};

export function InvestLiquidityExitSection({ demo }: Props) {
  const rows = getInvestmentRuleRows(demo);

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-amber-950/[0.12] p-6 sm:p-8" aria-labelledby="liquidity-exit-heading">
      <h2 id="liquidity-exit-heading" className="text-lg font-semibold text-white">
        Investment rules (reference)
      </h2>
      <p className="mt-2 text-xs text-amber-100/85">{LIQUIDITY_RULES_REFERENCE_DISCLAIMER}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {rows.map(({ label, detail }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-amber-200/80">{label}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-zinc-300">{detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
