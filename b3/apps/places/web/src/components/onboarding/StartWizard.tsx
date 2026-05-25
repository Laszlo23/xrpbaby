"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { WalletConnectControls } from "@/components/WalletConnectControls";
import { flagshipCampaign, FLAGSHIP_PROPERTY_ID } from "@/lib/flagship-campaign";
import {
  REFERENCE_YIELD_BAND_LABEL,
  REFERENCE_YIELD_DISCLAIMER,
} from "@/lib/demo-properties";
import { readStartWizardStep, writeStartWizardStep } from "@/lib/start-wizard-storage";
import { useHydrated } from "@/lib/use-hydrated";

const STEP_COUNT = 5;
const flagshipPropertyPath = `/properties/${Number(FLAGSHIP_PROPERTY_ID)}`;

const stepsMeta = [
  { title: "What is this?", short: "Concept" },
  { title: "What you need", short: "Prepare" },
  { title: "What you're buying", short: "Ownership" },
  { title: "Connect", short: "Wallet" },
  { title: "What's next", short: "Go" },
] as const;

export function StartWizard() {
  const hydrated = useHydrated();
  const { isConnected } = useAccount();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const saved = readStartWizardStep();
    if (saved !== null) setStep(saved);
  }, []);

  const go = useCallback((next: number) => {
    const clamped = Math.min(STEP_COUNT - 1, Math.max(0, next));
    setStep(clamped);
    writeStartWizardStep(clamped);
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <header className="space-y-2 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">New here</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Start here</h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-zinc-400">
          A short walkthrough in plain language — no blockchain background required. Read issuer documents and{" "}
          <Link href="/legal/risk" className="text-eco-light underline-offset-2 hover:underline">
            Legal
          </Link>{" "}
          before investing.
        </p>
      </header>

      {/* Step tabs + progress */}
      <div className="glass-card-strong px-4 py-4 sm:px-5">
        <div className="mb-3 flex flex-wrap justify-center gap-1.5 sm:justify-between sm:gap-2">
          {stepsMeta.map((s, i) => {
            const active = i === step;
            return (
              <button
                key={s.title}
                type="button"
                onClick={() => hydrated && go(i)}
                disabled={!hydrated}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition sm:px-3 ${
                  active
                    ? "bg-eco/20 text-eco-light ring-1 ring-eco/40"
                    : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300"
                }`}
                aria-current={active ? "step" : undefined}
              >
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden">{s.short}</span>
              </button>
            );
          })}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-eco to-action transition-all duration-300"
            style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }}
          />
        </div>
      </div>

      <div className="glass-card min-h-[280px] p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Crowdfunding for buildings — with a digital record</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Building Culture lets you buy small pieces of curated real estate projects online. Your stake is recorded on
              a public network (Base) so ownership rules can be enforced transparently. You don&apos;t need to understand
              the tech to begin — only that you&apos;ll use a wallet app and read each issuer&apos;s documents.
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Listings often reference a planning yield band around{" "}
              <span className="text-zinc-300">{REFERENCE_YIELD_BAND_LABEL}</span> — that&apos;s an illustration, not a
              promise. Actual results depend on the project, taxes, occupancy, and law.
            </p>
            <p className="text-xs text-zinc-500">{REFERENCE_YIELD_DISCLAIMER}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">What you&apos;ll need</h2>
            <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-400">
              <li>
                <span className="text-zinc-300">A wallet</span> — an app that holds your account on the network (like a
                bank app, but you control the keys). You can create or connect one on the next step.
              </li>
              <li>
                <span className="text-zinc-300">A small amount of ETH</span> — for network fees on Base when you transact.
              </li>
              <li>
                <span className="text-zinc-300">USDC (or the token the listing quotes)</span> — to buy shares or use pool
                features where enabled.
              </li>
            </ul>
            <p className="text-sm text-zinc-500">
              More detail:{" "}
              <Link href="/guide" className="text-eco-light underline-offset-2 hover:underline">
                Guide
              </Link>{" "}
              ·{" "}
              <Link href="/how-it-works" className="text-eco-light underline-offset-2 hover:underline">
                How it works
              </Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">What you&apos;re buying</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              You&apos;re buying an economic interest defined in the issuer&apos;s offering documents — not a deed in
              your pocket. Rights, restrictions, and resale rules are in those documents and on-chain rules your
              wallet must satisfy (for example, compliance checks where required).
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              If something isn&apos;t clear, stop and read the data room or ask the issuer — we don&apos;t give
              investment advice here.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white">Create or connect your account (wallet)</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Use the controls below to connect a browser extension or mobile wallet. For more options and verification
              links, open the full{" "}
              <Link href="/onboarding#wallet" className="text-eco-light underline-offset-2 hover:underline">
                onboarding page
              </Link>
              .
            </p>
            {isConnected ? (
              <p className="rounded-lg border border-eco/30 bg-eco/10 px-4 py-3 text-sm text-eco-light">
                Wallet connected — you&apos;re ready for the next step.
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <WalletConnectControls />
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white">Browse listings</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Next: explore properties, open a listing, read disclosures, and follow the flow to invest where permitted.
              Some offers require identity verification — your issuer will say when.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-action to-action-light px-8 py-3 text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-action/20"
              >
                Browse properties
              </Link>
              <Link
                href={flagshipPropertyPath}
                className="inline-flex items-center justify-center rounded-full border border-eco/40 bg-eco/10 px-6 py-3 text-sm font-semibold text-eco-light transition hover:border-eco/60"
              >
                See flagship — {flagshipCampaign.displayName.split(" — ")[0]}
              </Link>
            </div>
            <p className="text-xs text-zinc-500">
              Deep dive:{" "}
              <Link href="/how-it-works" className="text-eco-light underline-offset-2 hover:underline">
                Investor journey
              </Link>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => go(step - 1)}
          className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-eco/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        {step < STEP_COUNT - 1 ? (
          <button
            type="button"
            onClick={() => go(step + 1)}
            className="rounded-full bg-gradient-to-r from-eco to-eco-light px-8 py-2.5 text-sm font-semibold text-[#0A0A0A] shadow-md shadow-eco/25"
          >
            Next
          </button>
        ) : (
          <Link
            href="/properties"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-eco to-eco-light px-8 py-2.5 text-sm font-semibold text-[#0A0A0A] shadow-md shadow-eco/25"
          >
            Go to listings
          </Link>
        )}
      </div>
    </div>
  );
}
