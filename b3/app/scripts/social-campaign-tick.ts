#!/usr/bin/env tsx
/**
 * Run social campaign tick locally (cron / VPS — no HTTP required).
 *
 *   cd app && npm run social-campaign:tick
 *   SOCIAL_CAMPAIGN_AUTO_POST=1 npm run social-campaign:tick
 *   npm run social-campaign:tick -- --dry-run
 *   npm run social-campaign:tick -- --asset building-culture-hero --account official
 */
import { loadAppEnv } from "./load-env";

loadAppEnv();

import { getPrisma } from "../src/server/db/prisma";
import { runSocialCampaignTick } from "../src/server/marketing/social-campaign/tick";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

const dryRunFlag = process.argv.includes("--dry-run");
const assetId = arg("--asset");
const accountRaw = arg("--account");
const account = accountRaw === "official" || accountRaw === "grove" ? accountRaw : undefined;

async function main() {
  const prisma = getPrisma();
  const result = await runSocialCampaignTick(prisma, {
    dryRun: dryRunFlag || !process.env.SOCIAL_CAMPAIGN_AUTO_POST,
    assetId,
    account,
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
