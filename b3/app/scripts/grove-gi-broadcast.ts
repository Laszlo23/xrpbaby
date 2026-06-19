#!/usr/bin/env tsx
/**
 * One-shot Grove broadcast for Growth Intelligence ship post.
 * Bypasses DB dedup — use once per milestone.
 *
 *   npm run grove:gi:broadcast
 *   npm run grove:gi:broadcast -- --dry-run
 */
import { loadAppEnv } from "./load-env";

loadAppEnv();

import { buildGroveBrief } from "../src/server/marketing/grove/brief";
import { generateGroveCopyForPillar, voiceCheck } from "../src/server/marketing/grove/copy";
import {
  postGroveFarcasterCast,
  groveFarcasterConfigured,
} from "../src/server/marketing/grove/farcaster-post";
import {
  groveXConfigured,
  getGroveTwitterClient,
  groveUsesOfficialXFallback,
} from "../src/server/marketing/grove/x-client";
import {
  postGroveTelegramMessage,
  groveTelegramConfigured,
} from "../src/server/marketing/grove/telegram-post";
import { postMarketingTweet } from "../src/server/x/post-marketing-tweet";

const dryRun = process.argv.includes("--dry-run");

function trimForX(text: string): string {
  const t = text.trim();
  return t.length <= 280 ? t : `${t.slice(0, 277)}…`;
}

async function main() {
  const brief = await buildGroveBrief(null);
  const copy = generateGroveCopyForPillar(brief, "growth_intelligence");

  console.log("--- X ---\n", copy.x, "\n");
  console.log("--- Farcaster ---\n", copy.farcaster, "\n");
  console.log("--- Telegram ---\n", copy.telegram, "\n");

  const xCheck = voiceCheck(copy.x, 320);
  const fcCheck = voiceCheck(copy.farcaster, 1024);
  const tgCheck = voiceCheck(copy.telegram, 4000);
  if (!xCheck.ok || !fcCheck.ok || !tgCheck.ok) {
    console.error("Voice check failed", { xCheck, fcCheck, tgCheck });
    process.exit(1);
  }

  if (dryRun) {
    console.log(JSON.stringify({ ok: true, dryRun: true, pillar: copy.pillar }, null, 2));
    return;
  }

  const results: Record<string, unknown> = { pillar: copy.pillar };

  if (groveXConfigured()) {
    const client = getGroveTwitterClient();
    const xText = trimForX(groveUsesOfficialXFallback() ? `[Grove 🌲] ${copy.x}` : copy.x);
    const xRes = client
      ? await postMarketingTweet(client, xText)
      : { ok: false, error: "no_client" };
    results.x = xRes;
  } else {
    results.x = { skipped: "not_configured" };
  }

  if (groveTelegramConfigured()) {
    results.telegram = await postGroveTelegramMessage(copy.telegram);
  } else {
    results.telegram = { skipped: "not_configured" };
  }

  if (groveFarcasterConfigured()) {
    results.farcaster = await postGroveFarcasterCast(copy.farcaster);
  } else {
    results.farcaster = { skipped: "not_configured" };
  }

  console.log(JSON.stringify({ ok: true, ...results }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
