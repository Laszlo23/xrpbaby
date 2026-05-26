import type { PrismaClient } from "@prisma/client";
import type { PackDefinition } from "@/lib/packs";

export async function grantPackPurchase(
  prisma: PrismaClient,
  input: {
    memberId: string;
    walletId: string;
    pack: PackDefinition;
    stripeSessionId: string;
  },
): Promise<{ alreadyGranted: boolean; pointsGranted: number }> {
  const existing = await prisma.packPurchase.findUnique({
    where: { stripeSessionId: input.stripeSessionId },
  });
  if (existing) {
    return { alreadyGranted: true, pointsGranted: existing.pointsGranted };
  }

  await prisma.$transaction(async (tx) => {
    await tx.packPurchase.create({
      data: {
        memberId: input.memberId,
        walletId: input.walletId,
        packSlug: input.pack.slug,
        usdCents: input.pack.usdCents,
        pointsGranted: input.pack.culturePoints,
        stripeSessionId: input.stripeSessionId,
      },
    });

    await tx.pointLedger.create({
      data: {
        walletId: input.walletId,
        delta: input.pack.culturePoints,
        reason: "pack_purchase",
        taskSlug: input.pack.slug,
        metadata: {
          packSlug: input.pack.slug,
          usd: input.pack.usd,
          stripeSessionId: input.stripeSessionId,
        },
      },
    });

    if (input.pack.grantsSupporterBadge) {
      const badge = await tx.rewardGrant.findFirst({
        where: { memberId: input.memberId, kind: "supporter_badge" },
      });
      if (!badge) {
        await tx.rewardGrant.create({
          data: {
            memberId: input.memberId,
            kind: "supporter_badge",
            amount: 1,
            metadata: { packSlug: input.pack.slug },
          },
        });
        await tx.member.update({
          where: { id: input.memberId },
          data: { supporterTier: "founding" },
        });
      }
    }

    if (input.pack.grantsIdentityMintCredit) {
      const credit = await tx.rewardGrant.findFirst({
        where: { memberId: input.memberId, kind: "identity_mint_credit" },
      });
      if (!credit) {
        await tx.rewardGrant.create({
          data: {
            memberId: input.memberId,
            kind: "identity_mint_credit",
            amount: 1,
            metadata: { packSlug: input.pack.slug },
          },
        });
      }
    }
  });

  return { alreadyGranted: false, pointsGranted: input.pack.culturePoints };
}
