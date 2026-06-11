import type { PrismaClient } from "@prisma/client";

export function socialCampaignAdminSecret(): string | undefined {
  return (
    process.env.SOCIAL_CAMPAIGN_ADMIN_SECRET?.trim() ||
    process.env.X_MARKETING_ADMIN_SECRET?.trim()
  );
}

export function socialCampaignAutoPostEnabled(): boolean {
  const v = process.env.SOCIAL_CAMPAIGN_AUTO_POST?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function socialCampaignPublishingPaused(): boolean {
  const v = process.env.SOCIAL_CAMPAIGN_PUBLISHING_PAUSED?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || process.env.AGENTS_PAUSED === "1";
}

export function socialCampaignPublicOrigin(): string {
  return (
    process.env.SOCIAL_CAMPAIGN_PUBLIC_ORIGIN?.trim() ||
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    process.env.VITE_APP_ORIGIN?.trim() ||
    "https://app.buildingcultureid.space"
  ).replace(/\/$/, "");
}

export function socialCampaignSlackWebhookUrl(): string | undefined {
  return (
    process.env.SOCIAL_CAMPAIGN_SLACK_WEBHOOK_URL?.trim() ||
    process.env.GROVE_SLACK_WEBHOOK_URL?.trim() ||
    process.env.SLACK_WEBHOOK_URL?.trim()
  );
}

export function socialCampaignDailyCapOfficial(): number {
  const n = Number(process.env.SOCIAL_CAMPAIGN_DAILY_CAP_OFFICIAL ?? "1");
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10) : 1;
}

export function socialCampaignDailyCapGrove(): number {
  const n = Number(process.env.SOCIAL_CAMPAIGN_DAILY_CAP_GROVE ?? "1");
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10) : 1;
}

export function socialCampaignCooldownMinutes(): number {
  const n = Number(process.env.SOCIAL_CAMPAIGN_COOLDOWN_MINUTES ?? "240");
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 24 * 60) : 240;
}

export async function countCampaignPostsToday(
  prisma: PrismaClient | null,
  account: "official" | "grove",
): Promise<number> {
  if (!prisma) return 0;
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const authorName = account === "official" ? "SocialCampaign:official" : "SocialCampaign:grove";
  return prisma.socialFeedItem.count({
    where: {
      platform: "native",
      authorName,
      publishedAt: { gte: start },
    },
  });
}

export async function campaignPostExists(
  prisma: PrismaClient | null,
  assetId: string,
  account: "official" | "grove",
): Promise<boolean> {
  if (!prisma) return false;
  const existing = await prisma.socialFeedItem.findFirst({
    where: {
      platform: "native",
      externalId: `campaign-${assetId}-${account}`,
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function inCampaignCooldown(
  prisma: PrismaClient | null,
  account: "official" | "grove",
  cooldownMinutes: number,
): Promise<boolean> {
  if (!prisma || cooldownMinutes <= 0) return false;
  const since = new Date(Date.now() - cooldownMinutes * 60 * 1000);
  const authorName = account === "official" ? "SocialCampaign:official" : "SocialCampaign:grove";
  const latest = await prisma.socialFeedItem.findFirst({
    where: {
      platform: "native",
      authorName,
      publishedAt: { gte: since },
    },
    orderBy: { publishedAt: "desc" },
    select: { id: true },
  });
  return Boolean(latest);
}
