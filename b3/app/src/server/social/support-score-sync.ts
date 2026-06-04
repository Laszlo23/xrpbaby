import type { PrismaClient } from "@prisma/client";
import {
  computeSupportScore,
  extractNeynarScore,
  neynarVerifiedAccounts,
  parseVerifiedAccounts,
  type ParsedVerifiedSocial,
} from "@bc/support-score";

import { fetchNeynarUserByFid } from "@/server/neynar/client";
import { resolveFarcasterFidForAddress } from "@/server/neynar/farcaster-social-verify";

const SOCIAL_QUEST_SLUGS = [
  "follow-farcaster",
  "like-cast-farcaster",
  "share-app-farcaster",
  "x-reply-official",
  "x-retweet-official",
  "x-quote-official",
  "telegram-join-buildingculture",
] as const;

export type MemberSocialSnapshot = {
  farcasterFid: number | null;
  farcasterUsername: string | null;
  neynarScore: number | null;
  supportScore: number;
  verifiedSocials: ParsedVerifiedSocial[];
  socialAccounts: Array<{
    platform: string;
    handle: string | null;
    verified: boolean;
    source: string;
  }>;
};

export async function countCompletedSocialQuests(
  prisma: PrismaClient,
  walletId: string,
): Promise<number> {
  const rows = await prisma.pointLedger.findMany({
    where: {
      walletId,
      reason: "task_completion",
      taskSlug: { in: [...SOCIAL_QUEST_SLUGS] },
    },
    select: { taskSlug: true },
  });
  return new Set(rows.map((r) => r.taskSlug).filter(Boolean)).size;
}

export async function syncMemberSupportScore(
  prisma: PrismaClient,
  memberId: string,
): Promise<MemberSocialSnapshot | null> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { wallet: true, socialAccounts: true },
  });
  if (!member) return null;

  let fid = member.farcasterFid;
  if (fid == null && member.walletAddress) {
    const client = await import("@/server/neynar/client").then((m) => m.getNeynarClient());
    if (client) {
      const resolved = await resolveFarcasterFidForAddress(
        client,
        member.walletAddress as `0x${string}`,
      );
      if (resolved) fid = resolved;
    }
  }

  let neynarScore: number | null = member.neynarScore;
  let farcasterUsername = member.farcasterUsername;
  let verifiedAccounts = neynarVerifiedAccounts({});

  if (fid != null) {
    const user = await fetchNeynarUserByFid(fid);
    if (user) {
      neynarScore = extractNeynarScore(user);
      farcasterUsername = String(user.username ?? farcasterUsername ?? "");
      verifiedAccounts = neynarVerifiedAccounts(user);
    }
  }

  const culturePoints =
    member.wallet != null
      ? ((
          await prisma.pointLedger.aggregate({
            where: { walletId: member.wallet.id },
            _sum: { delta: true },
          })
        )._sum.delta ?? 0)
      : 0;

  const completedSocialQuests =
    member.wallet != null ? await countCompletedSocialQuests(prisma, member.wallet.id) : 0;

  const isFounding = member.supporterTier === "founding" || member.supporterTier === "elder";

  const supportScore = computeSupportScore({
    neynarScore,
    verifiedAccounts,
    culturePoints,
    isFounding,
    completedSocialQuests,
  });

  const verifiedSocials = parseVerifiedAccounts(verifiedAccounts);

  const supportScoreMeta = {
    neynarScore,
    verifiedSocials,
    culturePoints,
    completedSocialQuests,
    syncedAt: new Date().toISOString(),
  };

  await prisma.member.update({
    where: { id: memberId },
    data: {
      farcasterFid: fid ?? undefined,
      farcasterUsername: farcasterUsername ?? undefined,
      neynarScore,
      supportScore,
      supportScoreMeta: supportScoreMeta as object,
      socialSyncedAt: new Date(),
    },
  });

  const upserts: Array<{ platform: string; handle: string; source: string }> = [];
  if (fid != null && farcasterUsername) {
    upserts.push({ platform: "farcaster", handle: farcasterUsername, source: "neynar" });
  }
  for (const v of verifiedSocials) {
    upserts.push({ platform: v.platform, handle: v.handle, source: "neynar" });
  }

  for (const row of upserts) {
    await prisma.socialAccount.upsert({
      where: { memberId_platform: { memberId, platform: row.platform } },
      create: {
        memberId,
        platform: row.platform,
        handle: row.handle,
        externalId: row.platform === "farcaster" && fid != null ? String(fid) : undefined,
        verified: true,
        source: row.source,
      },
      update: {
        handle: row.handle,
        verified: true,
        source: row.source,
        ...(row.platform === "farcaster" && fid != null ? { externalId: String(fid) } : {}),
      },
    });
  }

  const socialAccounts = await prisma.socialAccount.findMany({
    where: { memberId },
    select: { platform: true, handle: true, verified: true, source: true },
  });

  return {
    farcasterFid: fid,
    farcasterUsername,
    neynarScore,
    supportScore,
    verifiedSocials,
    socialAccounts,
  };
}

export function memberToSocialPayload(member: {
  farcasterFid: number | null;
  farcasterUsername: string | null;
  neynarScore: number | null;
  supportScore: number | null;
  supportScoreMeta: unknown;
  socialAccounts?: Array<{
    platform: string;
    handle: string | null;
    verified: boolean;
    source: string;
  }>;
}) {
  const meta = member.supportScoreMeta as { verifiedSocials?: ParsedVerifiedSocial[] } | null;
  return {
    farcaster: member.farcasterFid
      ? {
          fid: member.farcasterFid,
          username: member.farcasterUsername,
        }
      : null,
    neynarScore: member.neynarScore,
    supportScore: member.supportScore ?? 0,
    verifiedSocials: meta?.verifiedSocials ?? [],
    socialAccounts: member.socialAccounts ?? [],
  };
}
