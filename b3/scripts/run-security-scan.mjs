#!/usr/bin/env node
/**
 * Security scan gate: npm audit + optional gitleaks.
 * Usage: node scripts/run-security-scan.mjs
 */
import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exceptionsFile = path.join(root, "docs", "SECURITY_AUDIT_EXCEPTIONS.json");

let hardFail = 0;
let warn = 0;

function loadExceptions() {
  if (!fs.existsSync(exceptionsFile)) return { allowedAdvisories: [] };
  return JSON.parse(fs.readFileSync(exceptionsFile, "utf8"));
}

console.log("==> npm audit (app workspace, omit dev)");
try {
  const out = execSync("npm audit --omit=dev --json", {
    cwd: path.join(root, "app"),
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  const report = JSON.parse(out);
  const vulns = report.metadata?.vulnerabilities ?? {};
  const critical = vulns.critical ?? 0;
  const high = vulns.high ?? 0;
  const moderate = vulns.moderate ?? 0;
  const exceptions = loadExceptions();
  const allowedModerate = exceptions.allowedAdvisories?.length ?? 0;

  if (critical > 0 || high > 0) {
    console.error(`FAIL npm audit: critical=${critical} high=${high}`);
    hardFail = 1;
  } else if (moderate > allowedModerate) {
    console.warn(`WARN npm audit: moderate=${moderate} (allowed=${allowedModerate} documented)`);
    warn = 1;
  } else {
    console.log(`OK npm audit: moderate=${moderate} (within documented exceptions)`);
  }
} catch (err) {
  const stdout = err.stdout?.toString() ?? "";
  if (stdout.includes('"vulnerabilities"')) {
    try {
      const report = JSON.parse(stdout);
      const vulns = report.metadata?.vulnerabilities ?? {};
      if ((vulns.critical ?? 0) > 0 || (vulns.high ?? 0) > 0) {
        console.error("FAIL npm audit (non-zero exit with high/critical)");
        hardFail = 1;
      } else {
        console.warn("WARN npm audit exited non-zero (moderate/low only)");
        warn = 1;
      }
    } catch {
      console.warn("WARN npm audit failed to parse");
      warn = 1;
    }
  } else {
    console.warn("WARN npm audit command failed");
    warn = 1;
  }
}

console.log("==> gitleaks (optional)");
const gitleaks = spawnSync("gitleaks", ["detect", "--source", root, "--no-git", "-v"], {
  encoding: "utf8",
});
if (gitleaks.error?.code === "ENOENT") {
  console.warn("WARN gitleaks not installed — skip (install for local/CI secret scan)");
  warn = 1;
} else if (gitleaks.status !== 0) {
  console.error("FAIL gitleaks detected potential secrets");
  hardFail = 1;
} else {
  console.log("OK gitleaks");
}

if (hardFail) {
  console.error("security:scan FAILED");
  process.exit(1);
}
console.log(warn ? "security:scan PASSED (warnings)" : "security:scan PASSED");
process.exit(0);
