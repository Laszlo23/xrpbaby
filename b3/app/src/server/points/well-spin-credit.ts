import { createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";

import { pointsForWellDigit } from "@/lib/spinning-well";
import { ensureWalletAndMember } from "@/server/platform/member";
import { ensureDefaultTasks } from "@/server/points/tasks";
import { ledgerHasDailyCheckInToday, utcDayString } from "@/server/points/daily-checkin-credit";

export const WELL_SPIN_TASK_SLUG = "culture-well-daily";

export async function walletWellSpinCreditedToday(
  prisma: PrismaClient,
  walletId: string,
  dayUTC = utcDayString(),
): Promise<boolean> {
  const prior = await prisma.pointLedger.findMany({
    where: { walletId, taskSlug: WELL_SPIN_TASK_SLUG },
    select: { metadata: true },
  });
  return ledgerHasDailyCheckInToday(prior, dayUTC);
}

export type WellSpinCreditInput = {
  address: string;
  message: string;
  signature: string;
  mode: "siwe" | "onchain";
  value: number;
  txHash?: string;
  dayIndex?: string;
};

export type WellSpinCreditResult = {
  ok: boolean;
  balance: number;
  alreadyCompleted: boolean;
  pointsGranted?: number;
  error?: string;
};

export async function creditWellSpinPoints(
  prisma: PrismaClient,
  input: WellSpinCreditInput,
): Promise<WellSpinCreditResult> {
  await ensureDefaultTasks(prisma);

  const task = await prisma.taskDefinition.findUnique({
    where: { slug: WELL_SPIN_TASK_SLUG },
  });
  if (!task || !task.active) {
    return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_task" };
  }

  const digit = Math.floor(input.value);
  const points = pointsForWellDigit(digit);
  if (points <= 0) {
    return { ok: false, balance: 0, alreadyCompleted: false, error: "invalid_value" };
  }

  const addr = input.address.toLowerCase();
  const { wallet } = await ensureWalletAndMember(prisma, addr);
  const dayUTC = utcDayString();

  const prior = await prisma.pointLedger.findMany({
    where: { walletId: wallet.id, taskSlug: WELL_SPIN_TASK_SLUG },
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
          kind: "well_spin_chain" as const,
          dayUTC,
          digit,
          pointsGranted: points,
          txHash: input.txHash?.toLowerCase(),
          dayIndex: input.dayIndex,
          siweMessageSha256,
          siweSignatureSha256,
          attestedAddress: addr,
        }
      : {
          kind: "well_spin_siwe" as const,
          dayUTC,
          digit,
          pointsGranted: points,
          dayIndex: input.dayIndex,
          siweMessageSha256,
          siweSignatureSha256,
          attestedAddress: addr,
        };

  await prisma.pointLedger.create({
    data: {
      walletId: wallet.id,
      delta: points,
      reason: "task_completion",
      taskSlug: WELL_SPIN_TASK_SLUG,
      metadata,
    },
  });

  const agg = await prisma.pointLedger.aggregate({
    where: { walletId: wallet.id },
    _sum: { delta: true },
  });

  const { touchMemberPowerAfterMaintenance } = await import("@/server/member/culture-power");
  await touchMemberPowerAfterMaintenance(prisma, addr);

  return {
    ok: true,
    alreadyCompleted: false,
    balance: agg._sum.delta ?? 0,
    pointsGranted: points,
  };
}
