#!/usr/bin/env node
/**
 * Weekly Quidli BCC drops for top Culture Points builders.
 *
 *   node scripts/quidli-leaderboard-drops.mjs
 *   node scripts/quidli-leaderboard-drops.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const defaultEnvFile = path.join(appRoot, ".env");

function loadDotenvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const eq = s.indexOf("=");
    if (eq < 1) continue;
    const k = s.slice(0, eq).trim();
    let v = s.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const envPath = process.env.ENV_FILE?.trim() || defaultEnvFile;
const fileEnv = loadDotenvFile(envPath);
const env = { ...fileEnv, ...process.env };

const dryRun = process.argv.includes("--dry-run");
const origin = String(
  env.GROVE_PUBLIC_ORIGIN ||
    env.PUBLIC_APP_ORIGIN ||
    env.VITE_APP_ORIGIN ||
    "https://app.buildingcultureid.space",
).replace(/\/$/, "");

const secret =
  env.GROVE_MARKETING_ADMIN_SECRET?.trim() || env.X_MARKETING_ADMIN_SECRET?.trim();
if (!secret) {
  console.error("Missing GROVE_MARKETING_ADMIN_SECRET");
  process.exit(1);
}

const res = await fetch(`${origin}/api/marketing/quidli/leaderboard-drops`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-grove-marketing-admin-secret": secret,
  },
  body: JSON.stringify({ dryRun, limit: 3 }),
});

const text = await res.text();
let payload;
try {
  payload = JSON.parse(text);
} catch {
  console.error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  process.exit(1);
}

console.log(JSON.stringify(payload, null, 2));
process.exit(res.ok && payload.ok ? 0 : 1);
