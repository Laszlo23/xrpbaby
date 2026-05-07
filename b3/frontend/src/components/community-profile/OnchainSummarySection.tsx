import { useEffect, useState } from "react";
import type { WalletChain } from "@/lib/community-profile/types";
import {
  summarizeBitcoin,
  summarizeEvm,
  summarizeSolana,
  summarizeSui,
  type ChainSummary,
} from "@/lib/onchain/activity";

export function OnchainSummarySection({
  wallets,
  enabled,
}: {
  wallets: { chain: WalletChain; address: string }[];
  enabled: boolean;
}) {
  const [rows, setRows] = useState<
    { chain: WalletChain; address: string; summary: ChainSummary }[]
  >([]);

  useEffect(() => {
    if (!enabled || wallets.length === 0) {
      setRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const next: typeof rows = [];
      for (const w of wallets) {
        let summary: ChainSummary;
        if (w.chain === "evm") {
          summary = await summarizeEvm(w.address as `0x${string}`);
        } else if (w.chain === "solana") {
          summary = await summarizeSolana(w.address);
        } else if (w.chain === "sui") {
          summary = await summarizeSui(w.address);
        } else {
          summary = await summarizeBitcoin(w.address);
        }
        if (!cancelled) next.push({ chain: w.chain, address: w.address, summary });
      }
      if (!cancelled) setRows(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, wallets]);

  if (!enabled) {
    return <p className="text-sm text-zinc-500">On-chain activity is hidden for this profile.</p>;
  }

  if (wallets.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((r) => (
        <div
          key={`${r.chain}-${r.address}`}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            {r.summary.label} · {r.chain}
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-400 break-all">{r.address}</p>
          {r.summary.error ? (
            <p className="mt-2 text-xs text-amber-400/90">{r.summary.error}</p>
          ) : (
            <>
              {r.summary.nativeBalance ? (
                <p className="mt-2 text-sm font-medium text-zinc-100">{r.summary.nativeBalance}</p>
              ) : null}
              {r.summary.txCount !== undefined ? (
                <p className="mt-1 text-xs text-zinc-500">Tx count: {r.summary.txCount}</p>
              ) : null}
              {r.summary.recentActivityHint ? (
                <p className="mt-1 text-[11px] text-zinc-600">{r.summary.recentActivityHint}</p>
              ) : null}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
