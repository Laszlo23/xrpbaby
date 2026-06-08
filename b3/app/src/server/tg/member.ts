import type { PrismaClient, Member } from "@prisma/client";
import { createHash } from "node:crypto";
import type { TelegramInitUser } from "@/server/tg/init-data";

export function telegramDisplayName(user: TelegramInitUser): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (user.username?.trim()) return user.username.trim();
  return `tg_${user.id}`;
}

function syntheticWalletAddressForTelegram(userId: number): string {
  const digest = createHash("sha256").update(`tg:${userId}`).digest("hex").slice(0, 40);
  return `0x${digest}`;
}

async function linkSyntheticTelegramWallet(
  prisma: PrismaClient,
  member: Member,
  userId: number,
): Promise<Member> {
  if (member.walletId) return member;
  const syntheticAddress = syntheticWalletAddressForTelegram(userId);
  const wallet =
    (await prisma.wallet.findUnique({ where: { address: syntheticAddress } })) ??
    (await prisma.wallet.create({ data: { address: syntheticAddress } }));
  return prisma.member.update({
    where: { id: member.id },
    data: {
      walletId: wallet.id,
      walletAddress: syntheticAddress,
    },
  });
}

export async function ensureTelegramMember(
  prisma: PrismaClient,
  user: TelegramInitUser,
  _opts?: { allowSyntheticWallet?: boolean },
) {
  const externalId = String(user.id);
  const existingSocial = await prisma.socialAccount.findFirst({
    where: {
      platform: "telegram",
      externalId,
    },
    include: { member: true },
  });
  if (existingSocial?.member) {
    const displayName = telegramDisplayName(user);
    let member =
      existingSocial.member.displayName === displayName
        ? existingSocial.member
        : await prisma.member.update({
            where: { id: existingSocial.member.id },
            data: { displayName },
          });
    if (existingSocial.handle !== user.username) {
      await prisma.socialAccount.update({
        where: { id: existingSocial.id },
        data: { handle: user.username ?? undefined, verified: true },
      });
    }
    member = await linkSyntheticTelegramWallet(prisma, member, user.id);
    return member;
  }

  const syntheticAddress = syntheticWalletAddressForTelegram(user.id);
  const wallet =
    (await prisma.wallet.findUnique({ where: { address: syntheticAddress } })) ??
    (await prisma.wallet.create({ data: { address: syntheticAddress } }));

  const member = await prisma.member.create({
    data: {
      displayName: telegramDisplayName(user),
      supporterTier: "community",
      forestStage: "seedling",
      walletId: wallet.id,
      walletAddress: syntheticAddress,
    },
  });

  await prisma.socialAccount.create({
    data: {
      memberId: member.id,
      platform: "telegram",
      externalId,
      handle: user.username ?? undefined,
      verified: true,
      source: "telegram",
    },
  });

  return member;
}

export async function getCulturePoints(
  prisma: PrismaClient,
  walletId?: string | null,
): Promise<number> {
  if (!walletId) return 0;
  const agg = await prisma.pointLedger.aggregate({
    where: { walletId },
    _sum: { delta: true },
  });
  return agg._sum.delta ?? 0;
}

export function progressionFromPoints(points: number): {
  level: number;
  xp: number;
  nextLevelXp: number;
} {
  const safe = Math.max(0, points);
  const bucket = 100;
  const level = Math.floor(safe / bucket) + 1;
  return {
    level,
    xp: safe,
    nextLevelXp: level * bucket,
  };
}
