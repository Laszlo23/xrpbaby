#!/usr/bin/env node
/**
 * Priority 1 grant submission prep — prints checklist + appends submission-log.
 * Run after: npm run grant:proof
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const bundleDir = resolve(root, "proof-bundles");
const logPath = resolve(bundleDir, "submission-log.txt");

const PROGRAMS = [
  {
    id: "base-builder-grants",
    name: "Base Builder Grants (retroactive)",
    url: "https://docs.base.org/get-started/get-funded",
    status: "ready_to_submit",
  },
  {
    id: "0g-guild",
    name: "Guild on 0G 2.0",
    url: "https://guild.0gfoundation.ai/apply",
    status: "ready_to_submit",
  },
  {
    id: "chainlink-build",
    name: "Chainlink BUILD / RWA narrative",
    url: "docs/CHAINLINK_PARTNER_ONBOARDING.md",
    status: "ready_to_submit",
  },
];

function latestBundle() {
  if (!existsSync(bundleDir)) return null;
  const md = readdirSync(bundleDir)
    .filter((f) => f.startsWith("grant-verification-") && f.endsWith(".md"))
    .sort()
    .pop();
  const json = readdirSync(bundleDir)
    .filter((f) => f.startsWith("grant-proof-") && f.endsWith(".json"))
    .sort()
    .pop();
  return md && json ? { md, json } : null;
}

const bundle = latestBundle();
const ts = new Date().toISOString();

console.log("\n=== GRANT PRIORITY 1 — submission prep ===\n");
console.log(`Generated: ${ts}`);
if (bundle) {
  console.log(`Latest bundle: proof-bundles/${bundle.md}`);
  console.log(`JSON: proof-bundles/${bundle.json}`);
} else {
  console.log("WARNING: No proof bundle found — run: npm run grant:proof");
}

console.log("\nPrograms (operator submits — agent cannot login to forms):\n");
for (const p of PROGRAMS) {
  console.log(`  [ ] ${p.name}`);
  console.log(`      ${p.url}`);
  console.log(`      Copy-paste: docs/GRANT_SUBMISSIONS.md`);
  console.log("");
}

console.log("Wallet (Base): 0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22");
console.log("Contact: laszlo.bihary@gmail.com");
console.log("BCID narrative: Portable applicant identity + verifiable credentials");
console.log("Grant proof: https://app.buildingcultureid.space/grant-proof\n");

if (!existsSync(bundleDir)) {
  writeFileSync(logPath, `# Grant submission log\n`);
}

const logEntry = `
--- ${ts} ---
Priority 1 prep run
Bundle: ${bundle ? `${bundle.md} + ${bundle.json}` : "MISSING — run grant:proof"}
Programs: ${PROGRAMS.map((p) => p.id).join(", ")}
BCID docs: https://app.buildingcultureid.space/docs/bcid
Operator action: Submit Base + 0G + Chainlink per GRANT_SUBMISSIONS.md
`;
appendFileSync(logPath, logEntry);
console.log(`Appended to ${logPath}`);
