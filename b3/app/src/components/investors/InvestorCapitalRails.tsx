import { Link } from "@tanstack/react-router";
import { ArrowRightLeft, Landmark, Wallet } from "lucide-react";

const CARD =
  "rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-white/[0.12]";

export function InvestorCapitalRails() {
  return (
    <section id="capital-rails" className="scroll-mt-24 space-y-6">
      <div className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
          Capital rails — direct stablecoin path
        </h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          As banks and custodians accept on-chain USD, angels and partners do not need to route
          through a multi-jurisdiction hop-chain for everyday diligence. We publish labeled wallets
          and live balances below. Institutional entity wrappers remain available for large checks
          under counsel — see appendix.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className={CARD}>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(0_82_255/30%)] bg-[rgb(0_82_255/12%)]">
            <Landmark className="h-5 w-5 text-neon" aria-hidden />
          </div>
          <h3 className="font-heading text-lg font-semibold text-white">Base (primary)</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            USDC, ETH, and BCC on Base mainnet. Protocol treasury lives in a Gnosis Safe multisig.
            x402 agent revenue and Limx settlement use separate labeled wallets when configured.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-zinc-500">
            <li>Live mainnet — balances refresh every ~60s</li>
            <li>
              BCC routing:{" "}
              <Link to="/bcc/dashboard" className="text-zinc-300 underline underline-offset-4">
                /bcc/dashboard
              </Link>
            </li>
            <li>
              On-chain proof:{" "}
              <Link to="/grant-proof" className="text-zinc-300 underline underline-offset-4">
                /grant-proof
              </Link>
            </li>
          </ul>
        </div>

        <div className={CARD}>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10">
            <ArrowRightLeft className="h-5 w-5 text-emerald-200/90" aria-hidden />
          </div>
          <h3 className="font-heading text-lg font-semibold text-white">XRPL (optional demo)</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Testnet intake wallet for diligence demos as stablecoin rails mature. Infrastructure under
            Culture ID — Building Culture is not an XRP project. Mainnet requires counsel and
            multisig policy before any settlement.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-zinc-500">
            <li>Testnet only in this release</li>
            <li>
              Trust layer:{" "}
              <Link to="/credentials" className="text-zinc-300 underline underline-offset-4">
                /credentials
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <aside className="flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-sm text-zinc-400">
        <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
        <p>
          Default path for ecosystem partners: stablecoin rails on Base. Entity layers (Delaware,
          Swiss holding, SPVs) are for scale and counsel-approved structures — not the everyday
          angel flow.
        </p>
      </aside>
    </section>
  );
}
