#!/usr/bin/env node
/**
 * Cross-check deployment JSON + app env contract addresses against Base bytecode.
 * Usage: node scripts/audit-contracts.mjs [--rpc URL]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const b3Root = path.resolve(__dirname, "..");
const RPC = process.argv.includes("--rpc")
  ? process.argv[process.argv.indexOf("--rpc") + 1]
  : process.env.BASE_RPC_URL || "https://mainnet.base.org";

const CHECKS = [
  { group: "Token", name: "BCC (canonical)", addr: "0xb890a5289f789f1346032ccc1847939e855fab07", minBytes: 1000 },
  { group: "Token", name: "BCD (legacy)", addr: "0xda64dceb00b88ee1b8f6168beb58f5a2a7226b72", minBytes: 1000 },
  { group: "Culture", name: "BCDGenesisClaim", addr: "0x2bae6b04d0d1c8016cc863509395b68eb0021f58", minBytes: 500 },
  { group: "Culture", name: "RaffleTicketCampaign", addr: "0xb1a88bf677400c23430b643a07229af832130ad8", minBytes: 500 },
  { group: "Culture", name: "AgentShareCampaign", addr: "0x130e320a386b1ff0228492ddd65c380131ba86e9", minBytes: 500 },
  { group: "Culture", name: "CulturePulseAnchor", addr: "0x503f8ad17c0fcdd84fbdbf7f51b41b39b02ebbae", minBytes: 200 },
  { group: "Genesis Vault", name: "GenesisVaultPass Phase0", addr: "0x39952f562279f8a6517ED9d36a1Ff9d495e4e38d", minBytes: 500 },
  { group: "Genesis Vault", name: "GenesisVaultPass Phase1", addr: "0x0fE8AE7f7207f8C04377cdD4A711A67811cf3a73", minBytes: 500 },
  { group: "Genesis Vault", name: "GenesisVaultPass Phase2", addr: "0x01B971794c4C5C265bc0326dE329e1f4c937C765", minBytes: 500 },
  { group: "BCC v2", name: "CultureLayerIdentityV2", addr: "0x9942095ab0a9512e432aeacd623e929cfb474058", minBytes: 1000 },
  { group: "BCC v2", name: "BuildingCultureHubV2", addr: "0x97FDaEaFDbEF34918CFD223549C3d1e98E95c7c3", minBytes: 1000 },
  { group: "BCC v2", name: "MockBccUsdOracle", addr: "0x46C96e0A459ea441873FA8c3077f42b5e1E9cB4f", minBytes: 100 },
  { group: "BCC v2", name: "BuildingCultureTicketV2", addr: "0x4F92e47Ab0f6f233Ffe76b2c3ddbF2729719C8D6", minBytes: 500 },
  { group: "Identity", name: "CultureLayerIdentity v1", addr: "0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863", minBytes: 1000 },
  { group: "Art", name: "BuildingCultureHub v1", addr: "0x698672950e7E43F52cA819CB4df67fFAde5a6dAC", minBytes: 500 },
  { group: "Art", name: "BuildingCultureTicket v1", addr: "0x2f10aAF159aeCf78d76a610b87210BF81775b62F", minBytes: 500 },
  { group: "Market", name: "thirdweb Marketplace", addr: "0x3af9EB7784C1843BD8385D1F41dE78d4B83AEcf4", minBytes: 1 },
  { group: "Places", name: "ComplianceRegistry", addr: "0xa655c0B0037699433F0692356a3A142956103B7a", minBytes: 500 },
  { group: "Places", name: "PropertyRegistry", addr: "0x5aca19274B17B97e38da9eA851d91F0CC59DafBf", minBytes: 500 },
  { group: "Places", name: "PropertyShareFactory", addr: "0x4CA708ca735bBA49D7B2383071EA7FA1B7BDC614", minBytes: 1000 },
  { group: "Places", name: "PrimaryShareSale P1", addr: "0xE37446E10a28eB2B188B02C6c8dF5d8e3b3d3b32", minBytes: 500 },
  { group: "Not deployed", name: "DailyCheckIn", addr: null, minBytes: 1 },
  { group: "Not deployed", name: "PrimaryShareSaleBcc", addr: null, minBytes: 1 },
  { group: "Not deployed", name: "BCDFixedPriceSale", addr: null, minBytes: 1 },
];

function readJson(rel) {
  const p = path.join(b3Root, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function collectFromDeployments() {
  const mismatches = [];
  const files = [
    "contracts/deployments/8453.json",
    "contracts/deployments/bcc-8453.json",
    "apps/places/deployments/base-mainnet.json",
  ];
  for (const f of files) {
    const j = readJson(f);
    if (!j) continue;
    const flat = { ...(j.contracts ?? {}), bccToken: j.bccToken };
    if (f.includes("8453.json") && !f.includes("bcc")) {
      const bcc = readJson("contracts/deployments/bcc-8453.json")?.bccToken;
      if (
        flat.BuildingCultureDollar &&
        bcc &&
        flat.BuildingCultureDollar.toLowerCase() !== bcc.toLowerCase() &&
        flat.BuildingCultureDollar.toLowerCase() === "0xda64dceb00b88ee1b8f6168beb58f5a2a7226b72"
      ) {
        mismatches.push({
          file: f,
          field: "BuildingCultureDollar",
          note: "8453.json lists legacy BCD; app uses BCC from bcc-8453.json",
        });
      }
    }
  }
  return mismatches;
}

async function codeSize(addr) {
  if (!addr) return 0;
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getCode",
      params: [addr, "latest"],
    }),
  });
  const json = await res.json();
  const hex = json.result ?? "0x";
  if (hex === "0x" || hex === "0x0") return 0;
  return (hex.length - 2) / 2;
}

async function main() {
  console.log(`Contract audit — RPC: ${RPC}\n`);
  let fail = 0;
  let warn = 0;

  for (const c of CHECKS) {
    if (!c.addr) {
      console.log(`SKIP  [${c.group}] ${c.name} — not configured / not deployed`);
      warn++;
      continue;
    }
    const size = await codeSize(c.addr);
    const ok = size >= c.minBytes;
    const tag = ok ? "OK   " : "FAIL ";
    if (!ok) fail++;
    console.log(`${tag} [${c.group}] ${c.name}`);
    console.log(`       ${c.addr} (${size} bytes)`);
  }

  const manifestNotes = collectFromDeployments();
  if (manifestNotes.length) {
    console.log("\nManifest notes:");
    for (const m of manifestNotes) {
      console.log(`  WARN ${m.file}: ${m.field} — ${m.note}`);
      warn++;
    }
  }

  console.log("\nEnv-only (verify in app/.env):");
  console.log("  VITE_DAILY_CHECKIN_ADDRESS — missing");
  console.log("  VITE_BCD_SALE_ADDRESS — missing");
  console.log("  VITE_PLACES_BCC_SALE_ADDRESS — missing");
  console.log("\nPairing:");
  console.log("  BCDGenesisClaim mints legacy BCD (0xda64…), not BCC (0xb890…)");
  console.log("  App VITE_BCC_TOKEN_ADDRESS should stay on BCC; genesis balance reads need legacy BCD if shown.");

  console.log(`\nSummary: ${fail} failed bytecode checks, ${warn} skips/warnings`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
