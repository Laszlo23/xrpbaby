import Link from "next/link";
import { TrustSection } from "@/components/TrustSection";
import { explorerBase } from "@/lib/contracts";

export default function MarketPage() {
  return (
    <div className="mx-auto max-w-[1280px] space-y-10 pb-16">
      <header className="space-y-3 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold-500/80">Secondary market</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Marketplace</h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400">
          Trade property share tokens against the OG/WETH AMM. Listings and order books below are{" "}
          <strong className="text-zinc-300">roadmap placeholders</strong> — today, price discovery runs through the
          same pool as <Link href="/trade" className="text-gold-400 hover:underline">Buy shares</Link>.
        </p>
      </header>

      <TrustSection />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white">AMM (live)</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Swaps execute against Uniswap V2–style pairs via the deployed router. Depth and slippage depend on LP
            positions.
          </p>
          <Link
            href="/trade"
            className="mt-4 inline-flex rounded-full bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-2.5 text-sm font-semibold text-black"
          >
            Go to Buy / Swap
          </Link>
        </div>
        <div className="glass-card border-dashed border-gold-500/20 p-6">
          <h2 className="text-lg font-semibold text-zinc-300">Order book (coming soon)</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Limit orders and peer-to-peer transfers for compliant wallets can sit above the AMM. Grant narrative:
            hybrid liquidity — CLOB + AMM for real estate hours.
          </p>
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/40 p-4 font-mono text-xs text-zinc-600">
            <div className="flex justify-between border-b border-white/5 py-2">
              <span>Price (OG)</span>
              <span>Size</span>
            </div>
            <p className="py-8 text-center text-zinc-600">No orders — connect to roadmap</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white">Price chart (placeholder)</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Wire historical OHLC from subgraph + indexer. For demos, link users to{" "}
          <a href={explorerBase} target="_blank" rel="noreferrer" className="text-gold-400 hover:underline">
            explorer
          </a>{" "}
          for transaction history.
        </p>
        <div className="mt-6 flex aspect-[2.5/1] max-h-48 items-end justify-between gap-1 rounded-xl border border-white/[0.06] bg-gradient-to-t from-gold-900/20 to-transparent px-4 pb-2 pt-8">
          {[40, 55, 48, 62, 58, 70, 65, 72, 68, 75].map((h, i) => (
            <div
              key={i}
              className="w-full rounded-t-sm bg-gradient-to-t from-gold-600/40 to-gold-400/20"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-zinc-600">
        For binary prediction markets on the same stack, see <Link href="/markets" className="text-zinc-400 hover:underline">Markets</Link>.
      </p>
    </div>
  );
}
