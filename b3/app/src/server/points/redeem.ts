import type { Prisma, PrismaClient } from "@prisma/client";
import type { Address } from "viem";
import { redemptionPolicy, getServerRedemptionReadiness } from "@/lib/redemption-policy";
import { buildBccLiquidityMarket } from "@/server/liquidity/bcc-pools";
import { ensureWalletAndMember } from "@/server/platform/member";
import { isSyntheticTelegramWallet } from "@/server/points/wallet-utils";
import { trySendBccFromTreasury } from "@/server/wallet/bcc-treasury-transfer";

export function resolvePointsPerBccWei(): bigint {
  const raw =
    process.env.POINTS_PER_BCC_WEI?.trim() || process.env.VITE_POINTS_PER_BCC_WEI?.trim() || "0";
  try {
    const v = BigInt(raw);
    return v > 0n ? v : 0n;
  } catch {
    return 0n;
  }
}

export function pointsToBccWei(points: number, pointsPerBccWei: bigint): bigint {
  if (points <= 0 || pointsPerBccWei <= 0n) return 0n;
  return BigInt(points) * pointsPerBccWei;
}

export async function getRedeemReadiness() {
  const market = await buildBccLiquidityMarket();
  const readiness = getServerRedemptionReadiness(market.combinedLiquidityUsd);
  const pointsPerBccWei = resolvePointsPerBccWei();
  return {
    ...readiness,
    pointsPerBccWei: pointsPerBccWei.toString(),
    rateConfigured: pointsPerBccWei > 0n,
    ready: readiness.ready && pointsPerBccWei > 0n,
    maxRedeemPointsPerDay: redemptionPolicy.maxRedeemPointsPerDay,
  };
}

export async function getPointsBalance(
  prisma: PrismaClient | Prisma.TransactionClient,
  walletId: string,
): Promise<number> {
  const agg = await prisma.pointLedger.aggregate({
    where: { walletId },
    _sum: { delta: true },
  });
  return agg._sum.delta ?? 0;
}

export async function getRedeemedPointsLast24h(
  prisma: PrismaClient,
  walletId: string,
): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await prisma.pointRedemption.findMany({
    where: {
      walletId,
      status: { in: ["credited", "pending"] },
      createdAt: { gte: since },
    },
    select: { pointsSpent: true },
  });
  return rows.reduce((s, r) => s + r.pointsSpent, 0);
}

export type RedeemQuote = {
  ok: boolean;
  error?: string;
  points: number;
  bccWei: string;
  pointsPerBccWei: string;
  balance: number;
  maxToday: number;
  redeemedToday: number;
  ready: boolean;
};

export async function quotePointsRedeem(
  prisma: PrismaClient,
  address: string,
  points: number,
): Promise<RedeemQuote> {
  const readiness = await getRedeemReadiness();
  const addr = address.toLowerCase();
  const wallet = await prisma.wallet.findUnique({ where: { address: addr } });
  if (!wallet) {
    return {
      ok: true,
      points,
      bccWei: pointsToBccWei(points, BigInt(readiness.pointsPerBccWei)).toString(),
      pointsPerBccWei: readiness.pointsPerBccWei,
      balance: 0,
      maxToday: readiness.maxRedeemPointsPerDay,
      redeemedToday: 0,
      ready: readiness.ready,
    };
  }
  const balance = await getPointsBalance(prisma, wallet.id);
  const redeemedToday = await getRedeemedPointsLast24h(prisma, wallet.id);
  return {
    ok: true,
    points,
    bccWei: pointsToBccWei(points, BigInt(readiness.pointsPerBccWei)).toString(),
    pointsPerBccWei: readiness.pointsPerBccWei,
    balance,
    maxToday: readiness.maxRedeemPointsPerDay,
    redeemedToday,
    ready: readiness.ready,
  };
}

export type RedeemResult = {
  ok: boolean;
  error?: string;
  balance: number;
  bccWei?: string;
  txHash?: string;
  redemptionId?: string;
  alreadyRedeemed?: boolean;
};

export async function redeemPointsForBcc(
  prisma: PrismaClient,
  input: {
    address: string;
    points: number;
    idempotencyKey: string;
  },
): Promise<RedeemResult> {
  const { address, points, idempotencyKey } = input;
  if (!Number.isInteger(points) || points <= 0) {
    return { ok: false, error: "invalid_points", balance: 0 };
  }

  const existing = await prisma.pointRedemption.findUnique({
    where: { idempotencyKey },
  });
  if (existing) {
    const balance = await getPointsBalance(prisma, existing.walletId);
    if (existing.status === "credited") {
      return {
        ok: true,
        alreadyRedeemed: true,
        balance,
        bccWei: existing.bccWei,
        txHash: existing.txHash ?? undefined,
        redemptionId: existing.id,
      };
    }
    return { ok: false, error: "redemption_in_progress", balance };
  }

  const readiness = await getRedeemReadiness();
  if (!readiness.ready) {
    return { ok: false, error: "redemption_not_ready", balance: 0 };
  }

  const pointsPerBccWei = BigInt(readiness.pointsPerBccWei);
  const bccWei = pointsToBccWei(points, pointsPerBccWei);
  if (bccWei <= 0n) {
    return { ok: false, error: "invalid_conversion_rate", balance: 0 };
  }

  const addr = address.toLowerCase() as Address;
  const { wallet } = await ensureWalletAndMember(prisma, addr);

  if (await isSyntheticTelegramWallet(prisma, wallet.id, addr)) {
    return { ok: false, error: "synthetic_wallet_not_redeemable", balance: 0 };
  }

  const balance = await getPointsBalance(prisma, wallet.id);
  if (balance < points) {
    return { ok: false, error: "insufficient_points", balance };
  }

  const redeemedToday = await getRedeemedPointsLast24h(prisma, wallet.id);
  if (redeemedToday + points > readiness.maxRedeemPointsPerDay) {
    return { ok: false, error: "daily_cap_exceeded", balance };
  }

  const redemption = await prisma.pointRedemption.create({
    data: {
      walletId: wallet.id,
      pointsSpent: points,
      bccWei: bccWei.toString(),
      status: "pending",
      idempotencyKey,
    },
  });

  await prisma.pointLedger.create({
    data: {
      walletId: wallet.id,
      delta: -points,
      reason: "bcc_redeem",
      metadata: { redemptionId: redemption.id, bccWei: bccWei.toString() },
    },
  });

  const payout = await trySendBccFromTreasury({
    to: addr,
    amountWei: bccWei,
    memo: `points_redeem:${redemption.id}`,
  });

  if (!payout.ok) {
    await prisma.$transaction([
      prisma.pointRedemption.update({
        where: { id: redemption.id },
        data: { status: "failed" },
      }),
      prisma.pointLedger.create({
        data: {
          walletId: wallet.id,
          delta: points,
          reason: "bcc_redeem_rollback",
          metadata: { redemptionId: redemption.id, error: payout.error },
        },
      }),
    ]);
    const newBalance = await getPointsBalance(prisma, wallet.id);
    return { ok: false, error: payout.error, balance: newBalance };
  }

  await prisma.pointRedemption.update({
    where: { id: redemption.id },
    data: {
      status: "credited",
      txHash: payout.txHash,
      creditedAt: new Date(),
    },
  });

  const newBalance = await getPointsBalance(prisma, wallet.id);
  return {
    ok: true,
    balance: newBalance,
    bccWei: bccWei.toString(),
    txHash: payout.txHash,
    redemptionId: redemption.id,
  };
}

export async function getRedeemStats(prisma: PrismaClient) {
  const [total, credited, pending, failed] = await Promise.all([
    prisma.pointRedemption.count(),
    prisma.pointRedemption.count({ where: { status: "credited" } }),
    prisma.pointRedemption.count({ where: { status: "pending" } }),
    prisma.pointRedemption.count({ where: { status: "failed" } }),
  ]);
  const readiness = await getRedeemReadiness();
  return {
    ok: true,
    total,
    credited,
    pending,
    failed,
    readiness,
  };
}
