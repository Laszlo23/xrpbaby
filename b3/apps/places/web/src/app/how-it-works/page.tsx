import type { Metadata } from "next";
import Link from "next/link";
import { InvestorJourney } from "@/components/InvestorJourney";

export const metadata: Metadata = {
  title: "How it works — Building Culture",
  description:
    "Connect, verify, fund with ETH/USDC on Base, and buy fractional property shares.",
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-16">
      <header className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">For investors</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">How it works</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
          A simple path from wallet to property exposure — with liquidity where AMM pools exist and clear separation
          between primary issuance and secondary trading. Operators can read the{" "}
          <Link href="/guide" className="text-brand hover:underline">
            operator guide
          </Link>
          .
        </p>
      </header>

      <InvestorJourney />

      <section className="glass-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">What you own</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Each property can have an ERC-20 <strong className="text-zinc-300">share token</strong> representing a
          fractional economic interest as defined by the issuer&apos;s legal structure — not automatic land title. On-chain
          numbers and metadata are <strong className="text-zinc-300">reference</strong> until you reconcile them with issuer
          filings and disclosures.
        </p>
      </section>

      <section className="glass-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Primary vs secondary</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          In the seeded listing model, <strong className="text-zinc-300">one whole share</strong> (1.0 token) lines up with about{" "}
          <strong className="text-zinc-300">$1,000</strong> notional at seed time. Issuers can offer{" "}
          <strong className="text-zinc-300">primary</strong> sales that only sell whole shares (minimum one), at a
          price they set in the configured settlement asset (e.g. USDC on Base). On the{" "}
          <Link href="/trade" className="text-brand hover:underline">
            Trade
          </Link>{" "}
          page, the <strong className="text-zinc-300">AMM</strong> is a <strong className="text-zinc-300">secondary</strong>{" "}
          market: you can buy or sell <strong className="text-zinc-300">fractional</strong> shares; pool prices move with
          liquidity, not a fixed ticket size.
        </p>
      </section>

      <section className="glass-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Liquidity &amp; trading</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          When a pool exists, you can swap against the paired asset for shares on the{" "}
          <Link href="/trade" className="text-brand hover:underline">
            Trade
          </Link>{" "}
          page. If no pool is deployed for a token, only wallet-to-wallet transfers apply — same as any ERC-20.
        </p>
      </section>

      <section className="glass-card border border-amber-500/20 bg-amber-950/10 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-amber-200/90">Risks</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Smart contracts, oracles, and liquidity can fail. Read the{" "}
          <Link href="/legal/risk" className="text-brand hover:underline">
            risk disclaimer
          </Link>{" "}
          before relying on any production deployment.
        </p>
      </section>

      <section className="text-center">
        <h2 className="text-lg font-semibold text-white">Verify on-chain</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
          Copy contract addresses and open the explorer to confirm transactions and bytecode.
        </p>
        <Link
          href="/contracts"
          className="mt-4 inline-flex rounded-full border border-brand/40 bg-brand/10 px-6 py-2.5 text-sm font-semibold text-brand hover:bg-brand/20"
        >
          View contracts &amp; tokens
        </Link>
      </section>
    </div>
  );
}
