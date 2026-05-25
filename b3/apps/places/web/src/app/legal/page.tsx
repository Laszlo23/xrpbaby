import Link from "next/link";
import { explorerBase } from "@/lib/contracts";

export default function LegalPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Trust &amp; transparency</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Legal overview</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Building Culture publishes software and on-chain interfaces for Culture Land listings. This overview is
          informational — use counsel-approved documents for any regulated offering or subscription.
        </p>
      </header>

      <section className="glass-card p-6">
        <h2 className="text-lg font-medium text-white">Grant narrative (what to emphasize)</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-400">
          <li>Open architecture: registry, factory-issued ERC-20 shares, AMM router, optional compliance registry.</li>
          <li>User flow that mirrors real investing: onboarding → KYC hook → swap → portfolio → explorer links.</li>
          <li>Extensible: subgraph + KYC webhooks + issuer console — clear path from rehearsal to production issuance.</li>
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/legal/terms"
          className="glass-card block p-5 transition hover:border-brand/30"
        >
          <h2 className="font-medium text-white">Terms of use</h2>
          <p className="mt-2 text-sm text-zinc-500">Software license scope and acceptable use.</p>
        </Link>
        <Link
          href="/legal/privacy"
          className="glass-card block p-5 transition hover:border-brand/30"
        >
          <h2 className="font-medium text-white">Privacy policy</h2>
          <p className="mt-2 text-sm text-zinc-500">Wallets, logs, and third-party services.</p>
        </Link>
        <Link
          href="/legal/risk"
          className="glass-card block p-5 transition hover:border-brand/30 sm:col-span-2"
        >
          <h2 className="font-medium text-white">Risks &amp; disclaimer</h2>
          <p className="mt-2 text-sm text-zinc-500">Tokenization, smart contracts, lending interfaces, and verification.</p>
        </Link>
      </section>

      <p className="text-sm text-zinc-500">
        Verify deployments on the{" "}
        <a href={explorerBase} target="_blank" rel="noreferrer" className="text-brand hover:underline">
          block explorer
        </a>{" "}
        or the{" "}
        <Link href="/contracts" className="text-brand hover:underline">
          contracts page
        </Link>
        .
      </p>

      <p className="text-center text-xs text-zinc-600">
        <Link href="/" className="text-zinc-500 hover:text-brand">
          ← Home
        </Link>
      </p>
    </div>
  );
}
