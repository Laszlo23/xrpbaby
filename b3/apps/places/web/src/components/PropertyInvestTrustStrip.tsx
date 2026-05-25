"use client";

import Link from "next/link";
import { zeroAddress } from "viem";
import { getPrimarySaleForProperty } from "@/lib/primary-sales-config";
import { getListingsChainId } from "@/lib/listings-config";
import type { DemoPropertyDetail } from "@/lib/demo-properties";

type Props = {
  propertyId: bigint;
  tokenAddress: `0x${string}`;
  explorerBase: string;
  demo?: DemoPropertyDetail;
};

export function PropertyInvestTrustStrip({ propertyId, tokenAddress, explorerBase, demo }: Props) {
  const chainId = getListingsChainId();
  const primary = getPrimarySaleForProperty(propertyId, chainId);
  const ts = demo?.trustStrip;

  return (
    <section
      className="rounded-2xl border border-white/[0.1] bg-gradient-to-b from-zinc-950/90 to-black/40 p-5 shadow-inner shadow-black/20"
      aria-labelledby="trust-strip-heading"
    >
      <h3 id="trust-strip-heading" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
        Trust &amp; verification
      </h3>
      <ul className="mt-4 space-y-3 text-sm text-zinc-300">
        <li className="flex gap-2">
          <span className="text-emerald-400" aria-hidden>
            ✓
          </span>
          <span>
            <strong className="text-zinc-200">On-chain share token</strong> —{" "}
            <a
              href={`${explorerBase}/address/${tokenAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline"
            >
              View contract
            </a>
          </span>
        </li>
        {primary && primary.saleAddress !== zeroAddress ? (
          <li className="flex gap-2">
            <span className="text-emerald-400" aria-hidden>
              ✓
            </span>
            <span>
              <strong className="text-zinc-200">Primary sale ({primary.paymentSymbol})</strong> —{" "}
              <a
                href={`${explorerBase}/address/${primary.saleAddress}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline"
              >
                Sale contract
              </a>
            </span>
          </li>
        ) : null}
        <li className="flex gap-2">
          <span className="text-emerald-400" aria-hidden>
            ✓
          </span>
          <span>
            <strong className="text-zinc-200">Protocol addresses</strong> —{" "}
            <Link href="/contracts" className="text-brand hover:underline">
              Contracts page
            </Link>
          </span>
        </li>
      </ul>
      {(ts?.issuerDisplayName || ts?.jurisdictionLine || ts?.custodyLine) && (
        <dl className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-zinc-400">
          {ts.issuerDisplayName ? (
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-zinc-500">Issuer (reference)</dt>
              <dd className="mt-0.5 text-zinc-300">{ts.issuerDisplayName}</dd>
            </div>
          ) : null}
          {ts.jurisdictionLine ? (
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-zinc-500">Jurisdiction</dt>
              <dd className="mt-0.5">{ts.jurisdictionLine}</dd>
            </div>
          ) : null}
          {ts.custodyLine ? (
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-zinc-500">Custody / title</dt>
              <dd className="mt-0.5">{ts.custodyLine}</dd>
            </div>
          ) : null}
        </dl>
      )}
      <p className="mt-4 text-[11px] leading-snug text-zinc-500">
        Reference text only — verify offering documents and issuer filings. See{" "}
        <Link href="/legal/risk" className="text-brand hover:underline">
          risks
        </Link>
        .
      </p>
    </section>
  );
}
