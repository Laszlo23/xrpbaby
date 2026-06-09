import { ExternalLink, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export type PoolStats = {
  combinedLiquidityUsd: number | null;
  pools: Array<{
    dex: string;
    liquidityUsd: number | null;
    volume24hUsd: number | null;
    priceUsd: number | null;
    url: string | null;
  }>;
  redemption: {
    percentToGate: number | null;
    minPoolTvlUsd: number;
    ready: boolean;
  };
};

function fmtUsd(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export function PoolStatsCard({ stats, loading }: { stats: PoolStats | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="glass rounded-2xl border border-white/10 p-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const top = stats?.pools?.[0];

  return (
    <div className="glass rounded-2xl border border-white/10 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Live pool stats
          </p>
          <p className="mt-2 font-heading text-3xl font-semibold text-white">
            {fmtUsd(stats?.combinedLiquidityUsd ?? null)}
          </p>
          <p className="mt-1 text-sm text-zinc-400">Combined DEX liquidity (DexScreener)</p>
        </div>
        <TrendingUp className="h-8 w-8 text-neon/80" aria-hidden />
      </div>

      {top ? (
        <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-white/15 text-zinc-300">
              {top.dex}
            </Badge>
            <span className="text-zinc-400">24h vol {fmtUsd(top.volume24hUsd)}</span>
            {top.priceUsd != null ? (
              <span className="text-zinc-500">· ${top.priceUsd.toFixed(6)}</span>
            ) : null}
          </div>
          {top.url ? (
            <Button variant="link" className="mt-2 h-auto p-0 text-neon" asChild>
              <a href={top.url} target="_blank" rel="noopener noreferrer">
                View pair <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}

      {stats?.redemption.percentToGate != null ? (
        <div className="mt-5">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Points redemption gate</span>
            <span>
              {stats.redemption.percentToGate}% of $
              {(stats.redemption.minPoolTvlUsd / 1000).toFixed(0)}k TVL
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-neon/70 transition-all"
              style={{ width: `${stats.redemption.percentToGate}%` }}
            />
          </div>
          {stats.redemption.ready ? (
            <p className="mt-2 text-xs text-emerald-400">
              Redemption gate met — ops can enable VITE_POINTS_REDEEM_ENABLED.
            </p>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">
              Learn and provide liquidity now; redemption unlocks when combined TVL and ops policy
              align.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
