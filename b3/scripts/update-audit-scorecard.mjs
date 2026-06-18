#!/usr/bin/env node
/**
 * Write docs/AUDIT_SCORECARD.md from grant verify matrix JSON.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const matrixPath = process.argv[2] ?? path.join(root, "proof-bundles", ".grant-verify-matrix.json");
const outPath = path.join(root, "docs", "AUDIT_SCORECARD.md");

if (!fs.existsSync(matrixPath)) {
  console.warn("No matrix at", matrixPath);
  process.exit(0);
}

const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
const { summary, checks, origin, generatedAtUtc } = matrix;

const lines = [
  "# Audit Scorecard",
  "",
  `Generated: ${generatedAtUtc}`,
  `Origin: ${origin}`,
  "",
  `| Pass | Warn | Fail |`,
  `|------|------|------|`,
  `| ${summary.pass} | ${summary.warn} | ${summary.fail} |`,
  "",
  "## Checks",
  "",
  "| Status | Label | Detail |",
  "|--------|-------|--------|",
];

for (const c of checks) {
  const detail = (c.detail ?? "").replace(/\|/g, "\\|");
  lines.push(`| ${c.status} | ${c.label} | ${detail} |`);
}

lines.push("", "Refresh: `npm run audit:gate -- --write-scorecard`", "");

fs.writeFileSync(outPath, lines.join("\n"));
console.log("Wrote", outPath);
