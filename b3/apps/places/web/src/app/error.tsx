"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-500/90">Something went wrong</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">We couldn&apos;t load this view</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        Try again — if the problem persists, return to listings or Culture Land.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-[10px] text-zinc-600">Ref: {error.digest}</p>
      ) : null}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-gradient-to-r from-eco to-eco-light px-6 py-3 text-sm font-semibold text-[#0a0f0d] shadow-lg shadow-eco/20 hover:opacity-95"
        >
          Try again
        </button>
        <Link
          href="/properties"
          className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-eco/40 hover:bg-white/[0.04]"
        >
          Browse properties
        </Link>
        <Link href="/culture-land" className="rounded-full px-6 py-3 text-sm font-medium text-zinc-400 hover:text-white">
          Culture Land
        </Link>
      </div>
    </div>
  );
}
