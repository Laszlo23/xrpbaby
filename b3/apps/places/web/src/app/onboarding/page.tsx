"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount, useConnect } from "wagmi";

const steps = [
  {
    n: 1,
    title: "Create or connect your account (wallet)",
    body: "Use a wallet app on Base — the network we deploy on. Your address is your account; there is no separate username unless you use a provider that adds one.",
    cta: { href: "#wallet", label: "Connect below" },
  },
  {
    n: 2,
    title: "Verification when required",
    body: "Some tokens are restricted. You may need to verify identity before you can hold or trade — your issuer or the app will prompt you when it applies.",
    cta: { href: "/kyc", label: "Verification hub" },
  },
  {
    n: 3,
    title: "Fund your wallet",
    body: "Keep a little ETH on Base for fees, and USDC (or the token the listing quotes) for purchases and pool features where enabled.",
    cta: { href: "/guide", label: "Read the guide" },
  },
  {
    n: 4,
    title: "Pick a listing and invest",
    body: "Open a property, read the documents, and follow the flow to buy — or use pool pages where configured.",
    cta: { href: "/properties", label: "Browse properties" },
  },
];

export default function OnboardingPage() {
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const done = isConnected ? 1 : 0;
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-16">
      <header className="space-y-3 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">
          Prefer a gentler intro?{" "}
          <Link href="/start" className="text-eco-light underline-offset-2 hover:underline">
            Start here (plain English)
          </Link>
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Get started</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Four steps from “new wallet” to exploring listings. New to the concepts? Use the short walkthrough at{" "}
          <Link href="/start" className="text-eco-light underline-offset-2 hover:underline">
            /start
          </Link>{" "}
          first.
        </p>
      </header>

      {/* Progress */}
      <div className="glass-card-strong px-5 py-4">
        <div className="mb-2 flex justify-between text-xs text-zinc-500">
          <span>Progress</span>
          <span className="font-mono text-eco-light">{done} / 4</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-eco to-action transition-all duration-500"
            style={{ width: `${(done / 4) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">
          Step 1 completes when your wallet is connected. Later steps depend on issuer rules and what you choose to do.
        </p>
      </div>

      <div className="glass-card border-white/10 p-0">
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-medium text-zinc-300 transition hover:text-white"
          aria-expanded={advancedOpen}
        >
          <span>Advanced (technical)</span>
          <span className="text-zinc-500" aria-hidden>
            {advancedOpen ? "−" : "+"}
          </span>
        </button>
        {advancedOpen && (
          <div className="space-y-3 border-t border-white/[0.06] px-5 pb-5 pt-2 text-xs leading-relaxed text-zinc-500">
            <p>
              Restricted share tokens may use an on-chain <span className="text-zinc-400">ComplianceRegistry</span>.
              Tokens are typically ERC-20 on Base; liquidity and pricing may involve AMM or issuer-controlled flows — see
              each listing and{" "}
              <Link href="/how-it-works" className="text-eco-light underline-offset-2 hover:underline">
                How it works
              </Link>{" "}
              for detail.
            </p>
            <p>
              Issuer tools: <Link href="/issuer" className="text-eco-light underline-offset-2 hover:underline">Issuer console</Link>.
            </p>
          </div>
        )}
      </div>

      <div id="wallet" className="space-y-4">
        {steps.map((s) => (
          <div key={s.n} className="glass-card flex gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-eco/40 bg-eco/15 text-sm font-semibold text-eco-light">
              {s.n}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-white">{s.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{s.body}</p>
              <Link
                href={s.cta.href}
                className="mt-3 inline-block text-sm font-medium text-action hover:underline"
              >
                {s.cta.label} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {!isConnected ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => connect({ connector: connectors[0] })}
            className="rounded-full bg-gradient-to-r from-action to-action-light px-8 py-3 text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-action/20 disabled:opacity-50"
          >
            {isPending ? "Connecting…" : "Create or connect wallet"}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <p className="text-sm text-eco-light">Wallet connected — verify when your issuer requires it.</p>
            <Link
              href="/kyc"
              className="rounded-full bg-gradient-to-r from-eco to-eco-light px-6 py-2.5 text-sm font-semibold text-[#0A0A0A] shadow-md shadow-eco/20"
            >
              Verify with Veriff
            </Link>
          </div>
        )}
        <Link href="/trade" className="text-sm text-zinc-400 hover:text-white">
          Skip to Buy →
        </Link>
      </div>
    </div>
  );
}
