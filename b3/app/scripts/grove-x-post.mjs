#!/usr/bin/env node
/**
 * Post to Grove X via POST /api/marketing/grove/x-post
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

const envPath = process.env.ENV_FILE?.trim() || defaultEnvFile;
const env = { ...loadDotenvFile(envPath), ...process.env };

let replyTo;
let imagePath;
const rest = [];
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === "--reply-to" && process.argv[i + 1]) replyTo = process.argv[++i];
  else if (a === "--image" && process.argv[i + 1]) imagePath = process.argv[++i];
  else rest.push(a);
}

let text = rest.join(" ").trim();
if (text === "-") text = await readStdin();
if (!text) {
  console.error('Usage: node scripts/grove-x-post.mjs [--reply-to ID] [--image /social/foo.webp] "text"');
  process.exit(2);
}

const origin = String(env.GROVE_PUBLIC_ORIGIN || env.PUBLIC_APP_ORIGIN || env.VITE_APP_ORIGIN || "")
  .trim()
  .replace(/\/$/, "");
const secret = String(
  env.GROVE_MARKETING_ADMIN_SECRET || env.X_MARKETING_ADMIN_SECRET || "",
).trim();

if (!origin || !secret) {
  console.error("Missing origin or GROVE_MARKETING_ADMIN_SECRET");
  process.exit(2);
}

const body = { text };
if (replyTo?.trim()) body.replyToTweetId = replyTo.trim();
if (imagePath?.trim()) body.imagePath = imagePath.trim();

const res = await fetch(`${origin}/api/marketing/grove/x-post`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-grove-marketing-admin-secret": secret,
  },
  body: JSON.stringify(body),
});

const raw = await res.text();
const json = (() => {
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
})();

if (!res.ok) {
  console.error("HTTP", res.status, json);
  process.exit(1);
}

console.log(JSON.stringify(json));
