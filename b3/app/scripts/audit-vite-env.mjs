#!/usr/bin/env node
/**
 * Audit VITE_* vars referenced in app/src against deploy/.env + app/.env.
 * Run from repo root: node app/scripts/audit-vite-env.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "../..");
const SRC = join(ROOT, "app/src");
const ENV_FILES = [join(ROOT, "deploy/.env"), join(ROOT, "app/.env")];

const OPTIONAL = new Set([
  "VITE_BSC_HTTP_URL",
  "VITE_BSC_WSS_URL",
  "VITE_4EVERLAND_BSC_API_KEY",
  "VITE_BCD_DEMO_BALANCE",
  "VITE_BCD_GENESIS_ELIGIBILITY_BASE",
  "VITE_BCD_SALE_ELIGIBILITY_BASE",
  "VITE_BCD_SALE_ROUND_ID",
  "VITE_BCD_GENESIS_MERKLE_ROOT_HEX",
  "VITE_BCC_SYMBOL",
  "VITE_BCD_SYMBOL",
  "VITE_CAMPAIGN_FROM_BLOCK",
  "VITE_COMMUNITY_DISCORD_URL",
  "VITE_DAILY_CHECKIN_ADDRESS",
  "VITE_ECO_HUB_LANDING_URL",
  "VITE_FEATURED_COLLECTION_LABEL",
  "VITE_FARCASTER_EMBED_IMAGE",
  "VITE_FARCASTER_TARGET_CAST_URL",
  "VITE_GENESIS_DISTRICT_IMAGE_URL",
  "VITE_PLACES_INVEST_PATH",
  "VITE_PLACES_SITE_URL",
  "VITE_PLACES_TRADE_PATH",
  "VITE_PLACES_TRANSPARENCY_PATH",
  "VITE_POINTS_REDEEM_ENABLED",
  "VITE_POSTHOG_HOST",
  "VITE_POSTHOG_KEY",
  "VITE_PUBLIC_POSTHOG_HOST",
  "VITE_PUBLIC_POSTHOG_KEY",
  "VITE_PUBLIC_STATS_ENTRIES",
  "VITE_SOLANA_RPC",
  "VITE_STRAPI_URL",
  "VITE_SUI_RPC",
  "VITE_BTC_EXPLORER_API",
  "VITE_STRIPE_PUBLISHABLE_KEY",
  "VITE_TELEGRAM_DEV_USER_ID",
  "VITE_TON_NETWORK",
  "VITE_WALLETCONNECT_PROJECT_ID",
  "VITE_WORLD_MINI_APP_ID",
  "VITE_WORLD_CHAIN_RPC_URL",
  "VITE_ENABLE_WORLD_CHAIN",
]);

const CRITICAL = new Set([
  "VITE_APP_ORIGIN",
  "VITE_PLATFORM_ORIGIN",
  "VITE_PRIVY_APP_ID",
  "VITE_PRIVY_CLIENT_ID",
  "VITE_NEYNAR_CLIENT_ID",
  "VITE_TONCONNECT_MANIFEST_URL",
  "VITE_TELEGRAM_TWA_RETURN_URL",
  "VITE_TELEGRAM_MINIAPP_URL",
  "VITE_BCC_TOKEN_ADDRESS",
  "VITE_IDENTITY_CONTRACT_ADDRESS",
  "VITE_THIRDWEB_CLIENT_ID",
  "VITE_MARKETPLACE_CONTRACT_ADDRESS",
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

function loadEnv(file) {
  const map = new Map();
  try {
    const text = readFileSync(file, "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) map.set(m[1], m[2].trim());
    }
  } catch {
    /* missing */
  }
  return map;
}

const used = new Set();
const re = /import\.meta\.env\.(VITE_[A-Z0-9_]+)/g;
for (const file of walk(SRC)) {
  const text = readFileSync(file, "utf8");
  let m;
  while ((m = re.exec(text))) used.add(m[1]);
}

const deploy = loadEnv(ENV_FILES[0]);
const app = loadEnv(ENV_FILES[1]);

const missingDeploy = [];
const missingApp = [];
const missingCritical = [];

for (const key of [...used].sort()) {
  const d = deploy.get(key);
  const a = app.get(key);
  if (!d && !OPTIONAL.has(key)) missingDeploy.push(key);
  if (!a && !OPTIONAL.has(key)) missingApp.push(key);
  if (CRITICAL.has(key) && !d) missingCritical.push(key);
}

console.log("[audit-vite] referenced in src:", used.size);
console.log("[audit-vite] deploy/.env missing (non-optional):", missingDeploy.length);
console.log("[audit-vite] app/.env missing (non-optional):", missingApp.length);

if (missingCritical.length) {
  console.log("\nCRITICAL missing in deploy/.env:");
  for (const k of missingCritical) console.log("  -", k);
}

if (missingDeploy.length) {
  console.log("\nMissing in deploy/.env:");
  for (const k of missingDeploy) console.log("  -", k);
}

const pairs = [
  ["NEYNAR_CLIENT_ID", "VITE_NEYNAR_CLIENT_ID"],
  ["NEYNAR_TARGET_CAST", "VITE_FARCASTER_TARGET_CAST_URL"],
  ["FARCASTER_FOLLOW_URL", "VITE_FARCASTER_FOLLOW_URL"],
  ["TELEGRAM_MINIAPP_URL", "VITE_TELEGRAM_MINIAPP_URL"],
];
console.log("\nMirror pairs:");
for (const [server, client] of pairs) {
  const s = deploy.get(server);
  const c = deploy.get(client);
  const ok = Boolean(s || c);
  console.log(`  ${server} ↔ ${client}: ${ok ? "ok" : "missing"}`);
}

const tonManifest = deploy.get("VITE_TONCONNECT_MANIFEST_URL");
const tonReturn = deploy.get("VITE_TELEGRAM_TWA_RETURN_URL");
console.log("\nTelegram / TON:");
console.log("  manifest:", tonManifest || "MISSING");
console.log("  twaReturnUrl:", tonReturn || "MISSING");
console.log("  TELEGRAM_BOT_TOKEN:", deploy.get("TELEGRAM_BOT_TOKEN") ? "set" : "MISSING");

const ciMode = process.env.CI === "true" || process.env.AUDIT_VITE_CI === "1";
const hasDeploy = deploy.size > 0;

if (ciMode && !hasDeploy) {
  console.log("\n[audit-vite] CI structure check: no deploy/.env — skipping secret gate");
  console.log(`[audit-vite] referenced ${used.size} VITE_* keys in src`);
  process.exit(0);
}

if (missingCritical.length) process.exit(1);
console.log("\n[audit-vite] critical vars OK");
