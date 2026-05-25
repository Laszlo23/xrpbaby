import type { PrismaClient } from "@prisma/client";

export async function ensureWalletAndMember(
  prisma: PrismaClient,
  address: string,
  opts?: { intent?: string; email?: string },
) {
  const normalized = address.toLowerCase();
  let wallet = await prisma.wallet.findUnique({ where: { address: normalized } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { address: normalized } });
  }

  let member = await prisma.member.findFirst({
    where: { OR: [{ walletId: wallet.id }, { walletAddress: normalized }] },
  });

  if (!member) {
    member = await prisma.member.create({
      data: {
        walletAddress: normalized,
        walletId: wallet.id,
        intent: opts?.intent,
        email: opts?.email,
        supporterTier: "community",
        forestStage: "seedling",
      },
    });
  } else if (opts?.intent && !member.intent) {
    member = await prisma.member.update({
      where: { id: member.id },
      data: { intent: opts.intent },
    });
  }

  return { wallet, member };
}

export async function logActivity(
  prisma: PrismaClient,
  input: {
    memberId?: string;
    type: string;
    sourceModule?: string;
    payload?: Record<string, unknown>;
  },
) {
  return prisma.activityEvent.create({
    data: {
      memberId: input.memberId,
      type: input.type,
      sourceModule: input.sourceModule ?? "app",
      payload: (input.payload ?? undefined) as object | undefined,
    },
  });
}

export async function grantWelcomeRewards(
  prisma: PrismaClient,
  memberId: string,
  walletId: string,
) {
  const existing = await prisma.pointLedger.findFirst({
    where: { walletId, reason: "welcome_forest" },
  });
  if (existing) return existing;

  await prisma.rewardGrant.create({
    data: { memberId, kind: "welcome_badge", amount: 1 },
  });

  return prisma.pointLedger.create({
    data: {
      walletId,
      delta: 50,
      reason: "welcome_forest",
      taskSlug: "join_forest",
    },
  });
}
