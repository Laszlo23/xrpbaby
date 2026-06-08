#!/usr/bin/env node
/**
 * Complete 0G agent funding flow after Base ETH is sent to the deployer wallet.
 *
 * Base → 0G bridging is not available via a single headless API today.
 * When Base balance is sufficient, this script prints an Oku bridge link (one manual tx),
 * polls until native 0G ≥ target, then runs agent setup + inference probe.
 */
import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Wallet, JsonRpcProvider, formatEther, parseEther } from "ethers";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const deployEnv = path.join(root, "deploy/.env");
const contractsEnv = path.join(root, "contracts/.env");

const BASE_RPC = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const OG_RPC = process.env.OG_0G_RPC_URL || "https://evmrpc.0g.ai";
const BASE_CHAIN_ID = 8453;
const OG_CHAIN_ID = 16661;
const MIN_OG = Number(process.env.OG_AGENT_MIN_BALANCE ?? "3.5");
const MIN_BASE_ETH = Number(process.env.OG_BRIDGE_MIN_BASE_ETH ?? "0.015");
const POLL_MS = Number(process.env.OG_FUND_POLL_MS ?? "15000");
const POLL_MAX = Number(process.env.OG_FUND_POLL_MAX ?? "120");

function loadPrivateKey() {
  if (process.env.PRIVATE_KEY?.trim()) return process.env.PRIVATE_KEY.trim();
  if (!fs.existsSync(contractsEnv)) return null;
  for (const line of fs.readFileSync(contractsEnv, "utf8").split("\n")) {
    const m = line.match(/^PRIVATE_KEY=(.+)$/);
    if (m) return m[1].trim();
  }
  return null;
}

function okuBridgeUrl(address) {
  // Oku meta-aggregator — Base → 0G, receive native 0G or WETH then swap on hub
  return `https://oku.trade/bridge/zerog?fromChainId=${BASE_CHAIN_ID}&toChainId=${OG_CHAIN_ID}&toAddress=${address}`;
}

function hubSwapUrl() {
  return "https://hub.0g.ai/swap";
}

async function nativeBalance(rpc, address) {
  const provider = new JsonRpcProvider(rpc);
  const wei = await provider.getBalance(address);
  return Number(formatEther(wei));
}

function runSetup() {
  console.log("\n==> Running agent setup + inference probe");
  execSync(`bash "${path.join(root, "scripts/setup-agent-0g.sh")}"`, {
    stdio: "inherit",
    cwd: root,
  });
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const pk = loadPrivateKey();
  if (!pk) {
    console.error("Missing PRIVATE_KEY (contracts/.env or env)");
    process.exit(1);
  }

  const wallet = new Wallet(pk);
  const address = wallet.address;

  console.log("==> 0G agent funding orchestrator");
  console.log(`    wallet: ${address}`);
  console.log(`    need:   ≥${MIN_OG} native 0G on chain ${OG_CHAIN_ID}`);

  const [baseBal, ogBal] = await Promise.all([
    nativeBalance(BASE_RPC, address),
    nativeBalance(OG_RPC, address),
  ]);

  console.log(`    Base ETH:  ${baseBal.toFixed(6)}`);
  console.log(`    0G native: ${ogBal.toFixed(4)}`);

  if (ogBal >= MIN_OG) {
    console.log("\n✓ Sufficient 0G balance — proceeding to setup");
    runSetup();
    return;
  }

  const needMore = MIN_OG - ogBal;
  console.log(`\n    short by ~${needMore.toFixed(2)} 0G`);

  if (baseBal >= MIN_BASE_ETH) {
    console.log("\n==> Base ETH detected — bridge to 0G (one manual step)");
    console.log("    Open this link, connect the deployer wallet, bridge ETH → 0G:");
    console.log(`    ${okuBridgeUrl(address)}`);
    console.log("\n    If you receive WETH/USDC on 0G instead of native 0G, swap here:");
    console.log(`    ${hubSwapUrl()}`);
    console.log(`    Target: ≥${MIN_OG} native 0G on wallet ${address}`);
  } else {
    console.log(`\n==> Send ≥${MIN_BASE_ETH} ETH on Base to:`);
    console.log(`    ${address}`);
    console.log("    Then re-run: npm run complete:0g-agent");
    console.log("\n    Or send ≥3.5 native 0G directly on 0G Chain (skip bridge):");
    console.log(`    RPC ${OG_RPC}  chainId ${OG_CHAIN_ID}`);
    process.exit(1);
  }

  console.log(`\n==> Polling 0G balance every ${POLL_MS / 1000}s (max ${POLL_MAX} tries)...`);
  for (let i = 1; i <= POLL_MAX; i++) {
    await sleep(POLL_MS);
    const bal = await nativeBalance(OG_RPC, address);
    process.stdout.write(`\r    poll ${i}/${POLL_MAX}: ${bal.toFixed(4)} 0G`);
    if (bal >= MIN_OG) {
      console.log("\n✓ Target reached");
      runSetup();
      return;
    }
  }

  console.log("\n\nTimeout waiting for 0G balance. Complete the Oku bridge and re-run:");
  console.log("  npm run complete:0g-agent");
  process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
