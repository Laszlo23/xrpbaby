"use client";

import { useEffect, useState } from "react";
import { getAddress } from "viem";
import { useAccount } from "wagmi";

const INCONTEXT_SRC = "https://cdn.veriff.me/incontext/js/v1/veriff.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded === "1") {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

type SessionErrorJson = {
  error?: string;
  httpStatus?: number;
  httpStatusText?: string;
  hint?: string;
  veriff?: { status?: string; message?: string; code?: string };
};

function formatSessionApiError(json: SessionErrorJson): string {
  const parts: string[] = [];
  if (json.error) parts.push(json.error);
  if (json.httpStatus != null) {
    parts.push(`HTTP ${json.httpStatus}${json.httpStatusText ? ` ${json.httpStatusText}` : ""}`);
  }
  const vm = json.veriff && typeof json.veriff === "object" ? json.veriff.message : undefined;
  if (vm) parts.push(String(vm));
  if (json.hint) parts.push(json.hint);
  return parts.filter(Boolean).join(" — ") || "Session request failed";
}

export function VeriffKyc() {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [scriptsReady, setScriptsReady] = useState(false);
  const [starting, setStarting] = useState(false);

  const apiKey =
    process.env.NEXT_PUBLIC_VERIFF_API_KEY?.trim() ||
    "";

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    (async () => {
      try {
        await loadScript(INCONTEXT_SRC);
        if (!cancelled) setScriptsReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load Veriff InContext script");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  async function startVerification() {
    if (!address) return;
    setError(null);
    setStarting(true);
    try {
      const res = await fetch("/api/kyc/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorData: getAddress(address) }),
      });
      const json = (await res.json()) as SessionErrorJson & { url?: string };
      if (!res.ok) {
        setError(formatSessionApiError(json));
        return;
      }
      const url = json.url;
      if (!url || typeof url !== "string") {
        setError("No verification URL returned");
        return;
      }
      if (typeof window.veriffSDK?.createVeriffFrame === "function") {
        window.veriffSDK.createVeriffFrame({ url });
      } else {
        setError("Veriff InContext SDK not loaded");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setStarting(false);
    }
  }

  if (!apiKey) {
    return (
      <p className="rounded-md border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
        Identity verification is not configured. Set{" "}
        <span className="font-mono text-zinc-300">NEXT_PUBLIC_VERIFF_API_KEY</span> (and optionally{" "}
        <span className="font-mono text-zinc-300">VERIFF_API_BASE</span> on the server — see{" "}
        <span className="font-mono text-zinc-300">web/.env.example</span>).
      </p>
    );
  }

  if (!isConnected || !address) {
    return (
      <p className="rounded-md border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100/90">
        Connect your wallet first — we attach Veriff verification to your address for webhook and on-chain follow-up.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</p>
      ) : null}
      <p className="text-xs text-zinc-500">
        Sessions are created on our server (Station uses <span className="font-mono text-zinc-400">VERIFF_API_BASE</span>,{" "}
        <span className="font-mono text-zinc-400">VERIFF_API_KEY</span>, and{" "}
        <span className="font-mono text-zinc-400">VERIFF_SHARED_SECRET</span> for HMAC). If you see 401 or “integration not
        found”, align Base URL and keys with one integration in the Veriff portal.
      </p>
      <button
        type="button"
        disabled={!scriptsReady || starting}
        onClick={() => void startVerification()}
        className="rounded-lg bg-gradient-to-r from-eco to-eco-light px-6 py-3 text-sm font-semibold text-[#0A0A0A] shadow-md shadow-eco/20 disabled:opacity-50"
      >
        {!scriptsReady ? "Loading…" : starting ? "Starting…" : "Verify identity"}
      </button>
    </div>
  );
}
