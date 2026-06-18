"use client";

import { Link } from "@tanstack/react-router";
import { Coins, ExternalLink, Lock, Users } from "lucide-react";

import {
  COMMUNITY_STAKE_COPY,
  computeCommunityStake,
  paidCentsForPlan,
} from "@/lib/community-stake-data";
import { getSolanaExplorerTxUrl } from "@/lib/solana/explorer";

type StakeView = {
  id: string;
  plan: string;
  paidUsd: number;
  lockUsd: number;
  lockRatio: number;
  bccAmount: number;
  status: "pending_wallet" | "locked_staking";
  lockTxSignature: string | null;
  stakedAt: string | null;
};

type CommunityStakeSummary = {
  stakes: StakeView[];
  totalBccLocked: number;
  totalBccPending: number;
  totalLockCents: number;
  lockRatio: number;
  communityPoolBcc: number;
  communityStakers: number;
  needsWallet: boolean;
};

export function CommunityStakeCard({
  summary,
  walletAddress,
}: {
  summary: CommunityStakeSummary;
  walletAddress: string | null;
}) {
  if (summary.stakes.length === 0) return null;

  const latest = summary.stakes[0];
  const locked = summary.totalBccLocked > 0;

  return (
    <section className="mt-10 border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-signal">
            Community stake
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            {locked
              ? `${summary.totalBccLocked.toLocaleString()} BCC staked`
              : `${summary.totalBccPending.toLocaleString()} BCC ready to lock`}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {COMMUNITY_STAKE_COPY.subline}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="border border-border px-4 py-3 text-center">
            <Coins className="mx-auto h-4 w-4 text-signal" />
            <div className="mt-1 font-display text-lg font-bold">
              {Math.round(summary.lockRatio * 100)}%
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              fee locked
            </div>
          </div>
          <div className="border border-border px-4 py-3 text-center">
            <Users className="mx-auto h-4 w-4 text-signal" />
            <div className="mt-1 font-display text-lg font-bold">
              {summary.communityPoolBcc.toLocaleString()}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              pool BCC
            </div>
          </div>
        </div>
      </div>

      {summary.needsWallet && !walletAddress && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-signal/30 bg-signal/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
            <p className="text-sm">
              Link your wallet on the Proof wall to receive and stake your{" "}
              <span className="font-semibold">{summary.totalBccPending.toLocaleString()} BCC</span>{" "}
              community allocation.
            </p>
          </div>
          <Link
            to="/members/progress"
            className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-signal hover:underline"
          >
            Link wallet →
          </Link>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {summary.stakes.map((stake) => (
          <li
            key={stake.id}
            className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background px-4 py-3 text-sm"
          >
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {stake.plan.toLowerCase()} · ${stake.paidUsd} paid
              </span>
              <p className="mt-1">
                <span className="font-semibold">{stake.bccAmount.toLocaleString()} BCC</span>
                <span className="text-muted-foreground">
                  {" "}
                  ({Math.round(stake.lockRatio * 100)}% = ${stake.lockUsd.toFixed(2)})
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`font-mono text-[10px] uppercase tracking-widest ${
                  stake.status === "locked_staking" ? "text-signal" : "text-muted-foreground"
                }`}
              >
                {stake.status === "locked_staking" ? "Staking" : "Awaiting wallet"}
              </span>
              {stake.lockTxSignature && (
                <a
                  href={getSolanaExplorerTxUrl(stake.lockTxSignature)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-signal hover:underline"
                >
                  Tx <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 font-mono text-[10px] text-muted-foreground">
        {COMMUNITY_STAKE_COPY.memberBenefit} · {summary.communityStakers} members in the pool.
      </p>
    </section>
  );
}

export function CommunityStakePreview({
  plan,
}: {
  plan: "MONTHLY" | "LIFETIME";
}) {
  const paidCents = paidCentsForPlan(plan);
  const { bccAmount } = computeCommunityStake(paidCents);

  return (
    <div className="mt-6 border border-signal/25 bg-signal/5 p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-signal">
        Community win-win
      </p>
      <p className="mt-2 text-sm">
        At least <span className="font-semibold">50%</span> of your fee locks as{" "}
        <span className="font-semibold">{bccAmount.toLocaleString()} BCC</span> and joins the
        community stake pool — your skin in the game, shared upside for the tribe.
      </p>
    </div>
  );
}
