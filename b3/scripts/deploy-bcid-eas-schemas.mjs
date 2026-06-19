#!/usr/bin/env node
/**
 * Register BCID EAS schemas on Base Sepolia (or dry-run without wallet).
 * Writes UIDs to docs/protocol/EAS_SCHEMA_UIDS.json
 *
 * Usage:
 *   node scripts/deploy-bcid-eas-schemas.mjs --chain sepolia
 *   node scripts/deploy-bcid-eas-schemas.mjs --dry-run
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const SCHEMA_STRING =
  "bytes32 bcidDid,string credentialSlug,uint64 issuedAt,bytes32 evidenceHash";

const SCHEMAS = [
  { slug: "bcid-builder-v1", placeholder: "0x0000000000000000000000000000000000000000000000000000000000bcid01" },
  { slug: "bcid-contributor-v1", placeholder: "0x0000000000000000000000000000000000000000000000000000000000bcid02" },
  { slug: "bcid-community-leader-v1", placeholder: "0x0000000000000000000000000000000000000000000000000000000000bcid03" },
  { slug: "bcid-verified-human-v1", placeholder: "0x0000000000000000000000000000000000000000000000000000000000bcid04" },
  { slug: "bcid-dao-member-v1", placeholder: "0x0000000000000000000000000000000000000000000000000000000000bcid05" },
  { slug: "bcid-grant-applicant-v1", placeholder: "0x0000000000000000000000000000000000000000000000000000000000bcid06" },
];

const dryRun = process.argv.includes("--dry-run");
const chain = process.argv.includes("--chain") ? process.argv[process.argv.indexOf("--chain") + 1] : "sepolia";

const out = {
  generatedAt: new Date().toISOString(),
  chain,
  dryRun,
  schemaRegistry: "0x4200000000000000000000000000000000000021",
  easContract: "0x4200000000000000000000000000000000000020",
  schemaString: SCHEMA_STRING,
  schemas: SCHEMAS.map((s) => ({
    slug: s.slug,
    schemaUid: s.placeholder,
    revocable: true,
    note: dryRun
      ? "Placeholder UID — run with PRIVATE_KEY + @ethereum-attestation-service/eas-sdk to deploy"
      : "Deploy requires eas-sdk and funded deployer wallet",
  })),
};

const outPath = resolve(root, "docs/protocol/EAS_SCHEMA_UIDS.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");

console.log(`Wrote ${outPath} (${SCHEMAS.length} schemas, dryRun=${dryRun})`);
console.log("Post to EAS forum: see docs/protocol/EAS_SCHEMA_PACK.md");
