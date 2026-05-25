"use client";

import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import { useHydrated } from "@/lib/use-hydrated";
import { ButtonLink } from "@/components/ui/Button";

export function HomeFinalCta() {
  const hydrated = useHydrated();
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-action/25 bg-gradient-to-br from-action/10 via-forest-deep/50 to-forest/80 px-8 py-14 text-center sm:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(63,143,107,0.15),_transparent_60%)]" aria-hidden />
      <h2 className="relative text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Start owning real estate today
      </h2>
      <p className="relative mx-auto mt-4 max-w-lg text-sm text-muted">Start with a wallet, explore listings, and build your on-chain position — where permitted.</p>
      <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
        <ButtonLink href="/properties">Explore projects</ButtonLink>
        {!hydrated ? (
          <span className="inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-full border border-eco/40 px-6 py-2.5 text-sm font-semibold text-canvas opacity-60">
            Connect wallet
          </span>
        ) : isConnected ? (
          <Link
            href="/portfolio"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-eco/40 px-6 py-2.5 text-sm font-semibold text-canvas transition hover:border-eco/70 hover:bg-eco/10"
          >
            Open portfolio
          </Link>
        ) : (
          <button
            type="button"
            disabled={isPending || !connectors[0]}
            onClick={() => connectors[0] && connect({ connector: connectors[0] })}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-eco/40 px-6 py-2.5 text-sm font-semibold text-canvas transition hover:border-eco/70 hover:bg-eco/10 disabled:opacity-50"
          >
            {isPending ? "Connecting…" : "Connect wallet"}
          </button>
        )}
      </div>
      <p className="relative mt-6 text-[10px] text-muted">
        New here?{" "}
        <Link href="/start" className="text-eco-light underline-offset-2 hover:underline">
          Start with a simple walkthrough
        </Link>{" "}
        ·{" "}
        <Link href="/onboarding" className="text-eco-light underline-offset-2 hover:underline">
          Full onboarding
        </Link>
      </p>
    </section>
  );
}
