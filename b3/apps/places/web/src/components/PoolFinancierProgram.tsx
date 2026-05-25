"use client";

import Link from "next/link";
import { REFERENCE_YIELD_BAND_LABEL, REFERENCE_YIELD_DISCLAIMER } from "@/lib/demo-properties";

/** Pool-financier perks and reference return framing — subject to issuer terms. */
export function PoolFinancierProgram() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">For qualified pool financiers</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Reference programme terms</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
        Partner discussions include a{" "}
        <span className="text-zinc-300">
          target return band around {REFERENCE_YIELD_BAND_LABEL} p.a.
        </span>{" "}
        for appropriate structures — aligned with the same reference band shown on listings.{" "}
        <strong className="font-medium text-zinc-300">This is not guaranteed.</strong> Final economics depend on the instrument,
        issuer terms, collateral, timing, tax treatment, and market conditions. Review binding documents only.
      </p>
      <p className="mt-2 text-xs text-zinc-500">{REFERENCE_YIELD_DISCLAIMER}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-5">
          <h3 className="text-sm font-semibold text-white">During Reifnitz-area construction (reference)</h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-400">
            <li>
              From <span className="text-zinc-300">€100,000</span> commitment: opportunity for{" "}
              <span className="text-zinc-300">up to 3 complimentary guest days</span> in an apartment in the Reifnitz-area project
              (subject to availability and programme rules — not a tenancy right).
            </li>
            <li>
              From <span className="text-zinc-300">€250,000</span>: opportunity for{" "}
              <span className="text-zinc-300">up to 6 complimentary guest days</span> under the same conditions.
            </li>
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            Floor plans are shared separately by the project team. Hospitality perks are programme benefits — not consideration
            for a securities transaction unless expressly documented.
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-5">
          <h3 className="text-sm font-semibold text-white">After completion — Jagdschlossgasse 81 (reference)</h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-400">
            <li>
              From <span className="text-zinc-300">€100,000</span>: opportunity for{" "}
              <span className="text-zinc-300">up to 3 complimentary guest days</span> in an apartment at Jagdschlossgasse 81 (subject to
              availability).
            </li>
            <li>
              From <span className="text-zinc-300">€250,000</span>: opportunity for{" "}
              <span className="text-zinc-300">up to 6 complimentary guest days</span> on the same basis.
            </li>
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            Jagdschloss tiers mirror the Reifnitz framing for continuity; both are subject to issuer approval and scheduling.
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        Nothing here is an offer to sell or solicit securities or real-estate interests in any jurisdiction.{" "}
        <Link href="/how-it-works" className="text-brand hover:underline">
          How shares work
        </Link>
        .
      </p>
    </section>
  );
}
