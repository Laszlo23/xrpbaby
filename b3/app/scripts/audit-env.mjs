#!/usr/bin/env node
/**
 * Full integration env audit: server secrets + VITE_* readiness by phase.
 * Run from repo root: npm run audit:env
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = join(import.meta.dirname, "../..");
const DEPLOY_ENV = join(ROOT, "deploy/.env");
const APP_ENV = join(ROOT, "app/.env");

function loadEnv(file) {
  const map = new Map();
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) map.set(m[1], m[2].trim());
    }
  } catch {
    /* missing */
  }
  return map;
}

function has(env, key) {
  const v = env.get(key);
  return Boolean(v && v.length > 0);
}

function status(env, keys, mode = "any") {
  const hits = keys.filter((k) => has(env, k));
  if (mode === "all") return hits.length === keys.length ? "ok" : "missing";
  return hits.length > 0 ? "ok" : "missing";
}

const deploy = loadEnv(DEPLOY_ENV);
const app = loadEnv(APP_ENV);

const integrations = [
  {
    id: "core",
    label: "Core app (DB + origins)",
    phase: 0,
    required: ["DATABASE_URL", "PUBLIC_APP_ORIGIN", "VITE_APP_ORIGIN", "VITE_PLATFORM_ORIGIN"],
    optional: [],
  },
  {
    id: "privy",
    label: "Privy auth / wallets",
    phase: 0,
    required: ["VITE_PRIVY_APP_ID", "VITE_PRIVY_CLIENT_ID", "PRIVY_APP_ID", "PRIVY_APP_SECRET"],
    optional: [],
  },
  {
    id: "thirdweb",
    label: "Thirdweb marketplace",
    phase: 3,
    required: [
      "VITE_THIRDWEB_CLIENT_ID",
      "THIRDWEB_CLIENT_ID",
      "THIRDWEB_SECRET_KEY",
      "VITE_MARKETPLACE_CONTRACT_ADDRESS",
      "VITE_MARKETPLACE_NETWORK",
    ],
    optional: [],
  },
  {
    id: "telegram",
    label: "Telegram Mini App",
    phase: 2,
    required: [
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_MINIAPP_URL",
      "VITE_TELEGRAM_MINIAPP_URL",
      "VITE_TONCONNECT_MANIFEST_URL",
      "VITE_TELEGRAM_TWA_RETURN_URL",
    ],
    optional: ["VITE_TELEGRAM_DEV_USER_ID"],
  },
  {
    id: "neynar",
    label: "Neynar / Farcaster",
    phase: 2,
    required: ["NEYNAR_API_KEY", "NEYNAR_CLIENT_ID", "VITE_NEYNAR_CLIENT_ID"],
    optional: ["VITE_FARCASTER_TARGET_CAST_URL", "NEYNAR_TARGET_CAST", "VITE_FARCASTER_FOLLOW_URL"],
  },
  {
    id: "grove",
    label: "Grove marketing agent",
    phase: 2,
    required: ["GROVE_MARKETING_ADMIN_SECRET", "GROVE_TICK_URL", "GROVE_TELEGRAM_CHAT_ID"],
    optional: [
      "GROVE_X_CONSUMER_KEY",
      "GROVE_X_ACCESS_TOKEN",
      "GROVE_NEYNAR_SIGNER_UUID",
      "GROVE_SLACK_WEBHOOK_URL",
    ],
  },
  {
    id: "quidli",
    label: "Quidli Connect",
    phase: 2,
    required: ["QUIDLI_API_KEY"],
    optional: ["QUIDLY_API_KEY"],
  },
  {
    id: "xrpl",
    label: "XRPL quote lane",
    phase: 2,
    required: ["XRPL_QUOTE_ENABLED"],
    optional: ["XRPL_RPC_URL"],
    check: (e) => {
      if (e.get("XRPL_EXECUTION_ENABLED") === "1") return "warn_execution_on";
      return "ok";
    },
  },
  {
    id: "stripe",
    label: "Stripe culture packs",
    phase: 3,
    required: [],
    optional: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "VITE_STRIPE_PUBLISHABLE_KEY"],
    launchOptional: true,
  },
  {
    id: "places",
    label: "Places REOC satellite",
    phase: 4,
    required: [],
    optional: [
      "COMPLIANCE_REGISTRY_ADDRESS",
      "VITE_PLACES_SITE_URL",
      "VITE_PLACES_INVEST_PATH",
      "VITE_PLACES_TRADE_PATH",
      "PROPERTY_RESERVE_FEED_ADDRESS",
      "CHAINLINK_ACE_COMPLIANCE_ADDRESS",
    ],
    launchOptional: true,
  },
  {
    id: "agents",
    label: "Agent runtime / LLM",
    phase: 6,
    required: ["BASE_RPC_URL", "AGENT_BASE_RPC_URL", "AGENT_CHAIN_ID"],
    optional: ["OPENAI_API_KEY", "OG_COMPUTE_ROUTER_API_KEY", "AGENT_AGS_DISTRIBUTOR_PRIVATE_KEY"],
  },
  {
    id: "strapi",
    label: "Strapi CMS",
    phase: 1,
    required: [],
    optional: ["STRAPI_API_TOKEN"],
    warnEmpty: ["STRAPI_API_TOKEN"],
  },
];

console.log("[audit-env] deploy/.env:", DEPLOY_ENV);
console.log("[audit-env] app/.env:", APP_ENV);
console.log("");

let failRequired = 0;
const phaseGaps = new Map();

for (const row of integrations) {
  const missingReq = row.required.filter((k) => !has(deploy, k));
  const missingOpt = (row.optional ?? []).filter((k) => !has(deploy, k));
  const custom = row.check?.(deploy);
  const warns = (row.warnEmpty ?? []).filter((k) => deploy.has(k) && !has(deploy, k));

  let state = missingReq.length === 0 ? "ok" : "missing";
  if (custom === "warn_execution_on") state = "warn";
  if (missingReq.length === 0 && warns.length) state = "warn";

  if (state === "missing" && row.required.length > 0 && !row.launchOptional) {
    failRequired += 1;
    const list = phaseGaps.get(row.phase) ?? [];
    list.push(row.label);
    phaseGaps.set(row.phase, list);
  }

  console.log(
    `${state === "ok" ? "OK " : state === "warn" ? "WARN" : "FAIL"} ${row.label} (phase ${row.phase})`,
  );
  if (missingReq.length) console.log(`     missing required: ${missingReq.join(", ")}`);
  if (missingOpt.length) {
    if (row.launchOptional && missingOpt.length === (row.optional ?? []).length) {
      console.log(`     not configured (optional for launch): ${missingOpt.join(", ")}`);
    } else if (missingOpt.length && row.required.length === 0) {
      console.log(`     optional unset: ${missingOpt.join(", ")}`);
    }
  }
  if (warns.length) console.log(`     empty value: ${warns.join(", ")}`);
  if (custom === "warn_execution_on")
    console.log("     XRPL_EXECUTION_ENABLED=1 (keep 0 for launch)");
}

console.log("\nMirror pairs:");
const pairs = [
  ["NEYNAR_CLIENT_ID", "VITE_NEYNAR_CLIENT_ID"],
  ["TELEGRAM_MINIAPP_URL", "VITE_TELEGRAM_MINIAPP_URL"],
  ["THIRDWEB_CLIENT_ID", "VITE_THIRDWEB_CLIENT_ID"],
  ["PRIVY_APP_ID", "VITE_PRIVY_APP_ID"],
];
for (const [a, b] of pairs) {
  const ok = has(deploy, a) && has(deploy, b);
  console.log(`  ${a} ↔ ${b}: ${ok ? "ok" : "drift"}`);
}

console.log("\nPhase minimum for launch (0–2):");
for (const phase of [0, 1, 2]) {
  const coreRows = integrations.filter((r) => r.phase <= phase && r.required.length > 0);
  const missing = coreRows.filter((r) => r.required.some((k) => !has(deploy, k)));
  console.log(
    `  Through phase ${phase}: ${missing.length === 0 ? "ready" : `gaps in ${missing.map((m) => m.id).join(", ")}`}`,
  );
}

console.log("\n--- VITE sub-audit ---");
const vite = spawnSync("node", ["app/scripts/audit-vite-env.mjs"], {
  cwd: ROOT,
  encoding: "utf8",
});
process.stdout.write(vite.stdout ?? "");
if (vite.stderr) process.stderr.write(vite.stderr);

const viteOk = vite.status === 0;
if (!viteOk) failRequired += 1;

console.log("\n[audit-env] summary:");
console.log(`  integration failures (required vars): ${failRequired}`);
if (phaseGaps.size) {
  console.log("  phases with gaps:");
  for (const [p, labels] of phaseGaps) console.log(`    phase ${p}: ${labels.join(", ")}`);
}

process.exit(failRequired > 0 ? 1 : 0);
