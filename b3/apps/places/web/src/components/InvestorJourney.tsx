"use client";

import Link from "next/link";
import { Fragment } from "react";

const steps = [
  { n: 1, title: "Connect wallet", hint: "Link your Web3 wallet", href: "/onboarding#wallet" },
  { n: 2, title: "Verify identity", hint: "Compliance (deployment rules)", href: "/onboarding" },
  {
    n: 3,
    title: "Fund wallet",
    hint: "ETH + USDC on Base",
    href: "/invest",
  },
  { n: 4, title: "Invest", hint: "Pick a property", href: "/properties" },
];

function ArrowRight() {
  return (
    <div className="hidden shrink-0 items-center justify-center px-1 lg:flex" aria-hidden>
      <svg className="h-10 w-10 text-eco/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="flex justify-center py-1 lg:hidden" aria-hidden>
      <svg className="h-8 w-8 text-eco/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
        <path d="M5 9l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function InvestorJourney() {
  return (
    <section className="glass-card overflow-hidden border-eco/20 p-6 sm:p-8">
      <div className="mb-10 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-eco-muted">How it works</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Four steps to invest</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          Same rhythm as a modern fintech app — powered by smart contracts on Base.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-center lg:gap-1">
        {steps.map((s, i) => (
          <Fragment key={s.n}>
            <Link
              href={s.href}
              className="group relative flex min-h-[180px] flex-1 flex-col rounded-2xl border border-eco/15 bg-forest/25 p-6 transition hover:border-action/35 hover:bg-forest/40 lg:max-w-none"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-eco/50 bg-eco/15 text-base font-bold text-white">
                  {s.n}
                </span>
              </div>
              <h3 className="font-semibold text-canvas">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.hint}</p>
            </Link>
            {i < steps.length - 1 ? (
              <>
                <ArrowRight />
                <ArrowDown />
              </>
            ) : null}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
