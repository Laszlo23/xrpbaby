import type { MemberPlan } from "@/generated/prisma/client";

import {
  BCC_PER_DOLLAR_LOCKED,
  COMMUNITY_LOCK_RATIO,
  computeCommunityStake,
  paidCentsForPlan,
  type CommunityStakeStatus,
} from "@/lib/community-stake-data";
import { getPrisma } from "@/lib/db.server";
import { transferBcc } from "@/lib/solana/token.server";

export async function allocateCommunityStake(memberId: string, plan: MemberPlan) {
  const paidCents = paidCentsForPlan(plan);
  const { lockCents, bccAmount } = computeCommunityStake(paidCents);
  if (bccAmount <= 0) return null;

  const prisma = getPrisma();
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new Error("Member not found");

  const existing = await prisma.memberCommunityStake.findFirst({
    where: { memberId, plan, status: { not: "released" } },
  });
  if (existing) return formatStake(existing);

  const stake = await prisma.memberCommunityStake.create({
    data: {
      memberId,
      plan,
      paidCents,
      lockCents,
      bccAmount,
      status: "pending_wallet",
    },
  });

  if (member.walletAddress) {
    return processStakeLock(stake.id, member.walletAddress);
  }

  return formatStake(stake);
}

export async function processStakeLock(stakeId: string, walletAddress: string) {
  const prisma = getPrisma();
  const stake = await prisma.memberCommunityStake.findUnique({ where: { id: stakeId } });
  if (!stake) throw new Error("Stake not found");
  if (stake.status === "locked_staking") return formatStake(stake);

  let lockTxSignature: string | null = null;
  let status: CommunityStakeStatus = "pending_wallet";

  try {
    lockTxSignature = await transferBcc(walletAddress, stake.bccAmount);
    status = "locked_staking";
  } catch {
    status = "pending_wallet";
  }

  const updated = await prisma.memberCommunityStake.update({
    where: { id: stakeId },
    data: {
      status,
      walletAddress,
      lockTxSignature,
      stakedAt: status === "locked_staking" ? new Date() : null,
    },
  });

  return formatStake(updated);
}

export async function processPendingStakesForMember(memberId: string) {
  const prisma = getPrisma();
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member?.walletAddress) return [];

  const pending = await prisma.memberCommunityStake.findMany({
    where: { memberId, status: "pending_wallet" },
  });

  const results = [];
  for (const stake of pending) {
    results.push(await processStakeLock(stake.id, member.walletAddress));
  }
  return results;
}

export function formatStake(stake: {
  id: string;
  plan: MemberPlan;
  paidCents: number;
  lockCents: number;
  bccAmount: number;
  status: string;
  walletAddress: string | null;
  lockTxSignature: string | null;
  stakedAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: stake.id,
    plan: stake.plan,
    paidCents: stake.paidCents,
    paidUsd: stake.paidCents / 100,
    lockCents: stake.lockCents,
    lockUsd: stake.lockCents / 100,
    lockRatio: COMMUNITY_LOCK_RATIO,
    bccAmount: stake.bccAmount,
    bccPerDollar: BCC_PER_DOLLAR_LOCKED,
    status: stake.status as CommunityStakeStatus,
    walletAddress: stake.walletAddress,
    lockTxSignature: stake.lockTxSignature,
    stakedAt: stake.stakedAt?.toISOString() ?? null,
    createdAt: stake.createdAt.toISOString(),
  };
}

export async function getCommunityStakeSummary(memberId: string) {
  const prisma = getPrisma();
  const stakes = await prisma.memberCommunityStake.findMany({
    where: { memberId },
    orderBy: { createdAt: "desc" },
  });

  const locked = stakes.filter((s) => s.status === "locked_staking");
  const pending = stakes.filter((s) => s.status === "pending_wallet");

  const totalBccLocked = locked.reduce((sum, s) => sum + s.bccAmount, 0);
  const totalBccPending = pending.reduce((sum, s) => sum + s.bccAmount, 0);
  const totalLockCents = stakes.reduce((sum, s) => sum + s.lockCents, 0);

  const poolAggregate = await prisma.memberCommunityStake.aggregate({
    where: { status: "locked_staking" },
    _sum: { bccAmount: true },
    _count: true,
  });

  return {
    stakes: stakes.map(formatStake),
    totalBccLocked,
    totalBccPending,
    totalLockCents,
    lockRatio: COMMUNITY_LOCK_RATIO,
    communityPoolBcc: poolAggregate._sum.bccAmount ?? 0,
    communityStakers: poolAggregate._count,
    needsWallet: pending.length > 0,
  };
}
