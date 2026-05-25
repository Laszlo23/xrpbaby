import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy — Building Culture",
  description: "Privacy policy for Building Culture web interfaces.",
};

export default function LegalPrivacyPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Privacy policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: {new Date().getFullYear()}</p>
      </header>

      <div className="prose prose-invert prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Wallet addresses</h2>
          <p className="text-zinc-400">
            Connecting a wallet exposes your public address to the application and, when you transact, to the public
            blockchain. Addresses are pseudonymous, not anonymous.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">KYC &amp; identity</h2>
          <p className="text-zinc-400">
            If you use issuer or compliance flows, identity checks may be processed by third-party providers under
            their terms. Do not put personal information on-chain.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Logs &amp; analytics</h2>
          <p className="text-zinc-400">
            Hosting providers may collect standard server logs (IP, user agent). The application does not require accounts
            by default; analytics, if enabled, should be configured by the deployment operator.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-medium text-zinc-200">Contact</h2>
          <p className="text-zinc-400">
            For privacy requests related to a production deployment, use the contact method published by that
            deployment&apos;s operator. Unless otherwise stated by that operator, there is no separate data controller beyond generic hosting logs.
          </p>
        </section>
      </div>
    </div>
  );
}
