#!/usr/bin/env node
/**
 * Run backtest (deterministic business-logic replay) unit tests.
 * Usage: node scripts/run-backtest.mjs
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = path.join(root, "app");

const backtestFiles = [
  "src/lib/treasury-revenue-rules.test.ts",
  "src/lib/identity/culture-score.test.ts",
  "src/lib/bcc-agent-access.test.ts",
  "src/server/wallet/bcc-payment-verify.test.ts",
  "src/server/rewards/first-bcc.test.ts",
  "src/server/agents/grant.test.ts",
  "src/lib/landing-proof-display.test.ts",
  "src/server/platform/onboarding-bcc.integration.test.ts",
];

const files = backtestFiles.map((f) => path.join(appRoot, f)).join(" ");

console.log("==> Backtest suite");
try {
  execSync(`npx tsx --test ${files}`, {
    cwd: appRoot,
    stdio: "inherit",
    env: { ...process.env, BACKTEST: "1" },
  });
  console.log("Backtest PASSED");
} catch {
  console.error("Backtest FAILED");
  process.exit(1);
}
