#!/usr/bin/env node
/**
 * Resources audit: image inventory, HTTP checks, head meta, alt text, size budgets.
 * Usage: node scripts/resources-audit.mjs [--origin=https://app.buildingcultureid.space]
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".tiff", ".tif"]);
const SCAN_DIRS = [
  { label: "app/public", dir: path.join(ROOT, "app/public"), budgetBytes: 15 * 1024 * 1024 },
  { label: "app/src/assets", dir: path.join(ROOT, "app/src/assets"), budgetBytes: 2 * 1024 * 1024 },
  {
    label: "places/public",
    dir: path.join(ROOT, "apps/places/web/public"),
    budgetBytes: 50 * 1024 * 1024,
  },
];

const SRC_DIRS = [
  path.join(ROOT, "app/src"),
  path.join(ROOT, "apps/places/web/src"),
];

const CRITICAL_HTTP_PATHS = [
  "/meta/tonconnect-icon.png",
  "/meta/home-meta.svg",
  "/meta/home-meta-og.png",
  "/brand/miniapp-icon.svg",
  "/places/meta/rwa-share-icon.svg",
  "/og-default.png",
  "/favicon.ico",
  "/icon.svg",
];

function parseArgs() {
  const originArg = process.argv.find((a) => a.startsWith("--origin="));
  const origin =
    originArg?.slice("--origin=".length) ||
    process.env.PUBLIC_APP_ORIGIN ||
    "https://app.buildingcultureid.space";
  return { origin: origin.replace(/\/$/, "") };
}

function walkImages(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkImages(full, acc);
    else if (IMAGE_EXT.has(path.extname(ent.name).toLowerCase())) {
      const st = fs.statSync(full);
      acc.push({ path: full, size: st.size });
    }
  }
  return acc;
}

function formatBytes(n) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

function grepReferenced(relPathFromRoot) {
  try {
    execSync(`rg -l "${relPathFromRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" app apps/places packages --glob '!node_modules'`, {
      cwd: ROOT,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

function auditAltText() {
  const issues = [];
  for (const srcDir of SRC_DIRS) {
    if (!fs.existsSync(srcDir)) continue;
    try {
      const out = execSync(`rg -n 'alt=""' "${srcDir}" --glob '*.tsx' --glob '*.jsx'`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      for (const line of out.trim().split("\n").filter(Boolean)) {
        issues.push(line);
      }
    } catch {
      /* no matches */
    }
  }
  return issues;
}

async function fetchStatus(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
    return res.status;
  } catch (e) {
    return `error:${e.message}`;
  }
}

async function fetchHtml(origin) {
  try {
    const res = await fetch(`${origin}/`, { signal: AbortSignal.timeout(15000) });
    return await res.text();
  } catch {
    return "";
  }
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

async function main() {
  const { origin } = parseArgs();
  const lines = [];
  let warnCount = 0;
  let failCount = 0;

  const push = (s) => lines.push(s);
  const warn = (s) => {
    warnCount++;
    push(`- **WARN:** ${s}`);
  };
  const fail = (s) => {
    failCount++;
    push(`- **FAIL:** ${s}`);
  };
  const ok = (s) => push(`- **OK:** ${s}`);

  push(`# Resources audit — ${new Date().toISOString()}`);
  push("");
  push(`Origin: ${origin}`);
  push("");

  push("## 1. Image inventory & size budgets");
  push("");

  for (const { label, dir, budgetBytes } of SCAN_DIRS) {
    const files = walkImages(dir);
    const total = files.reduce((s, f) => s + f.size, 0);
    const large = files.filter((f) => f.size > 500 * 1024).sort((a, b) => b.size - a.size);
    push(`### ${label}`);
    push(`- Files: ${files.length} | Total: ${formatBytes(total)} | Budget: ${formatBytes(budgetBytes)}`);
    if (total > budgetBytes) warn(`${label} exceeds budget (${formatBytes(total)} > ${formatBytes(budgetBytes)})`);
    else ok(`${label} within budget`);
    if (large.length) {
      push("- Files >500 KB:");
      for (const f of large.slice(0, 15)) {
        push(`  - \`${path.relative(ROOT, f.path)}\` — ${formatBytes(f.size)}`);
      }
      if (large.length > 15) push(`  - … and ${large.length - 15} more`);
    }
    push("");
  }

  push("## 2. Orphan assets (sample)");
  push("");
  const orphanCandidates = [
    "app/public/plan",
    "app/public/drops",
    "app/src/public",
    "app/public/welcome",
  ];
  for (const rel of orphanCandidates) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const files = walkImages(full);
    if (!files.length) continue;
    const total = files.reduce((s, f) => s + f.size, 0);
    const basename = path.basename(rel);
    const referenced = grepReferenced(basename);
    if (!referenced) warn(`\`${rel}\` (${files.length} images, ${formatBytes(total)}) — no code references found`);
    else ok(`\`${rel}\` referenced in codebase`);
  }
  push("");

  push("## 3. HTTP asset checks");
  push("");
  for (const p of CRITICAL_HTTP_PATHS) {
    const local = path.join(ROOT, "app/public", p.replace(/^\//, ""));
    const localExists = fs.existsSync(local);
    const status = await fetchStatus(`${origin}${p}`);
    if (status === 200) ok(`${p} → 200`);
    else if (localExists) warn(`${p} → ${status} (exists locally — redeploy needed)`);
    else fail(`${p} → ${status} (missing locally and remotely)`);
  }
  push("");

  push("## 4. Homepage head checks");
  push("");
  const html = await fetchHtml(origin);
  if (!html) {
    fail("Could not fetch homepage HTML");
  } else {
    if (/rel=["']icon["']/i.test(html) || /rel=["']shortcut icon["']/i.test(html))
      ok("favicon link present");
    else fail("favicon link missing");
    if (/property=["']og:image["']/i.test(html)) ok("og:image present");
    else warn("og:image not found in HTML (may be SSR-only)");
    if (/name=["']twitter:card["']/i.test(html)) ok("twitter:card present");
    else warn("twitter:card not found");
    if (/talentapp:project_verification/i.test(html)) ok("Talent Protocol verification meta");
    else fail("Talent Protocol verification meta missing");
  }
  push("");

  push("## 5. Empty alt text");
  push("");
  const altIssues = auditAltText();
  if (altIssues.length === 0) ok("No empty alt=\"\" in TSX/JSX");
  else {
    warn(`${altIssues.length} empty alt="" occurrences`);
    for (const line of altIssues.slice(0, 20)) push(`  - \`${line}\``);
    if (altIssues.length > 20) push(`  - … and ${altIssues.length - 20} more`);
  }
  push("");

  push("## Summary");
  push("");
  push(`- Warnings: ${warnCount}`);
  push(`- Failures: ${failCount}`);
  push("");

  const outDir = path.join(ROOT, "proof-bundles");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `resources-audit-${timestamp()}.md`);
  fs.writeFileSync(outFile, lines.join("\n"));
  console.log(`Wrote ${outFile}`);
  console.log(`Warnings: ${warnCount}, Failures: ${failCount}`);

  if (process.env.RESOURCES_AUDIT_STRICT === "1" && failCount > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
