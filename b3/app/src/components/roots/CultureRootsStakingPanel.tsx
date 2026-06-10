import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";
import { Loader2, Sprout, TreeDeciduous } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BCC_ROOTS_STAKING_ABI } from "@/lib/roots-abi";
import {
  getBccTokenForRoots,
  getRootsStakingAddress,
  isRootsStakingEnabled,
  ROOTS_POOLS,
  type RootsPoolId,
} from "@/lib/roots-config";
import { erc20Abi } from "@/lib/bcd-abi";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { postCompleteTaskWithSiwe } from "@/lib/points-fns";
import { useServerFn } from "@tanstack/react-start";
import { CultureRootsCountdown } from "@/components/roots/CultureRootsCountdown";
import { RootsStakingDashboard } from "@/components/roots/RootsStakingDashboard";

type BoostResponse = {
  ok: boolean;
  boost?: {
    eligiblePools: RootsPoolId[];
    boosts: Array<{ poolId: RootsPoolId; eligible: boolean; reason: string }>;
    culturePoints: number;
    supporterTier: string;
  };
};

export function CultureRootsStakingPanel() {
  const { address, isConnected } = useAccount();
  const stakingAddress = getRootsStakingAddress();
  const bccToken = getBccTokenForRoots();
  const enabled = isRootsStakingEnabled();
  const [selectedPool, setSelectedPool] = useState<RootsPoolId>(0);
  const [amount, setAmount] = useState("");
  const [claimingPts, setClaimingPts] = useState(false);
  const { signSiwe } = usePointsSiweSign();
  const completeTask = useServerFn(postCompleteTaskWithSiwe);

  const { data: boostData } = useQuery({
    queryKey: ["roots", "boost", address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`/api/roots/boost?address=${address}`);
      return (await res.json()) as BoostResponse;
    },
    enabled: Boolean(address),
    staleTime: 60_000,
  });

  const { data: bccBalance } = useReadContract({
    address: bccToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { data: allowance } = useReadContract({
    address: bccToken,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && stakingAddress ? [address, stakingAddress] : undefined,
    query: { enabled: Boolean(address && stakingAddress) },
  });

  const { data: stakedBal } = useReadContract({
    address: stakingAddress,
    abi: BCC_ROOTS_STAKING_ABI,
    functionName: "balanceOf",
    args: stakingAddress && address ? [BigInt(selectedPool), address] : undefined,
    query: { enabled: Boolean(stakingAddress && address) },
  });

  const { data: earned } = useReadContract({
    address: stakingAddress,
    abi: BCC_ROOTS_STAKING_ABI,
    functionName: "earned",
    args: stakingAddress && address ? [BigInt(selectedPool), address] : undefined,
    query: { enabled: Boolean(stakingAddress && address), refetchInterval: 15_000 },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash: txHash });

  const poolEligible =
    boostData?.boost?.boosts.find((b) => b.poolId === selectedPool)?.eligible ?? selectedPool === 0;

  const parsedAmount = (() => {
    try {
      if (!amount.trim()) return 0n;
      return parseUnits(amount, 18);
    } catch {
      return 0n;
    }
  })();

  const needsApproval =
    allowance !== undefined && parsedAmount > 0n && allowance < parsedAmount;

  async function runTx(label: string, fn: () => void) {
    try {
      fn();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `${label} failed`);
    }
  }

  function approve() {
    if (!stakingAddress || parsedAmount === 0n) return;
    runTx("Approve", () =>
      writeContract({
        address: bccToken,
        abi: erc20Abi,
        functionName: "approve",
        args: [stakingAddress, parsedAmount],
      }),
    );
  }

  function stake() {
    if (!stakingAddress || parsedAmount === 0n || !poolEligible) return;
    runTx("Stake", () =>
      writeContract({
        address: stakingAddress,
        abi: BCC_ROOTS_STAKING_ABI,
        functionName: "stake",
        args: [BigInt(selectedPool), parsedAmount],
      }),
    );
  }

  function claimRewards() {
    if (!stakingAddress) return;
    runTx("Claim", () =>
      writeContract({
        address: stakingAddress,
        abi: BCC_ROOTS_STAKING_ABI,
        functionName: "getRewardAll",
      }),
    );
  }

  async function claimPointsTask() {
    setClaimingPts(true);
    try {
      const signed = await signSiwe();
      if (!signed) return;
      const res = await completeTask({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          taskSlug: "bcc-roots-stake",
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Could not record points");
        return;
      }
      toast.success(res.alreadyCompleted ? "Already credited" : "Culture Points recorded (+50)");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign failed");
    } finally {
      setClaimingPts(false);
    }
  }

  if (!enabled) {
    return (
      <div className="space-y-6">
        <CultureRootsCountdown />
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="flex items-start gap-3">
            <Sprout className="mt-0.5 h-5 w-5 text-emerald-400/90" aria-hidden />
            <div>
              <h3 className="font-heading text-lg font-semibold text-white">Culture Roots</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Treasury-funded BCC staking opens at the unlock window. Set{" "}
                <span className="font-mono text-zinc-500">VITE_BCC_ROOTS_ENABLED=1</span> and deploy{" "}
                <span className="font-mono text-zinc-500">BccRootsStaking</span> to go live.
              </p>
              <p className="mt-3 text-xs text-zinc-600">
                See docs/BCC_ROOTS_STAKING.md for operator steps. No guaranteed returns — treasury
                participation only.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CultureRootsCountdown />
      <RootsStakingDashboard />

      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-black/40 p-6">
        <div className="flex items-start gap-3">
          <TreeDeciduous className="mt-0.5 h-5 w-5 text-emerald-400" aria-hidden />
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-semibold text-white">Plant your roots</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Lock BCC in a tiered pool. Rewards stream from treasury allocation — coordination &
              access, not a profit promise. Builders earn higher weight in boosted pools.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {ROOTS_POOLS.map((pool) => {
            const boost = boostData?.boost?.boosts.find((b) => b.poolId === pool.id);
            const eligible = boost?.eligible ?? pool.id === 0;
            return (
              <button
                key={pool.id}
                type="button"
                onClick={() => setSelectedPool(pool.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedPool === pool.id
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                } ${!eligible ? "opacity-60" : ""}`}
              >
                <p className="font-heading font-semibold text-zinc-100">{pool.name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {pool.lockDays}d lock · {pool.weightLabel}
                </p>
                <p className="mt-2 text-xs text-zinc-500">{boost?.reason ?? pool.description}</p>
              </button>
            );
          })}
        </div>

        {isConnected && boostData?.boost ? (
          <p className="mt-4 text-xs text-zinc-500">
            {boostData.boost.culturePoints.toLocaleString()} Culture Points · tier{" "}
            {boostData.boost.supporterTier}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Amount (BCC)
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/40"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {needsApproval ? (
              <Button
                className="rounded-full"
                disabled={!isConnected || isPending || confirming || parsedAmount === 0n}
                onClick={approve}
              >
                {isPending || confirming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Approve"
                )}
              </Button>
            ) : (
              <Button
                className="rounded-full"
                disabled={
                  !isConnected ||
                  !poolEligible ||
                  isPending ||
                  confirming ||
                  parsedAmount === 0n
                }
                onClick={stake}
              >
                {isPending || confirming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Stake"
                )}
              </Button>
            )}
            <Button
              variant="secondary"
              className="rounded-full"
              disabled={!isConnected || isPending || confirming}
              onClick={claimRewards}
            >
              Claim rewards
            </Button>
          </div>
        </div>

        {isConnected ? (
          <div className="mt-4 grid gap-2 text-xs text-zinc-500 sm:grid-cols-3">
            <span>
              Wallet BCC:{" "}
              {bccBalance !== undefined ? formatUnits(bccBalance, 18) : "—"}
            </span>
            <span>
              Staked (pool):{" "}
              {stakedBal !== undefined ? formatUnits(stakedBal, 18) : "—"}
            </span>
            <span>
              Earned: {earned !== undefined ? formatUnits(earned, 18) : "—"}
            </span>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">Connect wallet to stake.</p>
        )}

        <div className="mt-6 border-t border-white/10 pt-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={!isConnected || claimingPts || (stakedBal ?? 0n) === 0n}
            onClick={() => void claimPointsTask()}
          >
            {claimingPts ? "Checking stake…" : "Roots quest (+50 pts)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
