import type { PortfolioMarqueeStat } from "../types.js";

type Props = {
  stats: PortfolioMarqueeStat[];
};

export function PortfolioMarquee({ stats }: Props) {
  return (
    <section className="border-y border-[hsl(0_0%_100%/0.1)] bg-[#0a0a0a]">
      <div className="grid grid-cols-2 divide-x divide-y border-[hsl(0_0%_100%/0.1)] md:grid-cols-5 md:divide-y-0">
        {stats.map(({ value, label }) => (
          <div key={label} className="px-6 py-8 text-center">
            <p className="pp-display text-3xl text-[hsl(30_15%_92%)] md:text-4xl">{value}</p>
            <p className="pp-mono mt-2 text-[10px] uppercase tracking-[0.25em] text-[hsl(30_10%_92%/0.5)]">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
