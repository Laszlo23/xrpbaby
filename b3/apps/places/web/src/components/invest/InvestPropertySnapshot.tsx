import type { DemoPropertyDetail } from "@/lib/demo-properties";

type Props = {
  demo: DemoPropertyDetail;
  symbol: string;
  assetValueLabel: string;
  annualRentLabel: string;
  sharePriceLabel: string;
  sharePriceSub?: string;
  availableSharesLabel: string;
};

export function InvestPropertySnapshot({
  demo,
  symbol,
  assetValueLabel,
  annualRentLabel,
  sharePriceLabel,
  sharePriceSub,
  availableSharesLabel,
}: Props) {
  const title = demo.investorCardTitle ?? demo.headline;
  const location = demo.investorCardSubtitle ?? demo.location;

  const rows = [
    { k: "Property", v: title, strong: true },
    { k: "Location", v: location },
    { k: "Asset value (reference)", v: assetValueLabel },
    { k: "Annual gross rent (reference)", v: annualRentLabel },
    { k: "Share price", v: sharePriceLabel, strong: true, sub: sharePriceSub },
    { k: "Available shares (model)", v: availableSharesLabel },
  ];

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8" aria-labelledby="invest-snapshot-heading">
      <h2 id="invest-snapshot-heading" className="text-lg font-semibold text-white">
        Property snapshot
      </h2>
      <p className="mt-1 text-xs text-zinc-500">Reference economics — issuer filings and Legal for full terms.</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {rows.map(({ k, v, strong, sub }) => (
          <div key={k} className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">{k}</dt>
            <dd className={`mt-1 text-sm ${strong ? "font-semibold text-white" : "text-zinc-200"}`}>{v}</dd>
            {sub ? <p className="mt-1 text-[11px] text-zinc-500">{sub}</p> : null}
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[11px] text-zinc-500">
        Share token symbol on-chain: <span className="font-mono text-zinc-400">{symbol}</span>
      </p>
    </section>
  );
}
