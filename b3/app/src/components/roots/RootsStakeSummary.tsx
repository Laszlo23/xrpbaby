import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { BCC_ROOTS_STAKING_ABI } from "@/lib/roots-abi";
import { getRootsStakingAddress, isRootsStakingEnabled } from "@/lib/roots-config";

export function RootsStakeSummary() {
  const { address } = useAccount();
  const stakingAddress = getRootsStakingAddress();
  const enabled = isRootsStakingEnabled();

  const { data: boostData } = useQuery({
    queryKey: ["roots", "boost", address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`/api/roots/boost?address=${address}`);
      return res.json();
    },
    enabled: Boolean(address),
    staleTime: 60_000,
  });

  const pool0 = useReadContract({
    address: stakingAddress,
    abi: BCC_ROOTS_STAKING_ABI,
    functionName: "balanceOf",
    args: stakingAddress && address ? [0n, address] : undefined,
    query: { enabled: Boolean(enabled && stakingAddress && address) },
  });
  const pool1 = useReadContract({
    address: stakingAddress,
    abi: BCC_ROOTS_STAKING_ABI,
    functionName: "balanceOf",
    args: stakingAddress && address ? [1n, address] : undefined,
    query: { enabled: Boolean(enabled && stakingAddress && address) },
  });
  const pool2 = useReadContract({
    address: stakingAddress,
    abi: BCC_ROOTS_STAKING_ABI,
    functionName: "balanceOf",
    args: stakingAddress && address ? [2n, address] : undefined,
    query: { enabled: Boolean(enabled && stakingAddress && address) },
  });

  const total = (pool0.data ?? 0n) + (pool1.data ?? 0n) + (pool2.data ?? 0n);

  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-200/70">
        Culture Roots
      </p>
      <p className="mt-2 text-sm text-zinc-300">
        {enabled && total > 0n
          ? `${formatUnits(total, 18)} BCC staked`
          : "Plant roots before unlock — treasury participation, not guaranteed yield."}
      </p>
      {boostData?.boost?.eligiblePools?.length > 1 ? (
        <p className="mt-1 text-xs text-zinc-500">
          Builder boost: {boostData.boost.eligiblePools.length - 1} boosted pool
          {boostData.boost.eligiblePools.length > 2 ? "s" : ""} available
        </p>
      ) : null}
      <Link
        to="/roots"
        className="mt-3 inline-block text-xs text-[#C5FF41] underline underline-offset-2"
      >
        Open Culture Roots
      </Link>
    </div>
  );
}
