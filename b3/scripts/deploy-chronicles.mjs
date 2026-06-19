#!/usr/bin/env node
/**
 * Deploy CultureChronicles1155 via Foundry and sync contracts-sdk.
 *
 * Required env: PRIVATE_KEY, TREASURY, RPC_URL (Base mainnet)
 * Optional: CHRONICLES_LAUNCH_HOURS (default 48), CHRONICLES_BASE_URI
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const b3Root = path.resolve(__dirname, "..");
const contractsRoot = path.join(b3Root, "contracts");

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", env: process.env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("==> forge build");
run("forge", ["build"], contractsRoot);

console.log("==> forge script DeployCultureChronicles.s.sol --broadcast");
run(
  "forge",
  [
    "script",
    "script/DeployCultureChronicles.s.sol:DeployCultureChroniclesScript",
    "--rpc-url",
    process.env.RPC_URL ?? "https://mainnet.base.org",
    "--broadcast",
    "-vvv",
  ],
  contractsRoot,
);

console.log("==> sync contracts-sdk");
run("node", [path.join(b3Root, "scripts/sync-contracts-sdk.mjs")], b3Root);

console.log("Done. Add CultureChronicles1155 address to contracts/deployments/8453.json and app/src/data/addresses.json");
