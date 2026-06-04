import type { PrismaClient } from "@prisma/client";
import type { PackDefinition } from "@/lib/packs";
import { BCC_DISCOUNT_BPS } from "@bc/bcc-kit";

/** Placeholder wei-per-USD-cent until treasury oracle job fills live quotes. */
const PLACEHOLDER_BCC_WEI_PER_USD_CENT = 1_000_000_000_000_000n; // 0.001 BCC per cent @ $1/BCC fiction

function packBonusBccWei(usdCents: number): bigint {
  const base = BigInt(usdCents) * PLACEHOLDER_BCC_WEI_PER_USD_CENT;
  return (base * BigInt(BCC_DISCOUNT_BPS)) / 10_000n;
}

export type EnqueueBccSettlementInput = {
  memberId: string;
  walletId: string;
  pack: PackDefinition;
  stripeSessionId: string;
};

/**
 * Record a pending BCC settlement after Stripe pack purchase.
 * Treasury keeper (or manual ops) marks `credited` after on-ramp buy/mint.
 */
export async function enqueueBccSettlement(prisma: PrismaClient, input: EnqueueBccSettlementInput) {
  const { memberId, walletId, pack, stripeSessionId } = input;
  const existing = await prisma.bccSettlement.findUnique({
    where: { stripeSessionId },
  });
  if (existing) return { alreadyQueued: true as const, settlement: existing };

  const bccOwedWei = (BigInt(pack.usdCents) * PLACEHOLDER_BCC_WEI_PER_USD_CENT).toString();
  const bonusBccWei = packBonusBccWei(pack.usdCents).toString();

  const settlement = await prisma.bccSettlement.create({
    data: {
      memberId,
      walletId,
      packSlug: pack.slug,
      stripeSessionId,
      usdCents: pack.usdCents,
      bccOwedWei,
      bonusBccWei,
      status: "pending",
      note: "Awaiting treasury BCC buy/mint — see docs/BCC_TOKEN.md",
    },
  });

  return { alreadyQueued: false as const, settlement };
}
