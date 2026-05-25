#!/usr/bin/env node
/**
 * After `scripts/deploy-bcd-base-sepolia.sh`, write contracts/deployments/84532.json
 * from the latest DeployBCD broadcast on chain 84532.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const broadcastDir = path.join(
  root,
  "contracts",
  "broadcast",
  "DeployBCD.s.sol",
  "84532",
);
const outFile = path.join(root, "contracts", "deployments", "84532.json");

function findLatestRun() {
  if (!fs.existsSync(broadcastDir)) {
    console.error("No broadcast dir:", broadcastDir);
    process.exit(1);
  }
  const files = fs
    .readdirSync(broadcastDir)
    .filter((f) => f.endsWith(".json") && f.startsWith("run-"))
    .map((f) => ({ f, m: fs.statSync(path.join(broadcastDir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  const latest = files[0]?.f ?? "run-latest.json";
  return path.join(broadcastDir, latest);
}

function main() {
  const runPath = findLatestRun();
  const run = JSON.parse(fs.readFileSync(runPath, "utf8"));
  const contracts = {};
  for (const tx of run.transactions ?? []) {
    const name = tx.contractName;
    const addr = tx.contractAddress;
    if (name && addr && !contracts[name]) {
      contracts[name] = addr;
    }
  }
  if (!contracts.BuildingCultureDollar || !contracts.BCDGenesisClaim) {
    console.error("Broadcast missing BCD contracts. Found:", contracts);
    process.exit(1);
  }
  const payload = {
    chainId: 84532,
    name: "Base Sepolia",
    contracts,
    deployedAt: new Date().toISOString(),
    note: `Generated from ${path.relative(root, runPath)}`,
  };
  fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`);
  console.log("Wrote", outFile);
  console.log(contracts);
}

main();
