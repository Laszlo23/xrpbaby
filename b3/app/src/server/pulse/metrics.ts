import type { PrismaClient } from "@prisma/client";

import { digestHex } from "./digest";

/** Latest stored snapshot or live counts when ingest has not run yet. */
export async function getPulseMetrics(prisma: PrismaClient) {
  const stored = await prisma.growthSnapshot.findFirst({
    orderBy: { capturedAt: "desc" },
  });
  if (stored) {
    return {
      capturedAt: stored.capturedAt,
      memberCount: stored.memberCount,
      waitlistCount: stored.waitlistCount,
      culturePoints: stored.culturePoints,
      activity24h: stored.activity24h,
      farcasterItems: stored.farcasterItems,
      xItems: stored.xItems,
      facebookItems: stored.facebookItems,
      tiktokItems: stored.tiktokItems,
      instagramItems: stored.instagramItems,
      nativeComments: stored.nativeComments,
      digest: stored.digest,
      live: false,
    };
  }

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [
    memberCount,
    waitlistCount,
    cultureAgg,
    activity24h,
    farcasterItems,
    xItems,
    facebookItems,
    tiktokItems,
    instagramItems,
    nativeComments,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.waitlistEntry.count(),
    prisma.pointLedger.aggregate({ _sum: { delta: true } }),
    prisma.activityEvent.count({ where: { createdAt: { gte: since24h } } }),
    prisma.socialFeedItem.count({ where: { platform: "farcaster" } }),
    prisma.socialFeedItem.count({ where: { platform: "x" } }),
    prisma.socialFeedItem.count({ where: { platform: "facebook" } }),
    prisma.socialFeedItem.count({ where: { platform: "tiktok" } }),
    prisma.socialFeedItem.count({ where: { platform: "instagram" } }),
    prisma.socialComment.count(),
  ]);

  const payload = {
    memberCount,
    waitlistCount,
    culturePoints: cultureAgg._sum.delta ?? 0,
    activity24h,
    farcasterItems,
    xItems,
    facebookItems,
    tiktokItems,
    instagramItems,
    nativeComments,
    capturedAt: new Date().toISOString(),
  };

  return {
    ...payload,
    capturedAt: new Date(),
    digest: digestHex(payload),
    live: true,
  };
}
