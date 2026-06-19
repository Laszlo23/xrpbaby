import { Link } from "@tanstack/react-router";
import { Loader2, Shield, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useServerFn } from "@tanstack/react-start";
import { postPointsBalance } from "@/lib/points-fns";
import { getLevel } from "@/components/LevelBadge";
import { RedemptionGateProgress } from "@/components/RedemptionGateProgress";

type Props = {
  localXp: number;
};

/** Single header for profile: Culture Points (server) + activity rank (local XP). */
export function UnifiedPointsSummary({ localXp }: Props) {
  const { address, isConnected } = useAccount();
  const fetchBalance = useServerFn(postPointsBalance);
  const [culturePoints, setCulturePoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendDown, setBackendDown] = useState(false);

  const lvl = getLevel(localXp);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const r = await fetchBalance({ data: { address } });
      if (!r.ok && r.reason === "no_database") {
        setBackendDown(true);
        setCulturePoints(null);
        return;
      }
      setBackendDown(false);
      setCulturePoints(r.balance);
    } catch {
      setBackendDown(true);
    } finally {
      setLoading(false);
    }
  }, [address, fetchBalance]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!isConnected || !address) {
    return (
      <section className="glass rounded-2xl border border-white/[0.08] p-6 space-y-5">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">Your progression</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Connect a wallet to load <strong className="text-zinc-300">Culture Points</strong>{" "}
            (server quests) and sync your <strong className="text-zinc-300">activity rank</strong>{" "}
            (browser XP).
          </p>
        </div>
        <RedemptionGateProgress compact />
      </section>
    );
  }

  return (
    <section className="glass rounded-2xl border border-white/[0.08] p-6 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Shield className="mt-1 h-6 w-6 shrink-0 text-[var(--base-blue)]" aria-hidden />
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">Your progression</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              <strong className="text-zinc-300">Culture Points</strong> are server-backed (quests,
              packs, SIWE). <strong className="text-zinc-300">Activity rank</strong> is browser XP
              for daily streaks and honor quests — both count toward your builder story.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#C5FF41]/20 bg-[#C5FF41]/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5FF41]">
            Culture Points
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-white">
            {loading && culturePoints === null ? (
              <Loader2 className="inline h-6 w-6 animate-spin text-zinc-500" />
            ) : backendDown ? (
              "—"
            ) : (
              (culturePoints ?? 0).toLocaleString()
            )}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {backendDown
              ? "Server ledger unavailable — complete quests below when DB is live."
              : "Earn via quests below · redeem for BCC when liquidity gate opens."}
          </p>
          {!backendDown && isConnected ? (
            <Link
              to="/mission"
              className="mt-3 inline-block text-xs text-[#C5FF41] underline underline-offset-2"
            >
              $BCC token home →
            </Link>
          ) : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Activity rank
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" aria-hidden />
            <span className="font-display text-3xl font-semibold tabular-nums text-white">
              {localXp.toLocaleString()}
            </span>
            <span className="text-sm text-zinc-500">XP</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Level {lvl.level} · {lvl.name} — stored in this browser per wallet.
          </p>
        </div>
      </div>

      <RedemptionGateProgress compact />
    </section>
  );
}
