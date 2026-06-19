import { createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";

import { ensureWalletAndMember } from "@/server/platform/member";
import { ensureDefaultTasks } from "@/server/points/tasks";

export function utcDayString(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function ledgerHasDailyCheckInToday(
  rows: Array<{ metadata: unknown }>,
  dayUTC = utcDayString(),
): boolean {
  return rows.some((row) => {
    const m = row.metadata as { dayUTC?: string } | null;
    return m?.dayUTC === dayUTC;
  });
}

export async function walletDailyCheckInCreditedToday(
  prisma: PrismaClient,
  walletId: string,
  dayUTC = utcDayString(),
): Promise<boolean> {
  const prior = await prisma.pointLedger.findMany({
    where: { walletId, taskSlug: "daily-checkin-onchain" },
    select: { metadata: true },
  });
  return ledgerHasDailyCheckInToday(prior, dayUTC);
}

export type DailyCheckInCreditInput = {
  address: string;
  message: string;
  signature: string;
  mode: "siwe" | "onchain";
  txHash?: string;
  dayIndex?: string;
};

export type DailyCheckInCreditResult = {
  ok: boolean;
  balance: number;
  alreadyCompleted: boolean;
  bonusGranted?: boolean;
  bonusPoints?: number;
  error?: string;
};

/** Credit daily check-in + optional signature bonus once per UTC day. */
export async function creditDailyCheckInPoints(
  prisma: PrismaClient,
  input: DailyCheckInCreditInput,
): Promise<DailyCheckInCreditResult> {
  await ensureDefaultTasks(prisma);

  const task = await prisma.taskDefinition.findUnique({
    where: { slug: "daily-checkin-onchain" },
  });
  const bonusTask = await prisma.taskDefinition.findUnique({
    where: { slug: "daily-signature-attestation-bonus" },
  });
  if (!task || !task.active) {
    return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_task" };
  }

  const addr = input.address.toLowerCase();
  const { wallet } = await ensureWalletAndMember(prisma, addr);
  const dayUTC = utcDayString();

  const prior = await prisma.pointLedger.findMany({
    where: { walletId: wallet.id, taskSlug: "daily-checkin-onchain" },
    select: { metadata: true },
  });
  if (ledgerHasDailyCheckInToday(prior, dayUTC)) {
    const agg = await prisma.pointLedger.aggregate({
      where: { walletId: wallet.id },
      _sum: { delta: true },
    });
    return {
      ok: true,
      alreadyCompleted: true,
      balance: agg._sum.delta ?? 0,
    };
  }

  const siweMessageSha256 = createHash("sha256").update(input.message).digest("hex");
  const siweSignatureSha256 = createHash("sha256").update(input.signature).digest("hex");

  const metadata =
    input.mode === "onchain"
      ? {
          kind: "daily_chain" as const,
          dayUTC,
          txHash: input.txHash?.toLowerCase(),
          dayIndex: input.dayIndex,
          siweMessageSha256,
          siweSignatureSha256,
          attestedAddress: addr,
        }
      : {
          kind: "daily_siwe" as const,
          dayUTC,
          dayIndex: input.dayIndex,
          siweMessageSha256,
          siweSignatureSha256,
          attestedAddress: addr,
        };

  if (task.points > 0) {
    await prisma.pointLedger.create({
      data: {
        walletId: wallet.id,
        delta: task.points,
        reason: "task_completion",
        taskSlug: "daily-checkin-onchain",
        metadata,
      },
    });
  }

  let bonusGranted = false;
  let bonusPoints = 0;
  if (bonusTask && bonusTask.active && bonusTask.points > 0) {
    const priorBonus = await prisma.pointLedger.findMany({
      where: { walletId: wallet.id, taskSlug: "daily-signature-attestation-bonus" },
      select: { metadata: true },
    });
    if (!ledgerHasDailyCheckInToday(priorBonus, dayUTC)) {
      bonusGranted = true;
      bonusPoints = bonusTask.points;
      await prisma.pointLedger.create({
        data: {
          walletId: wallet.id,
          delta: bonusTask.points,
          reason: "task_completion",
          taskSlug: "daily-signature-attestation-bonus",
          metadata: {
            kind: "daily_signature_attestation_bonus",
            dayUTC,
            txHash: input.txHash?.toLowerCase(),
            dayIndex: input.dayIndex,
            siweMessageSha256,
            siweSignatureSha256,
            attestedAddress: addr,
          },
        },
      });
    }
  }

  const agg = await prisma.pointLedger.aggregate({
    where: { walletId: wallet.id },
    _sum: { delta: true },
  });

  const { touchMemberPowerAfterMaintenance } = await import("@/server/member/culture-power");
  await touchMemberPowerAfterMaintenance(prisma, addr);

  return {
    ok: true,
    alreadyCompleted: false,
    bonusGranted,
    bonusPoints,
    balance: agg._sum.delta ?? 0,
  };
}
