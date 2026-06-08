#!/usr/bin/env node
/**
 * Run Grove tick via POST /api/marketing/grove/tick (when app web is up).
 *
 *   node scripts/grove-tick.mjs
 *   node scripts/grove-tick.mjs --dry-run
 *   node scripts/grove-tick.mjs --pillar forest_proof
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
let pillar;
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--pillar" && process.argv[i + 1]) {
    pillar = process.argv[++i];
  }
}

const origin = String(
  env.GROVE_PUBLIC_ORIGIN ||
    env.PUBLIC_APP_ORIGIN ||
    env.VITE_APP_ORIGIN ||
    env.X_MARKETING_PUBLIC_ORIGIN ||
    "",
)
  .trim()
  .replace(/\/$/, "");
const secret = String(
  env.GROVE_MARKETING_ADMIN_SECRET || env.X_MARKETING_ADMIN_SECRET || "",
).trim();

if (!origin) {
  console.error("Missing PUBLIC_APP_ORIGIN / GROVE_PUBLIC_ORIGIN in", envPath);
  process.exit(2);
}
if (!secret) {
  console.error("Missing GROVE_MARKETING_ADMIN_SECRET in", envPath);
  process.exit(2);
}

const body = { dryRun };
if (pillar) body.pillar = pillar;

const res = await fetch(`${origin}/api/marketing/grove/tick`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-grove-marketing-admin-secret": secret,
  },
  body: JSON.stringify(body),
});

const raw = await res.text();
let json;
try {
  json = JSON.parse(raw);
} catch {
  json = { raw };
}

if (!res.ok) {
  console.error("HTTP", res.status, json);
  process.exit(1);
}

console.log(JSON.stringify(json, null, 2));
