import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { pointsRedeemEnabled, redemptionPolicy } from "@/lib/redemption-policy";

type RedemptionApi = {
  enabled?: boolean;
  ready?: boolean;
  minPoolTvlUsd?: number;
  combinedTvlUsd?: number | null;
  percentToGate?: number | null;
};

type Props = {
  compact?: boolean;
};

export function RedemptionGateProgress({ compact = false }: Props) {
  const [data, setData] = useState<RedemptionApi | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/market/bcc")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json?.redemption) setData(json.redemption as RedemptionApi);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const enabled = data?.enabled ?? pointsRedeemEnabled;
  const min = data?.minPoolTvlUsd ?? redemptionPolicy.minPoolTvlUsd;
  const pct = data?.percentToGate ?? 0;
  const tvl = data?.combinedTvlUsd;
  const ready = data?.ready ?? false;

  if (ready) {
    return (
      <p className={`text-sm text-emerald-400/90 ${compact ? "" : "mt-2"}`}>
        Redemption is live — redeem Culture Points for BCC on Profile or Wallet.
      </p>
    );
  }

  const barPct = enabled ? Math.max(2, Math.min(100, pct ?? 0)) : Math.max(2, pct ?? 0);

  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/30 ${compact ? "p-3" : "p-4 mt-2"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          BCC redemption gate
        </p>
        {!enabled ? (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] text-amber-200/90">
            Program off
          </span>
        ) : (
          <span className="font-mono text-xs text-zinc-400">{pct ?? 0}% to unlock</span>
        )}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-[#C5FF41] to-[#00E5FF] transition-all duration-500"
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        {enabled ? (
          <>
            Unlocks at ${min.toLocaleString()} combined BCC pool TVL
            {tvl != null ? ` · current ≈ $${Math.round(tvl).toLocaleString()}` : ""}. Culture Packs
            and liquidity growth move this bar — not a guarantee of token value.
          </>
        ) : (
          <>
            Points → BCC redemption opens when ops enable the program and pool TVL reaches $
            {min.toLocaleString()}. Track progress on{" "}
            <Link to="/liquidity" className="text-[#C5FF41] underline underline-offset-2">
              Liquidity
            </Link>
            .
          </>
        )}
      </p>
    </div>
  );
}
