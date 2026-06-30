#!/usr/bin/env node
/**
 * Cash sprint prep — verify revenue lanes + update submission log reminder.
 * Usage: node scripts/cash-sprint-prep.mjs [origin]
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const base = (process.argv[2] ?? "https://app.buildingcultureid.space").replace(/\/$/, "");

async function probe(path, expectCodes) {
  const url = `${base}${path}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  const ok = expectCodes.includes(res.status);
  console.log(`${ok ? "OK" : "FAIL"} ${path} → ${res.status} (want ${expectCodes.join("|")})`);
  return ok;
}

console.log(`\n=== Cash sprint prep: ${base} ===\n`);

const checks = [
  await probe("/api/agents/research?q=smoke", [402, 200]),
  await probe("/api/billing/stripe/health", [200]),
  await probe("/grant-proof", [200]),
  await probe("/wallet/packs", [200]),
  await probe("/docs/bcid", [200]),
  await probe("/auth/login", [200]),
  await probe("/ops/outreach", [200, 404]),
];

const stripeConfigured = Boolean(
  process.env.STRIPE_SECRET_KEY?.trim() ||
    (existsSync(resolve(root, "app/.env")) &&
      /^\s*STRIPE_SECRET_KEY=\S+/m.test(readFileSync(resolve(root, "app/.env"), "utf8"))),
);

console.log(`\nStripe: ${stripeConfigured ? "keys present locally" : "NOT configured — see docs/CASH_SPRINT_OPERATOR.md §3"}`);
console.log(`Operator checklist: docs/STRIPE_PAYMENTS.md`);
console.log(`Amplify copy: docs/CASH_SPRINT_AMPLIFY.md`);

const logPath = resolve(root, "proof-bundles/submission-log.txt");
const entry = `
--- ${new Date().toISOString()} ---
Cash sprint prep run (origin=${base})
Checks: ${checks.filter(Boolean).length}/${checks.length} passed
Stripe local: ${stripeConfigured ? "yes" : "no"}
Next: docs/CASH_SPRINT_OPERATOR.md (0G Hall, Guild apply, Chainlink email, outreach sends)
`;
appendFileSync(logPath, entry);

console.log(`\nAppended prep note to ${logPath}`);
process.exit(checks.every(Boolean) ? 0 : 1);
