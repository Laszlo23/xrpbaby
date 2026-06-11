#!/usr/bin/env node
/**
 * Seed BCC/WBNB pool on PancakeSwap V3 (BSC) after OFT deploy.
 *
 * Usage:
 *   node scripts/seed-bcc-pancakeswap-pool.mjs --dry-run
 *   PANCAKE_BNB_AMOUNT=0.05 BCC_BSC_OFT_ADDRESS=0x... node scripts/seed-bcc-pancakeswap-pool.mjs
 *
 * Env: BSC_RPC_URL, PRIVATE_KEY or PANCAKE_SEED_PRIVATE_KEY
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bsc } from "viem/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

config({ path: resolve(ROOT, "deploy/.env") });
config({ path: resolve(ROOT, "contracts/.env") });

const DRY_RUN = process.argv.includes("--dry-run");
const BCC_OFT = process.env.BCC_BSC_OFT_ADDRESS?.trim() || process.env.VITE_BCC_BSC_OFT_ADDRESS?.trim();
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const ROUTER = "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4";

const pk = process.env.PANCAKE_SEED_PRIVATE_KEY?.trim() || process.env.PRIVATE_KEY?.trim();
const rpc = process.env.BSC_RPC_URL?.trim() || "https://bsc-dataseed.binance.org";
const bnbAmount = parseEther(process.env.PANCAKE_BNB_AMOUNT ?? "0.01");

if (!BCC_OFT) {
  console.error("Set BCC_BSC_OFT_ADDRESS or VITE_BCC_BSC_OFT_ADDRESS (deploy BccOFT on BSC first)");
  process.exit(1);
}
if (!pk || !/^0x[a-fA-F0-9]{64}$/.test(pk)) {
  console.error("Set PANCAKE_SEED_PRIVATE_KEY or PRIVATE_KEY");
  process.exit(1);
}

const account = privateKeyToAccount(pk);
const publicClient = createPublicClient({ chain: bsc, transport: http(rpc) });
const walletClient = createWalletClient({ account, chain: bsc, transport: http(rpc) });

console.log("PancakeSwap BCC/WBNB seed");
console.log("  BCC OFT:", BCC_OFT);
console.log("  BNB side:", formatEther(bnbAmount));
console.log("  Signer:", account.address);
console.log("  Mode:", DRY_RUN ? "dry-run" : "live");

if (DRY_RUN) {
  console.log("\nDry-run OK — remove --dry-run to execute swaps + LP (implement LP step after pool exists).");
  process.exit(0);
}

const bnbBal = await publicClient.getBalance({ address: account.address });
if (bnbBal < bnbAmount) {
  console.error("Insufficient BNB:", formatEther(bnbBal));
  process.exit(1);
}

console.log("\nNext: swap BNB → BCC on PancakeSwap, then add liquidity via Pancake UI or npm script extension.");
console.log("Router:", ROUTER);
console.log("Update VITE_BCC_PANCAKE_POOL in .env after pool is created.");
