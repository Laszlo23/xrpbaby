"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEther, parseEther, zeroAddress } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ComplianceStatus } from "@/components/ComplianceStatus";
import { TrustSection } from "@/components/TrustSection";
import { Card } from "@/components/ui/Card";
import { ogStakingAbi } from "@/lib/contracts";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";

const SECONDS_PER_YEAR = 365n * 24n * 60n * 60n;

export default function StakePage() {
  const { address, isConnected } = useAccount();
  const nativeLabel = "ETH";
  const { staking, explorer: explorerBase } = useProtocolAddresses();
  const configured = staking !== zeroAddress;

  const [stakeAmt, setStakeAmt] = useState("");
  const [unstakeAmt, setUnstakeAmt] = useState("");
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: nativeBal } = useBalance({ address, query: { enabled: !!address } });

  const globalQ = { enabled: configured };

  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: staking,
    abi: ogStakingAbi,
    functionName: "totalStaked",
    query: globalQ,
  });

  const { data: rewardRate } = useReadContract({
    address: staking,
    abi: ogStakingAbi,
    functionName: "rewardRate",
    query: globalQ,
  });

  const { data: periodFinish } = useReadContract({
    address: staking,
    abi: ogStakingAbi,
    functionName: "periodFinish",
    query: globalQ,
  });

  const { data: cooldownPeriod } = useReadContract({
    address: staking,
    abi: ogStakingAbi,
    functionName: "cooldownPeriod",
    query: globalQ,
  });

  const userAcct = address ?? zeroAddress;
  const userQ = { enabled: configured && !!address };

  const { data: stakedBal, refetch: refetchStakedBal } = useReadContract({
    address: staking,
    abi: ogStakingAbi,
    functionName: "balanceOf",
    args: [userAcct],
    query: userQ,
  });

  const { data: earned, refetch: refetchEarned } = useReadContract({
    address: staking,
    abi: ogStakingAbi,
    functionName: "earned",
    args: [userAcct],
    query: userQ,
  });

  const { data: pendingWithdraw, refetch: refetchPending } = useReadContract({
    address: staking,
    abi: ogStakingAbi,
    functionName: "pendingWithdraw",
    args: [userAcct],
    query: userQ,
  });

  const { data: unlockTime, refetch: refetchUnlock } = useReadContract({
    address: staking,
    abi: ogStakingAbi,
    functionName: "unlockTime",
    args: [userAcct],
    query: userQ,
  });

  const refetchAfterTx = useCallback(
    () =>
      Promise.all([
        refetchStakedBal(),
        refetchEarned(),
        refetchPending(),
        refetchUnlock(),
        refetchTotalStaked(),
      ]),
    [refetchStakedBal, refetchEarned, refetchPending, refetchUnlock, refetchTotalStaked],
  );

  const estApyPct = useMemo(() => {
    if (!totalStaked || totalStaked === 0n || !rewardRate || rewardRate === 0n) return null;
    if (!periodFinish || BigInt(now) >= periodFinish) return null;
    const annualEmission = rewardRate * SECONDS_PER_YEAR;
    const bps = (annualEmission * 10000n) / totalStaked;
    return Number(bps) / 100;
  }, [totalStaked, rewardRate, periodFinish, now]);

  const cooldownProgress = useMemo(() => {
    if (!cooldownPeriod || cooldownPeriod === 0n || !pendingWithdraw || pendingWithdraw === 0n) return null;
    if (!unlockTime || unlockTime === 0n) return null;
    const start = unlockTime - cooldownPeriod;
    const elapsed = BigInt(now) - start;
    if (elapsed <= 0n) return 0;
    const pct = Number((elapsed * 100n) / cooldownPeriod);
    return Math.min(100, Math.max(0, pct));
  }, [cooldownPeriod, pendingWithdraw, unlockTime, now]);

  const secondsLeft =
    unlockTime && unlockTime > BigInt(now) ? Number(unlockTime - BigInt(now)) : 0;

  const { writeContract, data: txHash, isPending, error: writeErr } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (confirmed) void refetchAfterTx();
  }, [confirmed, refetchAfterTx]);

  const busy = isPending || confirming;

  function stake() {
    if (!configured || !stakeAmt) return;
    const v = parseEther(stakeAmt);
    writeContract({
      address: staking,
      abi: ogStakingAbi,
      functionName: "stake",
      value: v,
    });
  }

  function claim() {
    if (!configured) return;
    writeContract({
      address: staking,
      abi: ogStakingAbi,
      functionName: "getReward",
    });
  }

  function requestUnstake() {
    if (!configured || !unstakeAmt) return;
    writeContract({
      address: staking,
      abi: ogStakingAbi,
      functionName: "requestUnstake",
      args: [parseEther(unstakeAmt)],
    });
  }

  function completeWithdraw() {
    if (!configured) return;
    writeContract({
      address: staking,
      abi: ogStakingAbi,
      functionName: "completeUnstake",
    });
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 pb-16">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Native {nativeLabel} (Base)</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Stake</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Lock {nativeLabel} to earn rewards. See estimated APY, total staked, and pending rewards — unstaking uses a
          cooldown before principal is released.
        </p>
      </header>
      <ComplianceStatus />
      <TrustSection />

      <section aria-labelledby="stake-edu-heading" className="grid gap-4 md:grid-cols-3">
        <h2 id="stake-edu-heading" className="sr-only">
          How staking works
        </h2>
        <Card hover className="border-brand/10">
          <h3 className="text-sm font-semibold text-white">Stake</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Deposit native currency into the staking contract. Your principal is tracked on-chain; rewards accrue from the
            configured emission schedule.
          </p>
        </Card>
        <Card hover className="border-brand/10">
          <h3 className="text-sm font-semibold text-white">Earn</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Pending rewards are claimable anytime. Estimated APY is directional — it assumes the current reward rate
            holds for a year and emissions may end after the reward period.
          </p>
        </Card>
        <Card hover className="border-brand/10">
          <h3 className="text-sm font-semibold text-white">Rewards</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Claim rewards without exiting your stake. Unstaking is a two-step process: request, then withdraw after
            cooldown — not a guaranteed yield or audited product.
          </p>
        </Card>
      </section>

      {!configured ? (
        <div className="glass-card border border-amber-500/20 p-5 text-sm text-zinc-300">
          <p className="font-medium text-amber-200/90">Staking contract not configured</p>
          <p className="mt-2 text-zinc-400">
            Deploy with <code className="rounded bg-black/40 px-1">DeployAll</code> and set{" "}
            <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_STAKING</code> in{" "}
            <code className="rounded bg-black/40 px-1">web/.env.local</code> (see{" "}
            <Link href="/invest" className="text-gold-400 hover:underline">
              Investor hub
            </Link>
            ).
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="glass-card-strong rounded-2xl border border-white/[0.08] p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted">Pool TVL</p>
              <p className="mt-2 font-mono text-2xl text-white">
                {totalStaked !== undefined ? `${formatEther(totalStaked)} ${nativeLabel}` : "—"}
              </p>
              <p className="mt-2 text-[11px] text-muted">Total native currency locked in the staking contract.</p>
            </div>
            <div className="glass-card-strong rounded-2xl border border-brand/20 p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted">Est. APY</p>
              <p className="mt-2 font-mono text-2xl text-gradient-gold">
                {estApyPct != null ? `${estApyPct.toFixed(2)}%` : "—"}
              </p>
              <p className="mt-2 text-[11px] text-muted">Model outcome if current rate held 1y; emissions stop after period ends.</p>
            </div>
            <div className="glass-card-strong rounded-2xl border border-white/[0.08] p-6 sm:col-span-2 lg:col-span-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted">Reward rate</p>
              <p className="mt-2 font-mono text-lg text-white">
                {rewardRate !== undefined && rewardRate > 0n
                  ? `${formatEther(rewardRate)} ${nativeLabel}/s`
                  : "—"}
              </p>
              <p className="mt-2 text-[11px] text-muted">On-chain emission parameter; not a promise of future returns.</p>
            </div>
          </div>

          {!isConnected ? (
            <p className="text-center text-zinc-500">Connect a wallet to stake.</p>
          ) : (
            <div className="space-y-6">
              <div className="glass-card p-5">
                <h2 className="text-sm font-medium text-white">Wallet</h2>
                <p className="mt-1 font-mono text-xs text-zinc-500">{address}</p>
                <p className="mt-3 text-xs text-zinc-500">
                  Native {nativeLabel} balance:{" "}
                  <span className="font-mono text-zinc-300">
                    {nativeBal ? formatEther(nativeBal.value) : "—"} {nativeLabel}
                  </span>
                </p>
              </div>

              <div className="glass-card p-5">
                <h2 className="text-sm font-medium text-white">Stake</h2>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="flex-1 text-xs text-zinc-500">
                    Amount ({nativeLabel})
                    <input
                      type="text"
                      inputMode="decimal"
                      value={stakeAmt}
                      onChange={(e) => setStakeAmt(e.target.value)}
                      placeholder="0.0"
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none focus:border-gold-500/40"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy || !stakeAmt}
                    onClick={stake}
                    className="rounded-full bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
                  >
                    {busy ? "Confirm…" : "Stake"}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-zinc-500">
                  Staked: {stakedBal !== undefined ? formatEther(stakedBal) : "—"} {nativeLabel}
                </p>
              </div>

              <div className="glass-card p-5">
                <h2 className="text-sm font-medium text-white">Rewards</h2>
                <p className="mt-2 font-mono text-lg text-gold-200/90">
                  Pending: {earned !== undefined ? formatEther(earned) : "—"} {nativeLabel}
                </p>
                <button
                  type="button"
                  disabled={busy || !earned || earned === 0n}
                  onClick={claim}
                  className="mt-3 rounded-full border border-gold-500/40 px-5 py-2 text-sm font-medium text-gold-200 disabled:opacity-40"
                >
                  Claim rewards
                </button>
              </div>

              <div className="glass-card p-5">
                <h2 className="text-sm font-medium text-white">Unstake (cooldown)</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Request an amount; after the cooldown you can withdraw principal. Only one pending exit at a time.
                </p>
                {pendingWithdraw && pendingWithdraw > 0n && unlockTime ? (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-zinc-300">
                      Pending:{" "}
                    <span className="font-mono">
                      {formatEther(pendingWithdraw)} {nativeLabel}
                    </span>
                    </p>
                    {secondsLeft > 0 ? (
                      <p className="text-xs text-amber-200/90">
                        Unlocks in ~{secondsLeft}s
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-400/90">Cooldown complete — withdraw below.</p>
                    )}
                    {cooldownProgress !== null && (
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-gold-700 to-gold-400 transition-all"
                          style={{ width: `${cooldownProgress}%` }}
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={busy || secondsLeft > 0}
                      onClick={completeWithdraw}
                      className="mt-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
                    >
                      Withdraw principal
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex-1 text-xs text-zinc-500">
                      Amount to exit ({nativeLabel})
                      <input
                        type="text"
                        inputMode="decimal"
                        value={unstakeAmt}
                        onChange={(e) => setUnstakeAmt(e.target.value)}
                        placeholder="0.0"
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none focus:border-gold-500/40"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={busy || !unstakeAmt}
                      onClick={requestUnstake}
                      className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-100 disabled:opacity-40"
                    >
                      Request unstake
                    </button>
                  </div>
                )}
                {cooldownPeriod !== undefined && (
                  <p className="mt-3 text-[11px] text-zinc-500">
                    Cooldown period: {Number(cooldownPeriod) / 86400 >= 1
                      ? `${(Number(cooldownPeriod) / 86400).toFixed(1)} days`
                      : `${Number(cooldownPeriod)}s`}
                  </p>
                )}
              </div>

              {(writeErr || txHash) && (
                <div className="text-xs">
                  {writeErr ? (
                    <p className="text-red-400/90">{writeErr.message}</p>
                  ) : (
                    <a
                      href={`${explorerBase}/tx/${txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold-400 hover:underline"
                    >
                      View transaction →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/invest" className="text-gold-400 hover:underline">
          Investor hub
        </Link>
        <Link href="/portfolio" className="text-zinc-400 hover:text-white">
          Portfolio
        </Link>
      </div>
    </div>
  );
}
