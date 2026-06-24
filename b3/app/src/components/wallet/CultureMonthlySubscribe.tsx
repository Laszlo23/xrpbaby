"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { stripeErrorMessage } from "@/lib/billing/stripe-errors";

type CultureMonthlySubscribeProps = {
  compact?: boolean;
};

export function CultureMonthlySubscribe({ compact }: CultureMonthlySubscribeProps) {
  const { address, isConnected } = useAccount();
  const [busy, setBusy] = useState(false);
  const [priceLabel, setPriceLabel] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/billing/stripe/manifest")
      .then((r) => r.json())
      .then((data: { subscription?: { priceLabel?: string } }) => {
        if (data.subscription?.priceLabel) setPriceLabel(data.subscription.priceLabel);
      })
      .catch(() => {});
  }, []);

  async function subscribe() {
    if (!address || !isConnected) {
      toast.error("Connect your wallet first.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/billing/stripe/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, returnPath: "/wallet/packs" }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) {
        throw new Error(stripeErrorMessage(data.error));
      }
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Subscription checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      id="subscribe"
      className={
        compact
          ? "rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4"
          : "rounded-2xl border border-amber-400/25 bg-amber-400/5 p-6"
      }
    >
      <p className="font-display text-lg font-semibold text-white">Culture Monthly</p>
      <p className="mt-1 text-sm text-zinc-400">
        {priceLabel ?? "€7/month"} · Culture Points credited each billing cycle (same as Culture
        pack).
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => void subscribe()}
        className="mt-4 rounded-xl bg-[#C5FF41] px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-black disabled:opacity-50"
      >
        {busy ? "Redirecting…" : "Subscribe with card"}
      </button>
    </div>
  );
}
