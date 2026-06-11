#!/usr/bin/env node
/**
 * GTM link audit — extract hrefs from canonical registries and HTTP-check each URL.
 *
 * Usage:
 *   node scripts/link-audit.mjs
 *   node scripts/link-audit.mjs --origin=https://app.buildingcultureid.space
 *   LINK_AUDIT_STRICT_SATELLITES=0 node scripts/link-audit.mjs  # warn on satellite failures
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SOURCE_FILES = [
  "app/src/lib/footer-links.ts",
  "app/src/lib/landing-ecosystem.ts",
  "app/src/lib/landing-media.ts",
  "content/community-guide.md",
];

const PLACES_SOCIAL_DEFAULTS = [
  "https://x.com/buildingcultu3",
  "https://www.instagram.com/buildingcultu3/",
];

/** Known satellite hosts — failures can WARN when LINK_AUDIT_STRICT_SATELLITES=0 */
const SATELLITE_HOSTS = new Set([
  "wohnai.buildingcultureid.space",
  "ankommen.buildingcultureid.space",
  "forkids.buildingcultureid.space",
]);

/** Pending nginx redirects — WARN instead of FAIL until phase-6 applied on VPS */
const PENDING_REDIRECT_URLS = new Set([
  "https://buildingcultureid.space/guide",
]);

function parseArgs() {
  const originArg = process.argv.find((a) => a.startsWith("--origin="));
  const origin =
    originArg?.slice("--origin=".length) ||
    process.env.PUBLIC_APP_ORIGIN ||
    "https://app.buildingcultureid.space";
  const strictSatellites = process.env.LINK_AUDIT_STRICT_SATELLITES !== "0";
  return { origin: origin.replace(/\/$/, ""), strictSatellites };
}

function readSource(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
}

function extractUrlsFromSources() {
  const found = new Map();

  function add(url, source) {
    if (!url || url.startsWith("#") || url.startsWith("mailto:")) return;
    const trimmed = url
      .trim()
      .replace(/[`*)]+$/g, "")
      .replace(/^[`(*]+/g, "");
    if (!trimmed.startsWith("http") && !trimmed.startsWith("/")) return;
    if (!found.has(trimmed)) {
      found.set(trimmed, new Set());
    }
    found.get(trimmed).add(source);
  }

  for (const rel of SOURCE_FILES) {
    const text = readSource(rel);
    if (!text) continue;

    for (const m of text.matchAll(/href:\s*["']([^"']+)["']/g)) add(m[1], rel);
    for (const m of text.matchAll(/externalUrl:\s*["']([^"']+)["']/g)) add(m[1], rel);
    for (const m of text.matchAll(/to:\s*["'](\/[^"']*)["']/g)) add(m[1], rel);
    for (const m of text.matchAll(/https?:\/\/[^\s"'<>)\]`]+/g)) add(m[0], rel);

    for (const m of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) add(m[1], rel);
  }

  for (const url of PLACES_SOCIAL_DEFAULTS) add(url, "apps/places/web/src/lib/social-links.ts");

  return found;
}

function resolveCheckUrl(entry, origin) {
  if (entry.startsWith("/")) {
    return `${origin}${entry}`;
  }
  return entry;
}

function isSatelliteUrl(url) {
  try {
    const host = new URL(url).hostname;
    return SATELLITE_HOSTS.has(host);
  } catch {
    return false;
  }
}

async function checkUrl(url, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "BuildingCulture-LinkAudit/1.0" },
    });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": "BuildingCulture-LinkAudit/1.0" },
      });
    }
    return { status: res.status, ok: res.status >= 200 && res.status < 400 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 0, ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const { origin, strictSatellites } = parseArgs();
  const registry = extractUrlsFromSources();
  const entries = [...registry.entries()].sort(([a], [b]) => a.localeCompare(b));

  console.log(`Link audit: ${entries.length} unique URLs (origin ${origin})\n`);

  let fail = 0;
  let warn = 0;

  for (const [entry, sources] of entries) {
    const url = resolveCheckUrl(entry, origin);
    const result = await checkUrl(url);
    const sourceList = [...sources].join(", ");
    const satellite = isSatelliteUrl(url);
    const pending = PENDING_REDIRECT_URLS.has(url) || PENDING_REDIRECT_URLS.has(entry);

    if (result.ok) {
      console.log(`OK   ${result.status} ${url}`);
    } else if ((satellite && !strictSatellites) || pending) {
      warn += 1;
      const detail = result.error ?? `HTTP ${result.status}`;
      console.log(`WARN ${detail} ${url}  (${sourceList})`);
    } else {
      fail += 1;
      const detail = result.error ?? `HTTP ${result.status}`;
      console.log(`FAIL ${detail} ${url}  (${sourceList})`);
    }
  }

  console.log("");
  if (fail > 0) {
    console.error(`Link audit failed: ${fail} broken URL(s), ${warn} warning(s).`);
    process.exit(1);
  }
  if (warn > 0) {
    console.log(`Link audit passed with ${warn} satellite warning(s) (LINK_AUDIT_STRICT_SATELLITES=0).`);
  } else {
    console.log("Link audit passed — all URLs reachable.");
  }
}

main();
