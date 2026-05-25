"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "bc-beta-modal-dismissed-v1";
const OPEN_EVENT = "bc-open-beta-modal";

function whitelistMailto(): string | null {
  const raw =
    (typeof process.env.NEXT_PUBLIC_WHITELIST_EMAIL === "string"
      ? process.env.NEXT_PUBLIC_WHITELIST_EMAIL.trim()
      : "") ||
    (typeof process.env.NEXT_PUBLIC_CONTACT_EMAIL === "string" ? process.env.NEXT_PUBLIC_CONTACT_EMAIL.trim() : "");
  if (!raw) return null;
  const subject = encodeURIComponent("Whitelist request — Building Culture");
  const body = encodeURIComponent(
    "Hi — I’d like to request whitelist / early access as you roll out Building Culture on Base.\n\n",
  );
  return `mailto:${raw}?subject=${subject}&body=${body}`;
}

export function BetaNoticeTrigger({
  className,
  label = "Beta program",
}: {
  className?: string;
  label?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => typeof window !== "undefined" && window.dispatchEvent(new CustomEvent(OPEN_EVENT))}
    >
      {label}
    </button>
  );
}

export function BetaWelcomeModal() {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode */
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* still show once */
    }
    const t = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const mailto = whitelistMailto();

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="beta-modal-title">
      <button type="button" className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} aria-label="Close dialog" />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-eco/25 bg-gradient-to-b from-forest/95 to-black shadow-2xl shadow-black/70">
        <div className="border-b border-white/[0.06] px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-eco-muted">Early access</p>
          <h2 id="beta-modal-title" className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            We&apos;re live — but still building.
          </h2>
        </div>
        <div className="space-y-4 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-zinc-300">
          <p>
            Building Culture is now online on Base, opening up early access to cultural real estate experiments.
          </p>
          <p className="font-medium text-zinc-200">However:</p>
          <ul className="list-disc space-y-2 pl-5 text-zinc-400 marker:text-eco/80">
            <li>smart contracts are still under audit</li>
            <li>product is in active development</li>
            <li>some features are experimental / not final</li>
          </ul>
          <p>This is a beta release for feedback, not a finished financial product.</p>
          <p className="text-zinc-400">
            We build in public — carefully, transparently, step by step.
          </p>
          <p className="font-medium text-eco-light">If you&apos;re early, you&apos;re early.</p>
        </div>

        <div className="border-t border-white/[0.06] bg-black/30 px-6 py-4">
          <p className="text-xs font-medium text-zinc-400">Request whitelist access</p>
          <p className="mt-1 text-xs text-zinc-500">
            Send us a short note — we&apos;ll align with your profile when spots open. No spam; see{" "}
            <Link href="/legal/privacy" className="text-eco-light/90 underline-offset-2 hover:underline" onClick={handleClose}>
              privacy
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {mailto ? (
              <a
                href={mailto}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-eco to-eco-light px-5 py-2.5 text-sm font-semibold text-[#0a0f0d] shadow-lg shadow-eco/20 hover:opacity-95"
              >
                Email to get whitelisted
              </a>
            ) : (
              <a
                href="/feedback"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-eco to-eco-light px-5 py-2.5 text-sm font-semibold text-[#0a0f0d] shadow-lg shadow-eco/20 hover:opacity-95"
                onClick={handleClose}
              >
                Request access (feedback)
              </a>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.06]"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
