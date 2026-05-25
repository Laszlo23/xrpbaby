import type { FC } from "react";
import Link from "next/link";
import { explorerBase } from "@/lib/contracts";

const items: { label: string; hint: string; Icon: FC }[] = [
  {
    label: "Security-first",
    hint: "Access control & share tokens enforced on-chain",
    Icon: function Icon() {
      return (
        <svg className="h-4 w-4 shrink-0 text-eco" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
        </svg>
      );
    },
  },
  {
    label: "Audit-ready",
    hint: "Open codebase for professional review — not a live audit claim",
    Icon: function Icon() {
      return (
        <svg className="h-4 w-4 shrink-0 text-eco" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35M11 8v4M11 16h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    },
  },
  {
    label: "Legal compliance",
    hint: "Issuer disclosures & KYC where offerings require it",
    Icon: function Icon() {
      return (
        <svg className="h-4 w-4 shrink-0 text-eco" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    },
  },
  {
    label: "Property verification",
    hint: "Parcel refs & docs — issuer-dependent; see Legal",
    Icon: function Icon() {
      return (
        <svg className="h-4 w-4 shrink-0 text-eco" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    },
  },
];

export function TrustStrip() {
  return (
    <div className="glass-card flex flex-col gap-6 px-6 py-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-wrap gap-3">
        {items.map((it) => {
          const Icon = it.Icon;
          return (
            <div
              key={it.label}
              className="flex max-w-[240px] items-start gap-2 rounded-full border border-eco/25 bg-forest/30 px-3 py-2"
            >
              <span className="mt-0.5 flex shrink-0 items-center justify-center rounded-md bg-eco/15 p-1">
                <Icon />
              </span>
              <span>
                <span className="block text-xs font-medium text-canvas">{it.label}</span>
                <span className="mt-0.5 block text-[10px] text-muted">{it.hint}</span>
              </span>
            </div>
          );
        })}
      </div>
      <Link
        href={`${explorerBase}`}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 text-xs font-medium text-action underline-offset-4 hover:underline"
      >
        Open chain explorer →
      </Link>
    </div>
  );
}
