import Link from "next/link";

type Props = {
  propertyIdStr: string;
  chainLabel: string;
  paySymbol: string;
  totalPayDisplay: string;
  wholeShares: number;
  symbol: string;
};

export function InvestTradeLinks({
  propertyIdStr,
  chainLabel,
  paySymbol,
  totalPayDisplay,
  wholeShares,
  symbol,
}: Props) {
  return (
    <section className="rounded-2xl border border-emerald-500/25 bg-emerald-950/[0.15] p-6 sm:p-8" aria-labelledby="trade-links-heading">
      <h2 id="trade-links-heading" className="text-lg font-semibold text-white">
        Investment action
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Connect your wallet in the site header. Execution happens on Trade — primary issuance uses USDC approvals when a
        sale contract is live; secondary uses the AMM when pools exist.
      </p>

      <div className="mt-6 rounded-xl border border-white/[0.08] bg-black/35 px-4 py-4 text-sm">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500">Confirmation preview</p>
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">You pay (reference)</dt>
            <dd className="font-mono text-white">
              {totalPayDisplay} {paySymbol}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">You receive (intent)</dt>
            <dd className="font-mono text-brand">
              {wholeShares} {symbol}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Network</dt>
            <dd className="text-zinc-200">{chainLabel}</dd>
          </div>
        </dl>
      </div>

      <Link
        href={`/trade?property=${propertyIdStr}&market=primary`}
        className="mt-6 block w-full rounded-full bg-gradient-to-r from-emerald-600 to-brand py-3.5 text-center text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-emerald-900/20 hover:opacity-95"
      >
        Buy shares
      </Link>
      <Link
        href={`/trade?property=${propertyIdStr}&market=secondary`}
        className="mt-3 block w-full rounded-full border border-white/15 py-3 text-center text-sm font-medium text-zinc-200 hover:border-brand/40 hover:text-white"
      >
        Secondary market
      </Link>
    </section>
  );
}
