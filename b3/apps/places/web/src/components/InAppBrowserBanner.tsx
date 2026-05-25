"use client";

import { useEffect, useState } from "react";

function detectInAppBrowser(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || "";
  return /Instagram|FBAN|FBAV|Twitter|Line\/|Snapchat|Pinterest|TikTok/i.test(ua);
}

/**
 * In-app browsers (X/Twitter, Instagram, etc.) often block wallet deep links and WalletConnect.
 * Show a gentle banner — does not auto-open any wallet.
 */
export function InAppBrowserBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(detectInAppBrowser());
  }, []);

  if (!show) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
      <p>
        You&apos;re in an in-app browser — wallet connect may not work here.{" "}
        <button
          type="button"
          onClick={() => {
            try {
              void navigator.clipboard.writeText(window.location.href);
            } catch {
              /* ignore */
            }
          }}
          className="font-semibold text-amber-50 underline underline-offset-2"
        >
          Copy link
        </button>{" "}
        and open in <strong className="text-white">Safari</strong> or <strong className="text-white">Chrome</strong>{" "}
        for the best experience.
      </p>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="mt-2 text-xs text-amber-200/80 underline"
      >
        Dismiss
      </button>
    </div>
  );
}
