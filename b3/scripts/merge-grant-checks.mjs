#!/usr/bin/env node
/** Merge audit-gate checks into an existing grant verify matrix. */
import fs from "node:fs";

const matrixPath = process.argv[2];
const checksPath = process.argv[3];

if (!matrixPath || !checksPath) {
  console.error("Usage: merge-grant-checks.mjs <matrix.json> <checks.jsonl>");
  process.exit(1);
}

const extra = fs
  .readFileSync(checksPath, "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  .map((l) => JSON.parse(l));

let matrix = { checks: [], summary: { pass: 0, warn: 0, fail: 0 }, origin: "", generatedAtUtc: "" };
if (fs.existsSync(matrixPath)) {
  matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
}

const byId = new Map(matrix.checks.map((c) => [c.id, c]));
for (const row of extra) {
  byId.set(row.id, row);
}
matrix.checks = [...byId.values()];
matrix.generatedAtUtc = new Date().toISOString();
matrix.summary = {
  pass: matrix.checks.filter((c) => c.status === "pass").length,
  warn: matrix.checks.filter((c) => c.status === "warn").length,
  fail: matrix.checks.filter((c) => c.status === "fail").length,
};

fs.writeFileSync(matrixPath, JSON.stringify(matrix, null, 2));
console.log("Merged matrix:", JSON.stringify(matrix.summary));
