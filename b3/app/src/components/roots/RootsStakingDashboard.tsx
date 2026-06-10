import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { getRootsStakingAddress } from "@/lib/roots-config";

type StatsResponse = {
  ok: boolean;
  configured: boolean;
  stakingAddress?: string;
  pools: Array<{
    id: number;
    name: string;
    rawStakedWei: string;
    weightedStakedWei: string;
  }>;
};

export function RootsStakingDashboard() {
  const stakingAddress = getRootsStakingAddress();

  const { data, isLoading } = useQuery({
    queryKey: ["roots", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/roots/stats");
      return (await res.json()) as StatsResponse;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  if (!stakingAddress && !data?.configured) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        Protocol participation
      </p>
      <h3 className="mt-2 font-heading text-lg font-semibold text-white">Staking dashboard</h3>
      <p className="mt-1 text-xs text-zinc-500">
        On-chain TVL per pool — treasury reward stream is discretionary, not guaranteed APY.
      </p>
      {isLoading ? (
        <p className="mt-4 text-sm text-zinc-600">Loading…</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                <th className="pb-2 pr-4">Pool</th>
                <th className="pb-2 pr-4">BCC staked</th>
                <th className="pb-2">Weighted</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              {(data?.pools ?? []).map((pool) => (
                <tr key={pool.id} className="border-t border-white/[0.06]">
                  <td className="py-2 pr-4 font-medium text-zinc-200">{pool.name}</td>
                  <td className="py-2 pr-4 font-mono text-xs">
                    {formatCompactBcc(pool.rawStakedWei)}
                  </td>
                  <td className="py-2 font-mono text-xs">
                    {formatCompactBcc(pool.weightedStakedWei)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data?.stakingAddress ? (
        <p className="mt-3 font-mono text-[10px] text-zinc-600 break-all">
          Contract: {data.stakingAddress}
        </p>
      ) : null}
    </div>
  );
}

function formatCompactBcc(wei: string): string {
  try {
    const v = formatUnits(BigInt(wei), 18);
    const n = Number(v);
    if (!Number.isFinite(n)) return v;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(2)}k`;
    return n.toFixed(4);
  } catch {
    return "0";
  }
}
