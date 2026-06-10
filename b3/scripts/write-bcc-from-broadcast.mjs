#!/usr/bin/env node
/**
 * Sync contracts/deployments/bcc-{chainId}.json from a Foundry broadcast run.
 *
 * Usage:
 *   node scripts/write-bcc-from-broadcast.mjs 8453 DeployBccRootsStaking.s.sol BccRootsStaking
 *   node scripts/write-bcc-from-broadcast.mjs 8453 DeployBccTwapOracle.s.sol BccTwapOracle
 *   node scripts/write-bcc-from-broadcast.mjs 8453 DeployMockBccOracle.s.sol MockBccUsdOracle
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chainId = Number(process.argv[2]);
const scriptName = process.argv[3];
const contractKey = process.argv[4];

if (!Number.isFinite(chainId) || !scriptName || !contractKey) {
  console.error(
    "Usage: node scripts/write-bcc-from-broadcast.mjs <chainId> <ScriptFile.s.sol> <RegistryKey>",
  );
  process.exit(1);
}

const broadcastDir = path.join(root, "contracts", "broadcast", scriptName, String(chainId));
const registryFile = path.join(root, "contracts", "deployments", `bcc-${chainId}.json`);

function findLatestRun() {
  if (!fs.existsSync(broadcastDir)) {
    console.error("No broadcast dir:", broadcastDir);
    process.exit(1);
  }
  const latest = path.join(broadcastDir, "run-latest.json");
  if (fs.existsSync(latest)) return latest;
  const files = fs
    .readdirSync(broadcastDir)
    .filter((f) => f.endsWith(".json") && f.startsWith("run-"))
    .map((f) => ({ f, m: fs.statSync(path.join(broadcastDir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  if (!files[0]) {
    console.error("No broadcast runs in:", broadcastDir);
    process.exit(1);
  }
  return path.join(broadcastDir, files[0].f);
}

function extractAddress(run, expectedName) {
  for (const tx of run.transactions ?? []) {
    if (tx.contractName === expectedName && tx.contractAddress) {
      return tx.contractAddress;
    }
  }
  return null;
}

function main() {
  const runPath = findLatestRun();
  const run = JSON.parse(fs.readFileSync(runPath, "utf8"));
  const address = extractAddress(run, contractKey);
  if (!address) {
    console.error(`Broadcast missing ${contractKey}. Transactions:`, run.transactions?.length ?? 0);
    process.exit(1);
  }

  const registry = fs.existsSync(registryFile)
    ? JSON.parse(fs.readFileSync(registryFile, "utf8"))
    : { chainId, name: chainId === 8453 ? "Base" : "Base Sepolia", contracts: {} };

  registry.contracts = registry.contracts ?? {};
  registry.contracts[contractKey] = address;
  registry.updatedAt = new Date().toISOString();
  registry.deployArtifact = path.relative(root, runPath);

  fs.writeFileSync(registryFile, `${JSON.stringify(registry, null, 2)}\n`);
  console.log(`Updated ${registryFile}`);
  console.log(`${contractKey}: ${address}`);
}

main();
