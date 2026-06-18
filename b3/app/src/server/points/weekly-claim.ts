import type { PrismaClient } from "@prisma/client";
import type { Address } from "viem";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import {
  isWeeklyClaimBypassTvl,
  isWeeklyClaimEnabledServer,
  resolveWeeklyCooldownMs,
  applyStakingBoost,
  STAKING_BOOST_BPS,
  buildWeeklyClaimIdempotencyKey,
} from "@/lib/weekly-claim-policy";
import { getServerRedemptionReadiness } from "@/lib/redemption-policy";
import { buildBccLiquidityMarket } from "@/server/liquidity/bcc-pools";
import { ensureWalletAndMember } from "@/server/platform/member";
import { isSyntheticTelegramWallet } from "@/server/points/wallet-utils";
import {
  getPointsBalance,
  pointsToBccWei,
  resolvePointsPerBccWei,
} from "@/server/points/redeem";
import {
  isAddressOnBccPayoutWhitelist,
  isBccPayoutWhitelistActive,
  trySendBccFromTreasury,
} from "@/server/wallet/bcc-treasury-transfer";
import { BCC_ROOTS_STAKING_ABI } from "@/lib/roots-abi";

function resolveStakingAddress(): Address | undefined {
  const raw =
    process.env.BCC_ROOTS_STAKING_ADDRESS?.trim() ||
    process.env.VITE_BCC_ROOTS_STAKING_ADDRESS?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw as Address;
}

function resolveRpcUrl(): string {
  return (
    process.env.BCC_TREASURY_RPC_URL?.trim() ||
    process.env.BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org"
  );
}

export async function resolveStakingBoostPoolId(address: Address): Promise<number> {
  const staking = resolveStakingAddress();
  if (!staking) return 0;

  const client = createPublicClient({ chain: base, transport: http(resolveRpcUrl()) });
  let highest = -1;
  for (const poolId of [2, 1, 0]) {
    try {
      const bal = await client.readContract({
        address: staking,
        abi: BCC_ROOTS_STAKING_ABI,
        functionName: "balanceOf",
        args: [BigInt(poolId), address],
      });
      if (bal > 0n) {
        highest = poolId;
        break;
      }
    } catch {
      /* skip */
    }
  }
  return highest >= 0 ? highest : 0;
}

export async function getLastWeeklyClaimAt(
  prisma: PrismaClient,
  walletId: string,
): Promise<Date | null> {
  const row = await prisma.pointRedemption.findFirst({
    where: {
      walletId,
      idempotencyKey: { startsWith: "weekly:" },
      status: { in: ["credited", "pending"] },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, creditedAt: true },
  });
  if (!row) return null;
  return row.creditedAt ?? row.createdAt;
}

export type WeeklyClaimQuote = {
  ok: boolean;
  error?: string;
  enabled: boolean;
  ready: boolean;
  balance: number;
  pointsPerBccWei: string;
  baseBccWei: string;
  boostedBccWei: string;
  stakingBoostPoolId: number;
  stakingBoostLabel: string;
  canClaim: boolean;
  nextClaimAt: string | null;
  cooldownMs: number;
  onPayoutWhitelist: boolean;
};

export async function quoteWeeklyClaim(
  prisma: PrismaClient,
  address: string,
): Promise<WeeklyClaimQuote> {
  const enabled = isWeeklyClaimEnabledServer();
  const cooldownMs = resolveWeeklyCooldownMs();
  const pointsPerBccWei = resolvePointsPerBccWei();
  const market = await buildBccLiquidityMarket();
  const readiness = getServerRedemptionReadiness(market.combinedLiquidityUsd);
  const ready =
    enabled &&
    pointsPerBccWei > 0n &&
    (readiness.ready || isWeeklyClaimBypassTvl());

  const addr = address.toLowerCase() as Address;
  const wallet = await prisma.wallet.findUnique({ where: { address: addr } });
  const balance = wallet ? await getPointsBalance(prisma, wallet.id) : 0;

  const stakingBoostPoolId = await resolveStakingBoostPoolId(addr);
  const baseBccWei = pointsToBccWei(balance, pointsPerBccWei);
  const boostedBccWei = applyStakingBoost(baseBccWei, stakingBoostPoolId);
  const bps = STAKING_BOOST_BPS[stakingBoostPoolId] ?? 10_000;

  let nextClaimAt: string | null = null;
  let canClaim = false;
  const payoutAllowed = isAddressOnBccPayoutWhitelist(addr);
  if (wallet) {
    const last = await getLastWeeklyClaimAt(prisma, wallet.id);
    if (!last) {
      canClaim = ready && balance > 0 && payoutAllowed;
    } else {
      const eligibleAt = last.getTime() + cooldownMs;
      if (Date.now() >= eligibleAt) {
        canClaim = ready && balance > 0 && payoutAllowed;
      } else {
        nextClaimAt = new Date(eligibleAt).toISOString();
      }
    }
  }

  return {
    ok: true,
    enabled,
    ready,
    balance,
    pointsPerBccWei: pointsPerBccWei.toString(),
    baseBccWei: baseBccWei.toString(),
    boostedBccWei: boostedBccWei.toString(),
    stakingBoostPoolId,
    stakingBoostLabel: `${(bps / 10_000).toFixed(2)}×`,
    canClaim,
    nextClaimAt,
    cooldownMs,
    onPayoutWhitelist: payoutAllowed,
  };
}

export type WeeklyClaimResult = {
  ok: boolean;
  error?: string;
  balance: number;
  bccWei?: string;
  baseBccWei?: string;
  txHash?: string;
  redemptionId?: string;
  alreadyClaimed?: boolean;
  pendingWhitelist?: boolean;
  nextClaimAt?: string;
  stakingBoostLabel?: string;
};

export async function claimWeeklyBcc(
  prisma: PrismaClient,
  input: { address: string },
): Promise<WeeklyClaimResult> {
  const addr = input.address.toLowerCase() as Address;

  return prisma.$transaction(async (tx) => {
    const enabled = isWeeklyClaimEnabledServer();
    if (!enabled) {
      return { ok: false, error: "weekly_claim_disabled", balance: 0 };
    }

    const { wallet } = await ensureWalletAndMember(tx, addr);

    await tx.$executeRaw`SELECT id FROM "Wallet" WHERE id = ${wallet.id} FOR UPDATE`;

    const idempotencyKey = buildWeeklyClaimIdempotencyKey(addr);

    const existing = await tx.pointRedemption.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      if (existing.walletId !== wallet.id) {
        const balance = await getPointsBalance(tx, wallet.id);
        return { ok: false, error: "idempotency_conflict", balance };
      }
      const balance = await getPointsBalance(tx, existing.walletId);
      if (existing.status === "credited") {
        return {
          ok: true,
          alreadyClaimed: true,
          balance,
          bccWei: existing.bccWei,
          txHash: existing.txHash ?? undefined,
          redemptionId: existing.id,
        };
      }
      if (existing.status === "pending_whitelist") {
        await tx.pointLedger.create({
          data: {
            walletId: wallet.id,
            delta: existing.pointsSpent,
            reason: "weekly_bcc_claim_rollback",
            metadata: {
              redemptionId: existing.id,
              note: "whitelist_hold_reversed",
            },
          },
        });
        await tx.pointRedemption.update({
          where: { id: existing.id },
          data: {
            status: "failed",
            idempotencyKey: `${idempotencyKey}:released:${existing.id}`,
          },
        });
      } else if (existing.status === "pending") {
        return { ok: false, error: "claim_in_progress", balance };
      } else if (existing.status === "failed") {
        await tx.pointRedemption.update({
          where: { id: existing.id },
          data: { idempotencyKey: `${idempotencyKey}:released:${existing.id}` },
        });
      } else {
        return { ok: false, error: "claim_in_progress", balance };
      }
    }

    const quote = await quoteWeeklyClaim(tx, addr);
    if (!quote.ready) {
      return { ok: false, error: "weekly_claim_not_ready", balance: quote.balance };
    }
    if (!quote.canClaim) {
      return {
        ok: false,
        error: "cooldown_active",
        balance: quote.balance,
        nextClaimAt: quote.nextClaimAt ?? undefined,
      };
    }
    if (quote.balance <= 0) {
      return { ok: false, error: "insufficient_points", balance: 0 };
    }

    const onWhitelist = isAddressOnBccPayoutWhitelist(addr);
    if (isBccPayoutWhitelistActive() && !onWhitelist) {
      return { ok: false, error: "not_on_payout_whitelist", balance: quote.balance };
    }

    const points = quote.balance;
    const pointsPerBccWei = BigInt(quote.pointsPerBccWei);
    const baseBccWei = pointsToBccWei(points, pointsPerBccWei);
    const boostedBccWei = applyStakingBoost(baseBccWei, quote.stakingBoostPoolId);
    if (boostedBccWei <= 0n) {
      return { ok: false, error: "invalid_conversion_rate", balance: quote.balance };
    }

    if (await isSyntheticTelegramWallet(tx, wallet.id, addr)) {
      return { ok: false, error: "synthetic_wallet_not_redeemable", balance: 0 };
    }

    const redemption = await tx.pointRedemption.create({
      data: {
        walletId: wallet.id,
        pointsSpent: points,
        bccWei: boostedBccWei.toString(),
        status: "pending",
        idempotencyKey,
      },
    });

    await tx.pointLedger.create({
      data: {
        walletId: wallet.id,
        delta: -points,
        reason: "weekly_bcc_claim",
        taskSlug: "weekly-bcc-claim",
        metadata: {
          redemptionId: redemption.id,
          baseBccWei: baseBccWei.toString(),
          boostedBccWei: boostedBccWei.toString(),
          stakingBoostPoolId: quote.stakingBoostPoolId,
        },
      },
    });

    const payout = await trySendBccFromTreasury({
      to: addr,
      amountWei: boostedBccWei,
      memo: `weekly_claim:${redemption.id}`,
    });

    if (!payout.ok) {
      await tx.pointRedemption.update({
        where: { id: redemption.id },
        data: {
          status: "failed",
          idempotencyKey: `${idempotencyKey}:failed:${redemption.id}`,
        },
      });
      await tx.pointLedger.create({
        data: {
          walletId: wallet.id,
          delta: points,
          reason: "weekly_bcc_claim_rollback",
          metadata: { redemptionId: redemption.id, error: payout.error },
        },
      });
      const newBalance = await getPointsBalance(tx, wallet.id);
      return { ok: false, error: payout.error, balance: newBalance };
    }

    await tx.pointRedemption.update({
      where: { id: redemption.id },
      data: {
        status: "credited",
        txHash: payout.txHash,
        creditedAt: new Date(),
      },
    });

    const newBalance = await getPointsBalance(tx, wallet.id);
    const cooldownMs = resolveWeeklyCooldownMs();
    return {
      ok: true,
      balance: newBalance,
      bccWei: boostedBccWei.toString(),
      baseBccWei: baseBccWei.toString(),
      txHash: payout.txHash,
      redemptionId: redemption.id,
      stakingBoostLabel: quote.stakingBoostLabel,
      nextClaimAt: new Date(Date.now() + cooldownMs).toISOString(),
    };
  });
}
