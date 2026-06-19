import { createRequire } from "node:module";
import type { Prisma, PrismaClient } from "@prisma/client";

const require = createRequire(import.meta.url);

export async function ensureWalletAndMember(
  prisma: PrismaClient | Prisma.TransactionClient,
  address: string,
  opts?: {
    intent?: string;
    email?: string;
    privyUserId?: string;
    farcasterFid?: number;
    farcasterUsername?: string;
  },
) {
  const normalized = address.toLowerCase();
  let wallet = await prisma.wallet.findUnique({ where: { address: normalized } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { address: normalized } });
  }

  let member = await prisma.member.findFirst({
    where: {
      OR: [
        { walletId: wallet.id },
        { walletAddress: normalized },
        ...(opts?.privyUserId ? [{ privyUserId: opts.privyUserId }] : []),
      ],
    },
  });

  if (!member) {
    member = await prisma.member.create({
      data: {
        walletAddress: normalized,
        walletId: wallet.id,
        privyUserId: opts?.privyUserId,
        intent: opts?.intent,
        email: opts?.email,
        farcasterFid: opts?.farcasterFid,
        farcasterUsername: opts?.farcasterUsername,
        supporterTier: "community",
        forestStage: "seedling",
      },
    });
  } else {
    const updates: {
      intent?: string;
      privyUserId?: string;
      walletId?: string;
      walletAddress?: string;
      farcasterFid?: number;
      farcasterUsername?: string;
    } = {};
    if (opts?.intent && !member.intent) updates.intent = opts.intent;
    if (opts?.privyUserId && member.privyUserId !== opts.privyUserId) {
      updates.privyUserId = opts.privyUserId;
    }
    if (opts?.farcasterFid && member.farcasterFid !== opts.farcasterFid) {
      updates.farcasterFid = opts.farcasterFid;
    }
    if (opts?.farcasterUsername && member.farcasterUsername !== opts.farcasterUsername) {
      updates.farcasterUsername = opts.farcasterUsername;
    }
    if (!member.walletId) updates.walletId = wallet.id;
    if (!member.walletAddress) updates.walletAddress = normalized;
    if (Object.keys(updates).length > 0) {
      member = await prisma.member.update({
        where: { id: member.id },
        data: updates,
      });
    }
  }

  return { wallet, member };
}

export async function linkFarcasterToMember(
  prisma: PrismaClient,
  walletAddress: string,
  fid: number,
  username?: string | null,
) {
  const normalized = walletAddress.toLowerCase();
  const { member } = await ensureWalletAndMember(prisma, normalized);

  const fidTaken = await prisma.member.findFirst({
    where: { farcasterFid: fid, id: { not: member.id } },
  });
  if (fidTaken) {
    throw new Error("farcaster_fid_taken");
  }

  const updated = await prisma.member.update({
    where: { id: member.id },
    data: {
      farcasterFid: fid,
      farcasterUsername: username ?? undefined,
      walletAddress: normalized,
    },
  });

  await prisma.socialAccount.upsert({
    where: { memberId_platform: { memberId: member.id, platform: "farcaster" } },
    create: {
      memberId: member.id,
      platform: "farcaster",
      handle: username ?? String(fid),
      externalId: String(fid),
      verified: true,
      source: "neynar",
    },
    update: {
      handle: username ?? String(fid),
      externalId: String(fid),
      verified: true,
    },
  });

  return updated;
}

export async function unlinkFarcasterFromMember(prisma: PrismaClient, memberId: string) {
  await prisma.socialAccount.deleteMany({
    where: { memberId, platform: "farcaster" },
  });
  return prisma.member.update({
    where: { id: memberId },
    data: {
      farcasterFid: null,
      farcasterUsername: null,
      neynarScore: null,
      supportScore: null,
      supportScoreMeta: (require("@prisma/client") as typeof import("@prisma/client")).Prisma
        .DbNull,
      socialSyncedAt: null,
    },
  });
}

export async function logActivity(
  prisma: PrismaClient | Prisma.TransactionClient,
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

  const ledger = await prisma.pointLedger.create({
    data: {
      walletId,
      delta: 50,
      reason: "welcome_forest",
      taskSlug: "join-forest",
    },
  });

  await logActivity(prisma, {
    memberId,
    type: "task_completion:join-forest",
    sourceModule: "onboarding",
    payload: { taskSlug: "join-forest", points: 50 },
  });

  return ledger;
}
