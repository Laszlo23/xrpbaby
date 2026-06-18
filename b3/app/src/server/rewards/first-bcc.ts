import type { PrismaClient } from "@prisma/client";
import type { Address } from "viem";

import { trySendBccFromTreasury } from "@/server/wallet/bcc-treasury-transfer";

/** Welcome onboarding BCC grant (wei). Default 10 BCC. */
export function onboardingBccGrantWei(): bigint {
  const raw = process.env.ONBOARDING_BCC_GRANT_WEI?.trim();
  if (raw && /^\d+$/.test(raw)) return BigInt(raw);
  return 10n * 10n ** 18n;
}

export type FirstBccGrantResult =
  | { ok: true; mode: "onchain"; txHash: string; amountWei: string }
  | { ok: true; mode: "queued"; amountWei: string; note: string }
  | { ok: false; reason: string; alreadyGranted?: boolean };

export async function grantOnboardingBccIfEligible(
  prisma: PrismaClient,
  input: { memberId: string; walletAddress: string },
): Promise<FirstBccGrantResult> {
  const existing = await prisma.rewardGrant.findFirst({
    where: { memberId: input.memberId, kind: "onboarding_bcc" },
  });
  if (existing) {
    return { ok: false, reason: "already_granted", alreadyGranted: true };
  }

  const amountWei = onboardingBccGrantWei();
  const to = input.walletAddress.toLowerCase() as Address;

  const transfer = await trySendBccFromTreasury({
    to,
    amountWei,
    memo: "onboarding_bcc",
  });

  if (transfer.ok) {
    await prisma.rewardGrant.create({
      data: {
        memberId: input.memberId,
        kind: "onboarding_bcc",
        amount: Number(amountWei / 10n ** 18n),
        metadata: { txHash: transfer.txHash, amountWei: amountWei.toString() },
      },
    });
    return {
      ok: true,
      mode: "onchain",
      txHash: transfer.txHash,
      amountWei: amountWei.toString(),
    };
  }

  if (transfer.mode === "disabled" || transfer.mode === "not_configured") {
    await prisma.rewardGrant.create({
      data: {
        memberId: input.memberId,
        kind: "onboarding_bcc",
        amount: Number(amountWei / 10n ** 18n),
        metadata: {
          status: "queued",
          amountWei: amountWei.toString(),
          note: transfer.error,
        },
      },
    });
    return {
      ok: true,
      mode: "queued",
      amountWei: amountWei.toString(),
      note: "Treasury transfer queued — ops will fulfill when BCC_TREASURY_ONCHAIN=1.",
    };
  }

  return { ok: false, reason: transfer.error };
}
