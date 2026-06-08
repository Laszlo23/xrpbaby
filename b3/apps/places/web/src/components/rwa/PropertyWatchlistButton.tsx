"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";

type Props = {
  propertyId: string;
};

export function PropertyWatchlistButton({ propertyId }: Props) {
  const { address, isConnected } = useAccount();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) return;
    const res = await fetch(`/api/watchlist?wallet=${address}`);
    if (!res.ok) return;
    const data = (await res.json()) as { propertyIds: string[] };
    setSaved(data.propertyIds.includes(propertyId));
  }, [address, propertyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function toggle() {
    if (!address || busy) return;
    setBusy(true);
    try {
      await fetch("/api/watchlist", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, propertyId }),
      });
      setSaved(!saved);
    } finally {
      setBusy(false);
    }
  }

  if (!isConnected) return null;

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        saved
          ? "border-bc-lime/50 bg-bc-lime/10 text-bc-lime"
          : "border-white/15 text-zinc-400 hover:border-bc-cyan/40 hover:text-bc-cyan"
      }`}
      aria-pressed={saved}
    >
      {saved ? "♥ Saved" : "♡ Watchlist"}
    </button>
  );
}
