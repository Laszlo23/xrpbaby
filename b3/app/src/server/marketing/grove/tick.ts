import type { PrismaClient } from "@prisma/client";

import { createNativeFeedItem } from "@/server/pulse/ingest";
import { postMarketingTweet } from "@/server/x/post-marketing-tweet";

import { buildGroveBrief, type GroveBrief } from "./brief";
import {
  attestationPostCopy,
  generateGroveCopy,
  generateGroveCopyForPillar,
  refineGroveCopyWithLlm,
  selectOutcomeDrivenPillar,
  voiceCheck,
  type GroveCopy,
  type GroveCopyPillar,
} from "./copy";
import {
  groveAgentRef,
  groveAutoPostEnabled,
  groveDailyPostCap,
  groveFarcasterEnabled,
  grovePostCooldownMinutes,
  grovePublishingPaused,
  grovePublicOrigin,
  groveSlackWebhookUrl,
  groveTelegramEnabled,
  groveXEnabled,
} from "./env";
import { postGroveFarcasterCast, groveFarcasterConfigured } from "./farcaster-post";
import { getGroveTwitterClient, groveUsesOfficialXFallback, groveXConfigured } from "./x-client";
import { groveTelegramConfigured, postGroveTelegramMessage } from "./telegram-post";

export type GroveTickResult = {
  ok: boolean;
  dryRun: boolean;
  autoPost: boolean;
  pillar: string;
  brief: GroveBrief;
  copy: GroveCopy;
  x?: { ok: boolean; url?: string; error?: string; skipped?: string };
  farcaster?: { ok: boolean; url?: string; error?: string; skipped?: string };
  telegram?: { ok: boolean; url?: string; error?: string; skipped?: string };
  nativeFeedItemId?: string;
  slack?: string;
  postsToday?: number;
  capReached?: boolean;
  fingerprint?: string;
  cooldownActive?: boolean;
};

async function countPostsToday(prisma: PrismaClient | null): Promise<number> {
  if (!prisma) return 0;
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return prisma.socialFeedItem.count({
    where: {
      platform: "native",
      authorName: "Grove",
      publishedAt: { gte: start },
    },
  });
}

async function postSlack(text: string): Promise<string> {
  const hook = groveSlackWebhookUrl();
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

function trimForX(text: string): string {
  const t = text.trim();
  if (t.length <= 280) return t;
  return `${t.slice(0, 277)}…`;
}

async function withRetry<T>(
  task: () => Promise<T>,
  retries: number,
  backoffMs = 1500,
): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  let lastError: string | null = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const value = await task();
      return { ok: true, value };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs * (attempt + 1)));
      }
    }
  }
  return { ok: false, error: lastError || "unknown_error" };
}

function simpleFingerprint(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash >>> 0).toString(16);
}

async function recentGrovePostExists(
  prisma: PrismaClient | null,
  fingerprint: string,
): Promise<boolean> {
  if (!prisma) return false;
  const existing = await prisma.socialFeedItem.findFirst({
    where: {
      platform: "native",
      externalId: `grove-${fingerprint}`,
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function inCooldownWindow(
  prisma: PrismaClient | null,
  cooldownMinutes: number,
): Promise<boolean> {
  if (!prisma || cooldownMinutes <= 0) return false;
  const since = new Date(Date.now() - cooldownMinutes * 60 * 1000);
  const latest = await prisma.socialFeedItem.findFirst({
    where: {
      platform: "native",
      authorName: "Grove",
      publishedAt: { gte: since },
    },
    orderBy: { publishedAt: "desc" },
    select: { id: true },
  });
  return Boolean(latest);
}

export async function runGroveTick(
  prisma: PrismaClient | null,
  opts?: {
    dryRun?: boolean;
    pillar?: GroveCopyPillar | string;
    attestationTxHash?: string | null;
  },
): Promise<GroveTickResult> {
  const dryRun = opts?.dryRun ?? !groveAutoPostEnabled();
  const autoPost = groveAutoPostEnabled() && !dryRun;
  const origin = grovePublicOrigin();
  const agentRef = groveAgentRef();

  const brief = await buildGroveBrief(prisma, { agentRef, origin });

  let rewardScore7d: number | null = null;
  if (prisma) {
    try {
      const outcomes = await prisma.agentOutcome.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { rewardScore: true },
      });
      const scores = outcomes
        .map((o) => o.rewardScore)
        .filter((s): s is number => s != null && Number.isFinite(s));
      if (scores.length > 0) {
        rewardScore7d = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    } catch {
      /* AgentOutcome table may not exist yet */
    }
  }

  const pillarFromOutcome =
    !opts?.pillar && opts?.pillar !== "attestation"
      ? selectOutcomeDrivenPillar(rewardScore7d)
      : undefined;

  const baseCopy =
    opts?.pillar === "attestation" || opts?.attestationTxHash
      ? attestationPostCopy(brief, opts?.attestationTxHash)
      : opts?.pillar
        ? generateGroveCopyForPillar(brief, opts.pillar)
        : pillarFromOutcome
          ? generateGroveCopyForPillar(brief, pillarFromOutcome)
          : generateGroveCopy(brief);

  const copy = await refineGroveCopyWithLlm(brief, baseCopy);

  const xCheck = voiceCheck(copy.x, 320);
  const fcCheck = voiceCheck(copy.farcaster, 1024);
  const tgCheck = voiceCheck(copy.telegram, 4000);

  const postsToday = await countPostsToday(prisma);
  const cap = groveDailyPostCap();
  const capReached = postsToday >= cap;

  const result: GroveTickResult = {
    ok: true,
    dryRun,
    autoPost,
    pillar: copy.pillar,
    brief,
    copy,
    postsToday,
    capReached,
  };

  const fingerprint = `${brief.dayId}-${copy.pillar}-${simpleFingerprint(copy.x)}`;
  result.fingerprint = fingerprint;

  if (!xCheck.ok || !fcCheck.ok || !tgCheck.ok) {
    result.ok = false;
    const errReason = !xCheck.ok
      ? xCheck.reason
      : !fcCheck.ok
        ? fcCheck.reason
        : !tgCheck.ok
          ? tgCheck.reason
          : "voice_check_failed";
    result.x = { ok: false, error: errReason };
    result.farcaster = { ok: false, error: errReason };
    result.telegram = { ok: false, error: errReason };
    result.slack = await postSlack(
      `*[Grove]* voice check failed — ${errReason}\n\`\`\`${copy.x.slice(0, 200)}\`\`\``,
    );
    return result;
  }

  if (grovePublishingPaused() && autoPost) {
    result.x = { ok: false, skipped: "publishing_paused" };
    result.farcaster = { ok: false, skipped: "publishing_paused" };
    result.telegram = { ok: false, skipped: "publishing_paused" };
    result.slack = await postSlack("*[Grove]* publishing paused by kill switch.");
    return result;
  }

  if (await recentGrovePostExists(prisma, fingerprint)) {
    result.ok = false;
    result.x = { ok: false, skipped: "duplicate_fingerprint" };
    result.farcaster = { ok: false, skipped: "duplicate_fingerprint" };
    result.telegram = { ok: false, skipped: "duplicate_fingerprint" };
    result.slack = await postSlack(`*[Grove]* duplicate prevented (${fingerprint}).`);
    return result;
  }

  const cooldownMinutes = grovePostCooldownMinutes();
  const cooldownActive = await inCooldownWindow(prisma, cooldownMinutes);
  result.cooldownActive = cooldownActive;
  if (cooldownActive && autoPost) {
    result.ok = false;
    result.x = { ok: false, skipped: "cooldown_active" };
    result.farcaster = { ok: false, skipped: "cooldown_active" };
    result.telegram = { ok: false, skipped: "cooldown_active" };
    result.slack = await postSlack(
      `*[Grove]* cooldown active (${cooldownMinutes}m). Skipping publish for ${copy.pillar}.`,
    );
    return result;
  }

  if (capReached && autoPost) {
    result.x = { ok: false, skipped: "daily_cap_reached" };
    result.farcaster = { ok: false, skipped: "daily_cap_reached" };
    result.telegram = { ok: false, skipped: "daily_cap_reached" };
    result.slack = await postSlack(
      `*[Grove]* daily cap reached (${postsToday}/${cap}). Draft:\n${copy.x.slice(0, 240)}`,
    );
    return result;
  }

  const xText = trimForX(groveUsesOfficialXFallback() ? `[Grove 🌲] ${copy.x}` : copy.x);

  if (autoPost) {
    const xEnabled = groveXEnabled();
    const farcasterEnabled = groveFarcasterEnabled();
    const telegramEnabled = groveTelegramEnabled();

    const client = xEnabled ? getGroveTwitterClient() : null;
    if (!xEnabled) {
      result.x = { ok: false, skipped: "x_disabled" };
    } else if (!client) {
      result.x = { ok: false, error: "x_client_unconfigured" };
    } else {
      const xRetry = await withRetry(() => postMarketingTweet(client, xText), 2);
      if (!xRetry.ok) {
        result.x = { ok: false, error: xRetry.error };
        result.ok = false;
      } else {
        const xRes = xRetry.value;
        if (xRes.ok) {
          result.x = { ok: true, url: xRes.url };
        } else {
          result.x = { ok: false, error: xRes.error };
          result.ok = false;
        }
      }
    }

    if (!farcasterEnabled) {
      result.farcaster = { ok: false, skipped: "farcaster_disabled" };
    } else if (groveFarcasterConfigured()) {
      const fcRetry = await withRetry(() => postGroveFarcasterCast(copy.farcaster), 2);
      if (!fcRetry.ok) {
        result.farcaster = { ok: false, error: fcRetry.error };
      } else if (fcRetry.value.ok) {
        result.farcaster = { ok: true, url: fcRetry.value.url };
      } else {
        result.farcaster = { ok: false, error: fcRetry.value.error };
      }
    } else {
      result.farcaster = { ok: false, skipped: "farcaster_not_configured" };
    }

    if (!telegramEnabled) {
      result.telegram = { ok: false, skipped: "telegram_disabled" };
    } else if (groveTelegramConfigured()) {
      const tgRetry = await withRetry(() => postGroveTelegramMessage(copy.telegram), 2);
      if (!tgRetry.ok) {
        result.telegram = { ok: false, error: tgRetry.error };
      } else if (tgRetry.value.ok) {
        result.telegram = { ok: true, url: `telegram:message:${tgRetry.value.messageId}` };
      } else {
        result.telegram = { ok: false, error: tgRetry.value.error };
      }
    } else {
      result.telegram = { ok: false, skipped: "telegram_not_configured" };
    }

    if (prisma && (result.x?.ok || result.farcaster?.ok || result.telegram?.ok)) {
      const lines = [
        copy.x,
        "",
        copy.telegram,
        result.x?.url ? `X: ${result.x.url}` : null,
        result.farcaster?.url ? `FC: ${result.farcaster.url}` : null,
        result.telegram?.url ? `TG: ${result.telegram.url}` : null,
      ].filter(Boolean);
      result.nativeFeedItemId = await createNativeFeedItem(prisma, {
        content: lines.join("\n\n"),
        authorName: "Grove",
        permalink: result.x?.url ?? result.farcaster?.url,
        externalId: `grove-${fingerprint}`,
      });
    }
  } else {
    result.x = { ok: false, skipped: dryRun ? "dry_run" : "auto_post_disabled" };
    result.farcaster = { ok: false, skipped: dryRun ? "dry_run" : "auto_post_disabled" };
    result.telegram = { ok: false, skipped: dryRun ? "dry_run" : "auto_post_disabled" };
  }

  const slackLines = [
    `*[Grove]* tick — pillar \`${copy.pillar}\`${dryRun ? " (dry run)" : ""}`,
    groveUsesOfficialXFallback() ? "_Using official X keys until GROVE_X_* is set._" : "",
    `• X configured: ${groveXConfigured()}`,
    `• FC configured: ${groveFarcasterConfigured()}`,
    `• TG configured: ${groveTelegramConfigured()}`,
    `• Posts today: ${postsToday}/${cap}`,
    `• Cooldown: ${cooldownMinutes}m${cooldownActive ? " (active)" : ""}`,
    `• Fingerprint: ${fingerprint}`,
    result.x?.url ? `• X: ${result.x.url}` : result.x?.error ? `• X err: ${result.x.error}` : "",
    result.farcaster?.url
      ? `• FC: ${result.farcaster.url}`
      : result.farcaster?.skipped
        ? `• FC: ${result.farcaster.skipped}`
        : result.farcaster?.error
          ? `• FC err: ${result.farcaster.error}`
          : "",
    result.telegram?.url
      ? `• TG: ${result.telegram.url}`
      : result.telegram?.skipped
        ? `• TG: ${result.telegram.skipped}`
        : result.telegram?.error
          ? `• TG err: ${result.telegram.error}`
          : "",
    "",
    "```",
    xText.slice(0, 280),
    "```",
  ].filter(Boolean);

  result.slack = await postSlack(slackLines.join("\n"));
  return result;
}
