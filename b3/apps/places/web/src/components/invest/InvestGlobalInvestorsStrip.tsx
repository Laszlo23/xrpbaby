import { getDemoInvestorRegions } from "@/lib/funding-stats";
import type { FundingStats } from "@/lib/funding-stats";

type Props = {
  propertyId: bigint;
  funding: FundingStats;
};

export function InvestGlobalInvestorsStrip({ propertyId, funding }: Props) {
  const regions = getDemoInvestorRegions(propertyId);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5 sm:px-8" aria-labelledby="global-investors-heading">
      <h2 id="global-investors-heading" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Global investors (reference narrative)
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Reference campaign context — not live indexed geography.{" "}
        <span className="font-medium text-zinc-200">{funding.investors.toLocaleString()} investors</span>,{" "}
        <span className="font-medium text-zinc-200">{funding.countries} countries</span> in this model.
      </p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {regions.map((r) => (
          <li
            key={`${r.countryCode}-${r.city}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/30 px-3 py-1.5 text-sm text-zinc-200"
          >
            <span aria-hidden>{r.flag}</span>
            <span>{r.city}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
