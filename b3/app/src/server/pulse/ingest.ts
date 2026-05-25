import type { PrismaClient } from "@prisma/client";

import { FacebookPulseAdapter } from "./adapters/facebook";
import { FarcasterPulseAdapter } from "./adapters/farcaster";
import { InstagramPulseAdapter } from "./adapters/instagram";
import { TikTokPulseAdapter } from "./adapters/tiktok";
import { XPulseAdapter } from "./adapters/x";
import { digestHex } from "./digest";
import type { IngestItem, PulseIngestAdapter } from "./types";

const DEFAULT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

export function allAdapters(): PulseIngestAdapter[] {
  return [
    new FarcasterPulseAdapter(),
    new XPulseAdapter(),
    new FacebookPulseAdapter(),
    new TikTokPulseAdapter(),
    new InstagramPulseAdapter(),
  ];
}

export async function upsertFeedItems(
  prisma: PrismaClient,
  items: IngestItem[],
): Promise<number> {
  let n = 0;
  for (const item of items) {
    await prisma.socialFeedItem.upsert({
      where: {
        platform_externalId: {
          platform: item.platform,
          externalId: item.externalId,
        },
      },
      create: {
        platform: item.platform,
        externalId: item.externalId,
        authorHandle: item.authorHandle,
        authorName: item.authorName,
        content: item.content,
        mediaUrls: item.mediaUrls ?? undefined,
        permalink: item.permalink,
        metrics: item.metrics ?? undefined,
        publishedAt: item.publishedAt,
        featured: item.featured ?? false,
      },
      update: {
        authorHandle: item.authorHandle,
        authorName: item.authorName,
        content: item.content,
        mediaUrls: item.mediaUrls ?? undefined,
        permalink: item.permalink,
        metrics: item.metrics ?? undefined,
        publishedAt: item.publishedAt,
      },
    });
    n += 1;
  }
  return n;
}

export async function createNativeFeedItem(
  prisma: PrismaClient,
  input: {
    content: string;
    permalink?: string;
    authorName?: string;
    externalId?: string;
  },
): Promise<string> {
  const externalId = input.externalId ?? `native-${Date.now()}`;
  const row = await prisma.socialFeedItem.upsert({
    where: { platform_externalId: { platform: "native", externalId } },
    create: {
      platform: "native",
      externalId,
      authorName: input.authorName ?? "Building Culture",
      content: input.content,
      permalink: input.permalink,
      publishedAt: new Date(),
    },
    update: {
      content: input.content,
      permalink: input.permalink,
    },
  });
  return row.id;
}

export async function runPulseIngest(
  prisma: PrismaClient,
  opts?: { since?: Date },
): Promise<{ ingested: number; adapters: Record<string, number> }> {
  const since = opts?.since ?? new Date(Date.now() - DEFAULT_LOOKBACK_MS);
  const counts: Record<string, number> = {};
  let ingested = 0;

  for (const adapter of allAdapters()) {
    if (!adapter.isEnabled()) {
      counts[adapter.platform] = 0;
      continue;
    }
    const items = await adapter.ingest(since);
    const n = await upsertFeedItems(prisma, items);
    counts[adapter.platform] = n;
    ingested += n;
  }

  await captureGrowthSnapshot(prisma);
  return { ingested, adapters: counts };
}

export async function captureGrowthSnapshot(prisma: PrismaClient): Promise<void> {
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

  const metrics = {
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

  await prisma.growthSnapshot.create({
    data: {
      ...metrics,
      digest: digestHex(metrics),
    },
  });
}

export async function buildDailyDigestPayload(
  prisma: PrismaClient,
  dayId: string,
): Promise<Record<string, unknown>> {
  const latest = await prisma.growthSnapshot.findFirst({
    orderBy: { capturedAt: "desc" },
  });
  const topItems = await prisma.socialFeedItem.findMany({
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: { id: true, platform: true, externalId: true, publishedAt: true },
  });
  return {
    dayId,
    snapshot: latest,
    topItemHashes: topItems.map(
      (i: { platform: string; externalId: string | null; id: string }) =>
        `${i.platform}:${i.externalId ?? i.id}`,
    ),
    generatedAt: new Date().toISOString(),
  };
}
