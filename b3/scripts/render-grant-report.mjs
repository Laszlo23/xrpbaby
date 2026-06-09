#!/usr/bin/env node
/**
 * Render grant-proof JSON into grant-application-ready markdown.
 * Usage: node scripts/render-grant-report.mjs <input.json> [output.md]
 */
import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2];
const outputPath =
  process.argv[3] ||
  inputPath.replace(/\.json$/i, ".md").replace("grant-proof-", "grant-verification-");

if (!inputPath) {
  console.error("Usage: node scripts/render-grant-report.mjs <input.json> [output.md]");
  process.exit(1);
}

const bundle = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const origin = bundle.baseOrigin || "https://app.buildingcultureid.space";
const matrix = bundle.verificationMatrix?.checks || [];
const addresses = bundle.addresses?.networks?.["8453"] || {};
const explorer = addresses.explorer || "https://basescan.org";

function explorerLink(addr) {
  if (!addr) return "—";
  return `[${addr}](${explorer}/address/${addr})`;
}

function statusIcon(s) {
  if (s === "pass") return "PASS";
  if (s === "warn") return "WARN";
  return "FAIL";
}

const onChainRows = [
  ["CultureLayerIdentity", addresses.identity?.CultureLayerIdentity],
  ["BCC (BuildingCultureDollar)", addresses.bcc?.BCC || addresses.culture?.BuildingCultureDollar],
  ["PropertyRegistry", addresses.places?.PropertyRegistry],
  ["PropertyShareFactory", addresses.places?.PropertyShareFactory],
  ["ComplianceRegistry", addresses.places?.ComplianceRegistry],
  ["CulturePulseAnchor", addresses.culture?.CulturePulseAnchor],
];

const checksTable = matrix
  .map(
    (c) =>
      `| ${c.label} | ${statusIcon(c.status)} | ${c.detail || "—"} |`,
  )
  .join("\n");

const testSnap = bundle.testGateSnapshot;
const testLine = testSnap
  ? `Last local gate run (${testSnap.updated}): ${testSnap.packages?.unit ?? "?"} package unit tests, ${testSnap.forge?.contracts ?? "?"} forge contracts, ${testSnap.forge?.places ?? "?"} forge places, ${testSnap.app?.playwright ?? "?"} Playwright smoke.`
  : "Local test counts: see docs/TEST_GATE_SNAPSHOT.json (update after full CI/local gate run).";

const md = `# Grant verification report — Building Culture

Generated: **${bundle.generatedAtUtc}**  
Origin: **${origin}**  
Public live verifier: **[${origin}/grant-proof](${origin}/grant-proof)**

---

## Executive summary

Building Culture is a live web3 product on **Base mainnet** with on-chain identity (CultureLayerIdentity), culture token (BCC), fractional real-estate rails (Places), 0G AgentId proof, Telegram Mini App, and community impact surfaces (Forest, Join, Signal). This report bundles automated production checks, on-chain address index, and honest scope boundaries for ecosystem grants, social-impact programs, and investor due diligence.

${testLine}

---

## Verify in 5 minutes

1. Open **[${origin}/grant-proof](${origin}/grant-proof)** — live pass/warn grid and downloadable JSON.
2. Confirm Base contracts on Basescan (table below).
3. Open **[0G AgentId proof](${bundle.audience?.ecosystem?.ogAgentId?.proofUrl})** — contract \`0x0451b1d37058ad57df22d7185aabc6b0a36fc41e\`.
4. Run locally: \`npm run grant:verify\` (full gates) or \`npm run grant:proof\` (bundle + this report).
5. Read scope boundaries — do not treat demo/testnet items as production TVL or securities offerings.

---

## On-chain proof (Base mainnet, chain 8453)

| Contract | Address |
|----------|---------|
${onChainRows.map(([name, addr]) => `| ${name} | ${explorerLink(addr)} |`).join("\n")}

0G AgentId: [${bundle.audience?.ecosystem?.ogAgentId?.contract}](${bundle.audience?.ecosystem?.ogAgentId?.explorer})

---

## Automated gate results

| Check | Status | Detail |
|-------|--------|--------|
${checksTable || "| (no matrix) | — | — |"}

Summary: **${bundle.verificationMatrix?.summary?.pass ?? 0} pass**, **${bundle.verificationMatrix?.summary?.warn ?? 0} warn**, **${bundle.verificationMatrix?.summary?.fail ?? 0} fail**

---

## Honest scope boundaries

| Item | Status |
|------|--------|
| Base mainnet bytecode | Verified when \`contracts:audit\` passes |
| 0G AgentId | Live on 0G Chain mainnet — proof page linked above |
| Trading agent sidecar | ${bundle.scopeBoundaries?.tradingAgent || "May warn until deployed"} |
| Grove X / Farcaster | ${bundle.scopeBoundaries?.groveSocial || "Optional until credentials set"} |
| Full economics | ${bundle.scopeBoundaries?.econLive || "ECON_LIVE=0"} |
| Legal | ${bundle.scopeBoundaries?.notLegalAdvice || "Not legal advice"} |

---

## Audience-specific blurbs (copy-paste)

### Base / ecosystem grants

Building Culture ships production contracts on Base: identity minting, BCC culture token, Places RWA registry/factory/compliance, pulse anchor, and marketplace integration. Live app at ${origin} with wallet auth, Telegram Mini App, and agent card at \`/.well-known/agent.json\`.

### 0G / agent infrastructure

BUILDCHAIN Agent ID is deployed on 0G Chain mainnet with an in-app judge proof lane. ERC-721 portable agent identity, ChainScan-verifiable deploy and mint txs.

### EU / social impact

Community surfaces — Forest, Join, Signal — provide onboarding and culture-receipt narratives for integration and newcomer programs. Live HTTP verification included in grant matrix; no claimed government funding in this pack.

### Angel / pre-seed investors

Treasury and product map: **[${origin}/investors](${origin}/investors)**. Fill \`manualRevenueProof\` in the JSON bundle for paid-transaction evidence.

---

## Suggested milestones (grant applications)

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M1 — Open source & docs | Repo, GRANT_READINESS_PACK, domain model | Target met |
| M2 — Mainnet deployment | Base contracts + synced ADDRESSES.json | Target met |
| M3 — UX & transparency | App, Places, legal/grant copy, /grant-proof | Target met |
| M4 — Hardening | External audit, trading sidecar, full ECON_LIVE | Roadmap |

---

## Budget template (fill per application)

| Line item | Amount | Notes |
|-----------|--------|-------|
| Engineering (contracts + app) | | |
| Security audit | | |
| Infrastructure (RPC, hosting) | | |
| Community / impact programs | | |
| Legal / compliance counsel | | |

---

## Related documentation

- [GRANT_READINESS_PACK.md](${bundle.docs?.grantReadinessPack})
- [0G_HACKATHON_JUDGE_README.md](${bundle.docs?.ogHackathonJudge})
- [apps/places/docs/grants.md](${bundle.docs?.placesGrants})
- [INVESTOR_PROOF_PLAYBOOK.md](${bundle.docs?.investorPlaybook})

---

*Technical verification artifact — not a securities disclosure or offer.*
`;

fs.writeFileSync(outputPath, md);
console.log(`Rendered: ${outputPath}`);
