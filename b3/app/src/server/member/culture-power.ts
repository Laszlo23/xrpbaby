import type { Prisma, PrismaClient } from "@prisma/client";
import type { Address } from "viem";

import {
  burnTierFromWei30d,
  computeCulturePower,
  isCulturePowerEnabledServer,
  lpTierFromBalanceWei,
  MAINTENANCE_TASK_SLUGS,
  type ComputedCulturePower,
  utcDayIndex,
} from "@/lib/identity/culture-power";
import { walletHasBccLpProof } from "@/server/liquidity/lp-proof";
import { ensureWalletAndMember } from "@/server/platform/member";

type PrismaDb = PrismaClient | Prisma.TransactionClient;

const POWER_REACTOR_MAX_SCORE = 900;

export type MemberPowerQuote = ComputedCulturePower & {
  enabled: boolean;
  effectiveMultiplierBps: number;
};

async function maintenanceDaysWithActivity(
  prisma: PrismaDb,
  walletId: string,
  lookbackDays: number,
): Promise<Set<number>> {
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
  const rows = await prisma.pointLedger.findMany({
    where: {
      walletId,
      createdAt: { gte: since },
      OR: [{ taskSlug: { in: [...MAINTENANCE_TASK_SLUGS] } }, { reason: "task_completion" }],
    },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const days = new Set<number>();
  for (const row of rows) {
    days.add(utcDayIndex(row.createdAt.getTime()));
  }
  return days;
}

function computeStreakFromDays(activeDays: Set<number>, nowMs: number): number {
  let streak = 0;
  let day = utcDayIndex(nowMs);
  while (activeDays.has(day)) {
    streak++;
    day--;
  }
  return streak;
}

async function findLastMaintenance(prisma: PrismaDb, walletId: string): Promise<Date | null> {
  const row = await prisma.pointLedger.findFirst({
    where: {
      walletId,
      OR: [{ taskSlug: { in: [...MAINTENANCE_TASK_SLUGS] } }, { reason: "task_completion" }],
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return row?.createdAt ?? null;
}

async function sumBurnProofWei30d(prisma: PrismaDb, memberId: string): Promise<bigint> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const proofs = await prisma.memberPowerProof.findMany({
    where: { memberId, kind: "bcc_burn", createdAt: { gte: since } },
    select: { amountWei: true },
  });
  let total = 0n;
  for (const p of proofs) {
    if (!p.amountWei) continue;
    try {
      total += BigInt(p.amountWei);
    } catch {
      /* skip */
    }
  }
  return total;
}

async function upsertLpProof(
  prisma: PrismaDb,
  memberId: string,
  balanceWei: string,
): Promise<void> {
  const recent = await prisma.memberPowerProof.findFirst({
    where: {
      memberId,
      kind: "aerodrome_lp",
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent?.amountWei === balanceWei) return;

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.memberPowerProof.create({
    data: {
      memberId,
      kind: "aerodrome_lp",
      proofRef: `lp:${balanceWei}`,
      amountWei: balanceWei,
      expiresAt,
    },
  });
}

async function creditPowerQuests(
  prisma: PrismaDb,
  walletId: string,
  memberId: string,
  powerScore: number,
  streakDays: number,
): Promise<void> {
  const { ensureDefaultTasks } = await import("@/server/points/tasks");
  await ensureDefaultTasks(prisma);

  async function creditOnce(slug: string, points: number): Promise<void> {
    const existing = await prisma.pointLedger.findFirst({
      where: { walletId, taskSlug: slug, reason: "task_completion" },
    });
    if (existing) return;
    if (points > 0) {
      await prisma.pointLedger.create({
        data: { walletId, delta: points, reason: "task_completion", taskSlug: slug },
      });
    }
    const { logTaskCompletionActivity } = await import("@/server/points/task-completion-events");
    await logTaskCompletionActivity(prisma, { memberId, taskSlug: slug });
  }

  if (streakDays >= 7) {
    await creditOnce("power-streak-7", 35);
  }
  if (powerScore >= POWER_REACTOR_MAX_SCORE) {
    await creditOnce("power-reactor-max", 50);
  }
}

export async function refreshMemberPower(
  prisma: PrismaDb,
  address: string,
  opts?: { maintenanceJustCompleted?: boolean },
): Promise<MemberPowerQuote | null> {
  if (!isCulturePowerEnabledServer()) return null;

  const addr = address.toLowerCase() as Address;
  const { member, wallet } = await ensureWalletAndMember(prisma, addr);
  const nowMs = Date.now();

  let lastMaintenance = await findLastMaintenance(prisma, wallet.id);
  if (opts?.maintenanceJustCompleted) {
    lastMaintenance = new Date(nowMs);
    const dayUTC = new Date(nowMs).toISOString().slice(0, 10);
    const existingMaint = await prisma.pointLedger.findFirst({
      where: {
        walletId: wallet.id,
        taskSlug: "power-daily-maintenance",
        reason: "task_completion",
        createdAt: { gte: new Date(`${dayUTC}T00:00:00.000Z`) },
      },
    });
    if (!existingMaint) {
      await prisma.pointLedger.create({
        data: {
          walletId: wallet.id,
          delta: 5,
          reason: "task_completion",
          taskSlug: "power-daily-maintenance",
          metadata: { dayUTC: new Date(nowMs).toISOString().slice(0, 10) },
        },
      });
    }
  }

  const activeDays = await maintenanceDaysWithActivity(prisma, wallet.id, 14);
  const streakDays = computeStreakFromDays(activeDays, nowMs);

  const stakePoolId = await (async () => {
    const { resolveStakingBoostPoolId } = await import("@/server/points/weekly-claim");
    return resolveStakingBoostPoolId(addr);
  })();

  let lpTier = 0;
  const lp = await walletHasBccLpProof(addr);
  if (lp.ok && lp.balance) {
    lpTier = lpTierFromBalanceWei(BigInt(lp.balance));
    await upsertLpProof(prisma, member.id, lp.balance);
  }

  const burnWei = await sumBurnProofWei30d(prisma, member.id);
  const burnTier = burnTierFromWei30d(burnWei);

  const existing = await prisma.memberPowerState.findUnique({
    where: { memberId: member.id },
  });

  const peakScore7d = Math.max(existing?.peakScore7d ?? 400, existing?.powerScore ?? 400);

  const computed = computeCulturePower({
    nowMs,
    lastMaintenanceMs: lastMaintenance?.getTime() ?? null,
    peakScore7d,
    streakDays,
    stakePoolId,
    lpTier,
    burnTier,
  });

  const newPeak = Math.max(peakScore7d, computed.powerScore);
  const metadata = {
    dimensions: computed.dimensions,
    stakePoolId,
    lpTier,
    burnTier,
    effectiveMultiplierBps: computed.effectiveMultiplierBps,
  };

  await prisma.memberPowerState.upsert({
    where: { memberId: member.id },
    create: {
      memberId: member.id,
      powerScore: computed.powerScore,
      peakScore7d: newPeak,
      streakDays,
      lastMaintenance,
      lastComputedAt: new Date(nowMs),
      metadata,
    },
    update: {
      powerScore: computed.powerScore,
      peakScore7d: newPeak,
      streakDays,
      lastMaintenance: lastMaintenance ?? undefined,
      lastComputedAt: new Date(nowMs),
      metadata,
    },
  });

  await creditPowerQuests(prisma, wallet.id, member.id, computed.powerScore, streakDays);

  return { ...computed, enabled: true, effectiveMultiplierBps: computed.effectiveMultiplierBps };
}

export async function getMemberPowerQuote(
  prisma: PrismaDb,
  address: string,
): Promise<MemberPowerQuote> {
  if (!isCulturePowerEnabledServer()) {
    const fallback = computeCulturePower({
      nowMs: Date.now(),
      lastMaintenanceMs: null,
      peakScore7d: 400,
      streakDays: 0,
      stakePoolId: 0,
      lpTier: 0,
      burnTier: 0,
    });
    return { ...fallback, enabled: false, effectiveMultiplierBps: 10_000 };
  }

  const refreshed = await refreshMemberPower(prisma, address);
  if (refreshed) return refreshed;

  const fallback = computeCulturePower({
    nowMs: Date.now(),
    lastMaintenanceMs: null,
    peakScore7d: 400,
    streakDays: 0,
    stakePoolId: 0,
    lpTier: 0,
    burnTier: 0,
  });
  return { ...fallback, enabled: true, effectiveMultiplierBps: fallback.effectiveMultiplierBps };
}

/** Non-blocking hook after maintenance actions. */
export async function touchMemberPowerAfterMaintenance(
  prisma: PrismaDb,
  address: string,
): Promise<void> {
  if (!isCulturePowerEnabledServer()) return;
  try {
    await refreshMemberPower(prisma, address, { maintenanceJustCompleted: true });
  } catch {
    /* best-effort */
  }
}

export async function recordBurnPowerProof(
  prisma: PrismaDb,
  address: string,
  amountWei: string,
  proofRef: string,
): Promise<void> {
  if (!isCulturePowerEnabledServer()) return;
  const { member } = await ensureWalletAndMember(prisma, address);
  await prisma.memberPowerProof.create({
    data: {
      memberId: member.id,
      kind: "bcc_burn",
      proofRef,
      amountWei,
    },
  });
  await refreshMemberPower(prisma, address);
}
