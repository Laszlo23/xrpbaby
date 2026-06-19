import type { PrismaClient } from "@prisma/client";

import {
  buildCampaignPostText,
  SOCIAL_CAMPAIGN_MANIFEST,
  type SocialCampaignAsset,
  type SocialCampaignChannel,
} from "@/content/social-campaign/manifest";
import { voiceCheck } from "@/server/marketing/grove/copy";
import { getGroveTwitterClient } from "@/server/marketing/grove/x-client";
import { createNativeFeedItem } from "@/server/pulse/ingest";
import { getTwitterUserClient } from "@/server/x/twitter-client";
import { postMarketingTweet } from "@/server/x/post-marketing-tweet";

import {
  campaignPostExists,
  countCampaignPostsToday,
  inCampaignCooldown,
  socialCampaignAutoPostEnabled,
  socialCampaignCooldownMinutes,
  socialCampaignDailyCapGrove,
  socialCampaignDailyCapOfficial,
  socialCampaignPublicOrigin,
  socialCampaignPublishingPaused,
  socialCampaignSlackWebhookUrl,
} from "./env";

export type SocialCampaignTickResult = {
  ok: boolean;
  dryRun: boolean;
  autoPost: boolean;
  assetId?: string;
  account?: "official" | "grove";
  pillar?: string;
  channel?: SocialCampaignChannel;
  text?: string;
  imagePath?: string;
  imageUrl?: string;
  x?: { ok: boolean; url?: string; error?: string; skipped?: string };
  nativeFeedItemId?: string;
  slack?: string;
  postsTodayOfficial?: number;
  postsTodayGrove?: number;
  capReached?: boolean;
  cooldownActive?: boolean;
};

function trimForX(text: string): string {
  const t = text.trim();
  if (t.length <= 280) return t;
  return `${t.slice(0, 277)}…`;
}

async function resolvePrisma(prisma: PrismaClient | null): Promise<PrismaClient | null> {
  if (!prisma) return null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

function accountsForAsset(asset: SocialCampaignAsset): ("official" | "grove")[] {
  switch (asset.channel) {
    case "official":
      return ["official"];
    case "grove":
      return ["grove"];
    case "both":
      return ["official", "grove"];
    default: {
      const _exhaustive: never = asset.channel;
      return _exhaustive;
    }
  }
}

async function postSlack(text: string): Promise<string> {
  const hook = socialCampaignSlackWebhookUrl();
  if (!hook) return "skipped_no_webhook";
  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.ok ? "posted" : `http_${res.status}`;
  } catch (e) {
    return `error:${e instanceof Error ? e.message : String(e)}`;
  }
}

async function pickNextPost(
  prisma: PrismaClient | null,
): Promise<{ asset: SocialCampaignAsset; account: "official" | "grove" } | null> {
  for (const asset of SOCIAL_CAMPAIGN_MANIFEST.assets) {
    const accounts = accountsForAsset(asset);
    for (const account of accounts) {
      const posted = await campaignPostExists(prisma, asset.id, account);
      if (!posted) return { asset, account };
    }
  }
  return null;
}

export async function runSocialCampaignTick(
  prisma: PrismaClient | null,
  opts?: { dryRun?: boolean; assetId?: string; account?: "official" | "grove" },
): Promise<SocialCampaignTickResult> {
  const dryRun = opts?.dryRun ?? !socialCampaignAutoPostEnabled();
  const autoPost = socialCampaignAutoPostEnabled() && !dryRun;
  const origin = socialCampaignPublicOrigin();
  const db = await resolvePrisma(prisma);

  const postsTodayOfficial = await countCampaignPostsToday(db, "official");
  const postsTodayGrove = await countCampaignPostsToday(db, "grove");
  const capOfficial = socialCampaignDailyCapOfficial();
  const capGrove = socialCampaignDailyCapGrove();
  const cooldownMinutes = socialCampaignCooldownMinutes();

  const result: SocialCampaignTickResult = {
    ok: true,
    dryRun,
    autoPost,
    postsTodayOfficial,
    postsTodayGrove,
  };

  let pick: { asset: SocialCampaignAsset; account: "official" | "grove" } | null = null;

  if (opts?.assetId) {
    const asset = SOCIAL_CAMPAIGN_MANIFEST.assets.find((a) => a.id === opts.assetId);
    if (!asset) {
      result.ok = false;
      result.x = { ok: false, error: "asset_not_found" };
      return result;
    }
    const account =
      opts.account ??
      (asset.channel === "grove"
        ? "grove"
        : asset.channel === "official"
          ? "official"
          : "official");
    pick = { asset, account };
  } else {
    pick = await pickNextPost(db);
  }

  if (!pick) {
    result.ok = false;
    result.x = { ok: false, skipped: "all_assets_posted" };
    result.slack = await postSlack(
      "*[SocialCampaign]* all manifest assets posted for all channels.",
    );
    return result;
  }

  const { asset, account } = pick;
  const rawText = buildCampaignPostText(asset, account);
  const text = trimForX(rawText);
  const imagePath = asset.image;
  const imageUrl = `${origin}${imagePath}`;

  result.assetId = asset.id;
  result.account = account;
  result.pillar = asset.pillar;
  result.channel = asset.channel;
  result.text = text;
  result.imagePath = imagePath;
  result.imageUrl = imageUrl;

  const voice = voiceCheck(text, 280);
  if (!voice.ok) {
    result.ok = false;
    result.x = { ok: false, error: voice.reason };
    result.slack = await postSlack(`*[SocialCampaign]* voice check failed — ${voice.reason}`);
    return result;
  }

  if (socialCampaignPublishingPaused() && autoPost) {
    result.x = { ok: false, skipped: "publishing_paused" };
    result.slack = await postSlack("*[SocialCampaign]* publishing paused.");
    return result;
  }

  const alreadyPosted = await campaignPostExists(db, asset.id, account);
  if (alreadyPosted) {
    result.ok = false;
    result.x = { ok: false, skipped: "duplicate_asset_account" };
    return result;
  }

  const capReached =
    (account === "official" && postsTodayOfficial >= capOfficial) ||
    (account === "grove" && postsTodayGrove >= capGrove);
  result.capReached = capReached;

  const cooldownActive = await inCampaignCooldown(db, account, cooldownMinutes);
  result.cooldownActive = cooldownActive;

  if (capReached && autoPost) {
    result.x = { ok: false, skipped: "daily_cap_reached" };
    result.slack = await postSlack(
      `*[SocialCampaign]* daily cap reached (${account}: ${account === "official" ? postsTodayOfficial : postsTodayGrove}). Draft:\n\`\`\`${text.slice(0, 200)}\`\`\``,
    );
    return result;
  }

  if (cooldownActive && autoPost) {
    result.x = { ok: false, skipped: "cooldown_active" };
    result.slack = await postSlack(
      `*[SocialCampaign]* cooldown active (${cooldownMinutes}m) for ${account}.`,
    );
    return result;
  }

  if (autoPost) {
    const client = account === "grove" ? getGroveTwitterClient() : getTwitterUserClient();
    if (!client) {
      result.ok = false;
      result.x = { ok: false, error: "x_client_unconfigured" };
      return result;
    }

    const xRes = await postMarketingTweet(client, text, { imagePath });
    if (!xRes.ok) {
      result.ok = false;
      result.x = { ok: false, error: xRes.error };
    } else {
      result.x = { ok: true, url: xRes.url };
      if (db) {
        result.nativeFeedItemId = await createNativeFeedItem(db, {
          content: [text, "", imageUrl, xRes.url ? `X: ${xRes.url}` : ""]
            .filter(Boolean)
            .join("\n"),
          authorName: account === "official" ? "SocialCampaign:official" : "SocialCampaign:grove",
          permalink: xRes.url,
          externalId: `campaign-${asset.id}-${account}`,
        });
      }
    }
  } else {
    result.x = { ok: false, skipped: dryRun ? "dry_run" : "auto_post_disabled" };
  }

  result.slack = await postSlack(
    [
      `*[SocialCampaign]* tick — \`${asset.id}\` · ${account}${dryRun ? " (dry run)" : ""}`,
      `• Pillar: ${asset.pillar}`,
      `• Image: ${imageUrl}`,
      `• Posts today: official ${postsTodayOfficial}/${capOfficial}, grove ${postsTodayGrove}/${capGrove}`,
      result.x?.url
        ? `• X: ${result.x.url}`
        : result.x?.skipped
          ? `• Skipped: ${result.x.skipped}`
          : result.x?.error
            ? `• Error: ${result.x.error}`
            : "",
      "",
      "```",
      text,
      "```",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return result;
}
