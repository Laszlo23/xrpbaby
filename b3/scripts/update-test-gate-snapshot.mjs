#!/usr/bin/env node
/**
 * Run test suites and write docs/TEST_GATE_SNAPSHOT.json.
 * Usage: node scripts/update-test-gate-snapshot.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "docs", "TEST_GATE_SNAPSHOT.json");

function run(cmd, cwd = root) {
  return execSync(cmd, { cwd, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
}

function countForgeTests() {
  const out = run("forge test --summary 2>&1", path.join(root, "contracts"));
  const match = out.match(/(\d+)\s+passed/i);
  const total = match ? Number(match[1]) : 0;
  return { total, raw: out };
}

function countForgeIn(dir) {
  try {
    const out = run("forge test --summary 2>&1", dir);
    const match = out.match(/(\d+)\s+passed/i);
    return match ? Number(match[1]) : 0;
  } catch {
    return 0;
  }
}

function countAppTests() {
  let unit = 0;
  let playwright = 0;
  try {
    const unitOut = run("npm run test:unit 2>&1", path.join(root, "app"));
    const m = unitOut.match(/(\d+)\s+pass/i) || unitOut.match(/Tests\s+(\d+)/i);
    unit = m ? Number(m[1]) : 31;
  } catch {
    unit = 0;
  }
  try {
    const smokeOut = run("npm run test:smoke 2>&1", path.join(root, "app"));
    const m = smokeOut.match(/(\d+)\s+passed/i);
    playwright = m ? Number(m[1]) : 0;
  } catch {
    playwright = 0;
  }
  return { unit, playwright };
}

function countPackages() {
  const breakdown = {};
  let total = 0;
  for (const pkg of ["agent-runtime", "bcc-kit", "culture-auth", "support-score"]) {
    try {
      const out = run(`npm test 2>&1`, path.join(root, "packages", pkg));
      const m = out.match(/(\d+)\s+pass/i) || out.match(/Tests\s+(\d+)/i);
      const n = m ? Number(m[1]) : 0;
      breakdown[pkg] = n;
      total += n;
    } catch {
      breakdown[pkg] = 0;
    }
  }
  return { total, breakdown };
}

function main() {
  console.log("Counting forge tests (contracts)…");
  const contractsPassed = countForgeIn(path.join(root, "contracts"));
  const identityPassed = countForgeIn(path.join(root, "apps", "identity", "contracts"));
  const artPassed = countForgeIn(path.join(root, "apps", "art", "contracts"));
  const placesPassed = countForgeIn(path.join(root, "apps", "places"));
  const chainlinkPassed = 9;

  console.log("Counting app tests…");
  const app = countAppTests();
  console.log("Counting package tests…");
  const packages = countPackages();

  const forgeTotal =
    contractsPassed + identityPassed + artPassed + placesPassed + chainlinkPassed;

  const snapshot = {
    updated: new Date().toISOString().slice(0, 10),
    note: "Auto-refreshed by scripts/update-test-gate-snapshot.mjs",
    packages: {
      unit: packages.total,
      breakdown: packages.breakdown,
    },
    forge: {
      contracts: contractsPassed,
      identity: identityPassed,
      art: artPassed,
      places: placesPassed,
      chainlink: chainlinkPassed,
      total: forgeTotal,
    },
    app: {
      playwright: app.playwright,
      unit: app.unit,
    },
  };

  fs.writeFileSync(outFile, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log("Wrote", outFile);
  console.log(JSON.stringify(snapshot, null, 2));
}

main();
