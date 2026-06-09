#!/usr/bin/env node
/**
 * Print copy-paste fields for grant portals (stdout).
 * Usage: node scripts/print-grant-submission-fields.mjs [proof-bundles/grant-proof-*.json]
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const applicant = JSON.parse(fs.readFileSync(path.join(root, "docs/GRANT_APPLICANT.json"), "utf8"));

let bundlePath = process.argv[2];
if (!bundlePath) {
  const dir = path.join(root, "proof-bundles");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("grant-proof-") && f.endsWith(".json"))
    .sort()
    .reverse();
  bundlePath = files[0] ? path.join(dir, files[0]) : null;
}

const bundle = bundlePath ? JSON.parse(fs.readFileSync(bundlePath, "utf8")) : null;
const summary = bundle?.verificationMatrix?.summary ?? applicant.verificationSnapshot;

const blocks = {
  contact_email: applicant.contact.email,
  contact_name: applicant.contact.name,
  grant_wallet: applicant.grantPayoutWallet.address,
  website: applicant.project.website,
  grant_proof_url: applicant.liveProof.grantVerifier,
  business_plan_url: applicant.liveProof.businessPlan ?? `${applicant.project.website}/plan`,
  og_proof_url: applicant.liveProof.ogAgentId,
  repo: applicant.project.repo,
  ops_budget_ask: applicant.opsBudgetAsk?.summary ?? "Production ops: RPC, hosting, AI/API credits",
  base_nomination: `Project: Building Culture (BUILDCHAIN)
Builder: ${applicant.contact.name} — ${applicant.contact.email}
Wallet (grant payout, Base): ${applicant.grantPayoutWallet.address}

Live verifier (${summary.pass ?? "?"} pass / ${summary.fail ?? 0} fail): ${applicant.liveProof.grantVerifier}
Business plan: ${applicant.liveProof.businessPlan ?? `${applicant.project.website}/plan`}
Repo: ${applicant.project.repo} (b3/)
Ask: 2–3 ETH retroactive for audit hardening + trading sidecar + ops runway (RPC, hosting, AI/API credits).`,
  og_guild_short: `BUILDCHAIN Agent ID (ERC-721) on 0G mainnet. Proof: ${applicant.liveProof.ogAgentId}
Contact: ${applicant.contact.email} | Wallet: ${applicant.grantPayoutWallet.address}`,
};

console.log("=== Grant submission fields (copy-paste) ===\n");
for (const [key, value] of Object.entries(blocks)) {
  console.log(`--- ${key} ---`);
  console.log(value);
  console.log("");
}
console.log("Full playbook: docs/GRANT_SUBMISSIONS.md");
console.log("Portal links:");
console.log("  Base: https://docs.base.org/get-started/get-funded");
console.log("  0G Guild: https://guild.0gfoundation.ai/apply");
console.log("  0G Hall: https://hall.0g.ai");
