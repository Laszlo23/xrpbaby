#!/usr/bin/env node
/**
 * Non-interactive 0g-compute-cli config (~/.0g-compute-cli/config.json).
 * Reads PRIVATE_KEY from env or contracts/.env.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contractsEnv = path.join(root, "contracts/.env");

function loadPrivateKey() {
  if (process.env.PRIVATE_KEY?.trim()) return process.env.PRIVATE_KEY.trim();
  if (!fs.existsSync(contractsEnv)) return null;
  for (const line of fs.readFileSync(contractsEnv, "utf8").split("\n")) {
    const m = line.match(/^PRIVATE_KEY=(.+)$/);
    if (m) return m[1].trim();
  }
  return null;
}

function formatKey(key) {
  const k = key.startsWith("0x") ? key : `0x${key}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(k)) throw new Error("invalid PRIVATE_KEY format");
  return k;
}

const privateKey = loadPrivateKey();
if (!privateKey) {
  console.error("No PRIVATE_KEY in env or contracts/.env");
  process.exit(1);
}

const rpc =
  process.env.ZG_RPC_URL?.trim() ||
  process.env.OG_0G_RPC_URL?.trim() ||
  "https://evmrpc.0g.ai";

const configDir = path.join(os.homedir(), ".0g-compute-cli");
const configPath = path.join(configDir, "config.json");

let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch {
  /* fresh */
}

config.privateKey = formatKey(privateKey);
config.rpcEndpoint = rpc;
config.network = process.env.OG_COMPUTE_NETWORK?.trim().toLowerCase() === "testnet" ? "testnet" : "mainnet";
config.lastUpdated = new Date().toISOString();

fs.mkdirSync(configDir, { recursive: true });
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`✓ 0g-compute-cli configured (${configPath})`);
