#!/usr/bin/env tsx
/**
 * Run Grove marketing tick locally (cron / VPS — no HTTP required).
 *
 *   cd app && npm run grove:tick
 *   GROVE_AUTO_POST=1 npm run grove:tick
 *   npm run grove:tick -- --dry-run
 *   npm run grove:tick -- --pillar agent_proof
 */
import { loadAppEnv } from "./load-env";

loadAppEnv();

import { getPrisma } from "../src/server/db/prisma";
import { runGroveTick } from "../src/server/marketing/grove/tick";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

const dryRunFlag = process.argv.includes("--dry-run");
const pillar = arg("--pillar");
const attestationTxHash = arg("--attestation-tx");

async function main() {
  const prisma = getPrisma();
  const result = await runGroveTick(prisma, {
    dryRun: dryRunFlag,
    pillar,
    attestationTxHash,
  });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
