import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use — Building Culture",
  description: "Terms of use for Building Culture and Culture Land web interfaces.",
};

export default function LegalTermsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Terms of use</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: {new Date().getFullYear()}</p>
      </header>

      <div className="prose prose-invert prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Software status</h2>
          <p className="text-zinc-400">
            This website and related smart contracts are under active development. Interfaces and deployments may change
            or stop without notice — verify addresses and disclosures for the environment you use.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">No professional advice</h2>
          <p className="text-zinc-400">
            Nothing here is legal, tax, investment, or securities advice. You are responsible for compliance in your
            jurisdiction before any production use or token offering.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Wallets &amp; keys</h2>
          <p className="text-zinc-400">
            You control your wallet. We do not custody your private keys. Loss of keys or signing malicious
            transactions is your risk.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Limitation of liability</h2>
          <p className="text-zinc-400">
            To the maximum extent permitted by law, operators and contributors disclaim liability for damages arising
            from use of this software, including smart contract bugs, front-end errors, or third-party infrastructure.
          </p>
        </section>
      </div>
    </div>
  );
}
