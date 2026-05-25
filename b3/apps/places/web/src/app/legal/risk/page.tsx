import type { Metadata } from "next";
import Link from "next/link";
import { explorerBase } from "@/lib/contracts";

export const metadata: Metadata = {
  title: "Risks & disclaimer — Building Culture",
  description: "Risk factors and disclaimers for Building Culture tokenized real estate interfaces.",
};

export default function LegalRiskPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Risks &amp; disclaimer</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          This software is provided as-is. Real estate tokenization may be regulated in your jurisdiction.
        </p>
      </header>

      <div className="prose prose-invert prose-sm max-w-none space-y-8">
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Tokenization model</h2>
          <p className="text-zinc-400">
            Share tokens represent fractional economic interest as defined by the issuer&apos;s legal structure (e.g.,
            SPV, series LLC, or trust). The smart contract enforces transfers and compliance; it does not convey title
            to real property unless paired with off-chain legal agreements.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Custody &amp; property</h2>
          <p className="text-zinc-400">
            Physical assets remain in traditional custody. On-chain tokens track entitlement to cash flows or
            governance as described in offering documents.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Proof NFTs</h2>
          <p className="text-zinc-400">
            Optional certificate NFTs are soulbound (non-transferable) receipts. They are not legal title or proof
            of accredited status beyond what the underlying ERC-20 represents.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Smart contract risk</h2>
          <p className="text-zinc-400">
            On-chain contracts may contain bugs or be exploited. Use audits, bug bounties, and staged rollouts before
            mainnet. Misconfigured compliance allowlists can restrict liquidity.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">KYC &amp; privacy</h2>
          <p className="text-zinc-400">
            Off-chain identity checks use your chosen provider. Verification status may be visible on-chain. Do not
            place PII on-chain.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Lending interfaces</h2>
          <p className="text-zinc-400">
            The lending pool is not a licensed lending product. Borrow limits depend on oracles; liquidations can
            occur. Oracle manipulation is a critical risk in production systems.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Audits &amp; verification</h2>
          <p className="text-zinc-400">
            Before mainnet, publish audit reports. For this deployment, use the{" "}
            <a href={explorerBase} target="_blank" rel="noreferrer" className="text-brand hover:underline">
              block explorer
            </a>{" "}
            and the{" "}
            <Link href="/contracts" className="text-brand hover:underline">
              contracts page
            </Link>{" "}
            to verify bytecode and transactions.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Names, imagery, and marketing</h2>
          <p className="text-zinc-400">
            References to people, brands, or specific buildings in UI copy are <strong className="text-zinc-300">for
            presentation only</strong> unless separately licensed or verified. Obtain appropriate rights and legal review
            before using third-party names, trademarks, or photography in production marketing.
          </p>
        </section>
      </div>
    </div>
  );
}
