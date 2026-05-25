import type { Metadata } from "next";
import Link from "next/link";
import { ContractsPageClient } from "@/components/contracts/ContractsPageClient";

export const metadata: Metadata = {
  title: "Contracts — Building Culture",
  description: "Verify core protocol and property share token addresses on Base mainnet.",
};

export default function ContractsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Transparency</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Contracts &amp; tokens</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
          Copy addresses and open the block explorer to verify bytecode and transactions. Property share tokens are
          listed when the registry is configured and properties exist on-chain.
        </p>
        <p className="text-xs text-zinc-600">
          <Link href="/legal/risk" className="hover:text-zinc-400">
            Risks &amp; disclaimer
          </Link>
          {" · "}
          Verify deployments on-chain before sending funds — not an investment offering.
        </p>
      </header>

      <ContractsPageClient />
    </div>
  );
}
