"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const steps = [
  {
    title: "Connect wallet",
    body: "Use MetaMask or any injected wallet. Switch to Base for production listings.",
    href: "/onboarding#wallet",
  },
  { title: "Verification", body: "Compliance bypass or admin verification may apply on early deployments.", href: "/onboarding" },
  {
    title: "Fund wallet",
    body: "On Base: ETH for gas and USDC (or the quoted settlement token) for purchases and pool flows.",
    href: "/invest",
  },
  {
    title: "Confirm investment",
    body: "Choose a property and complete the trade flow (primary or AMM) on the listing chain.",
    href: "/properties",
  },
];

export function InvestFlowModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/60">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Start investing</h2>
          <p className="mt-1 text-sm text-zinc-500">Four quick steps — wallet to first position.</p>
        </div>
        <ol className="max-h-[min(70vh,520px)] space-y-0 divide-y divide-white/[0.06] overflow-y-auto px-2 py-2">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 px-4 py-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{s.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{s.body}</p>
                <Link
                  href={s.href}
                  className="mt-2 inline-block text-xs font-medium text-brand hover:underline"
                  onClick={onClose}
                >
                  Go to step →
                </Link>
              </div>
            </li>
          ))}
        </ol>
        <div className="border-t border-white/[0.06] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-white/15 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.04]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
