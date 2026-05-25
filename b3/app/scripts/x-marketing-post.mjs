#!/usr/bin/env node
/**
 * Post via production API POST /api/marketing/x-post (server-side X OAuth).
 *
 * Run on the VPS from frontend/ after deploy — uses frontend/.env (same as Docker compose).
 *
 * Requires: X_MARKETING_ADMIN_SECRET, X_CONSUMER_*, X_ACCESS_* (see .env.example)
 * Requires one of: PUBLIC_APP_ORIGIN | VITE_APP_ORIGIN | X_MARKETING_PUBLIC_ORIGIN
 *
 * Usage:
 *   node scripts/x-marketing-post.mjs "Hello from deploy host"
 *   echo "Thread line 2" | node scripts/x-marketing-post.mjs -
 *   node scripts/x-marketing-post.mjs --reply-to 1234567890 "Thanks!"
 *   ENV_FILE=/path/.env node scripts/x-marketing-post.mjs "…"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const defaultEnvFile = path.join(frontendRoot, ".env");

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

function readStdin() {
  return new Promise((resolve, reject) => {
    let d = "";
    process.stdin.on("data", (c) => {
      d += c;
    });
    process.stdin.on("end", () => resolve(d.trim()));
    process.stdin.on("error", reject);
  });
}

function usage() {
  console.error(`Usage: node scripts/x-marketing-post.mjs [--reply-to TWEET_ID] "text…"
       echo "text" | node scripts/x-marketing-post.mjs -`);
  process.exit(2);
}

const envPath = process.env.ENV_FILE?.trim() || defaultEnvFile;
const fileEnv = loadDotenvFile(envPath);
const env = { ...fileEnv, ...process.env };

let replyTo;
const rest = [];
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === "--reply-to" && process.argv[i + 1]) {
    replyTo = process.argv[++i];
  } else {
    rest.push(a);
  }
}

let text = rest.join(" ").trim();
if (text === "-") text = await readStdin();
if (!text) usage();

const origin = String(
  env.PUBLIC_APP_ORIGIN || env.VITE_APP_ORIGIN || env.X_MARKETING_PUBLIC_ORIGIN || "",
)
  .trim()
  .replace(/\/$/, "");
const secret = String(env.X_MARKETING_ADMIN_SECRET || "").trim();

if (!origin) {
  console.error(
    "Missing PUBLIC_APP_ORIGIN, VITE_APP_ORIGIN, or X_MARKETING_PUBLIC_ORIGIN in",
    envPath,
  );
  process.exit(2);
}
if (!secret) {
  console.error("Missing X_MARKETING_ADMIN_SECRET in", envPath);
  process.exit(2);
}

const url = `${origin}/api/marketing/x-post`;
const body = { text };
if (replyTo?.trim()) body.replyToTweetId = replyTo.trim();

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-x-marketing-admin-secret": secret,
  },
  body: JSON.stringify(body),
});

const raw = await res.text();
let json;
try {
  json = JSON.parse(raw);
} catch {
  json = null;
}

if (!res.ok) {
  console.error("HTTP", res.status, json ?? raw);
  process.exit(1);
}

console.log(JSON.stringify(json ?? { raw }));
