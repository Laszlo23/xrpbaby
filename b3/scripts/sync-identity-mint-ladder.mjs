#!/usr/bin/env node
/**
 * Sync CultureLayerIdentity.mintPrice to the 77-mint USD ladder tier.
 *
 * Usage:
 *   node scripts/sync-identity-mint-ladder.mjs              # dry-run
 *   DRY_RUN=0 PRIVATE_KEY=0x... node scripts/sync-identity-mint-ladder.mjs
 *
 * Env: ETH_USD (default 3000), IDENTITY_CONTRACT_ADDRESS, VITE_RPC_URL / BASE_RPC_URL
 */
import { execSync } from "node:child_process";

const TIER_SIZE = 77;
const BASE_USD = 0.07;
const STEP_USD = 0.49;
const CAP_USD = 7.77;

const CONTRACT =
  process.env.IDENTITY_CONTRACT_ADDRESS?.trim() ||
  "0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863";
const RPC =
  process.env.BASE_RPC_URL?.trim() ||
  process.env.VITE_RPC_URL?.trim() ||
  "https://mainnet.base.org";
const ETH_USD = Number(process.env.ETH_USD ?? "3000");
const DRY_RUN = process.env.DRY_RUN !== "0" && process.env.DRY_RUN !== "false";

function tierIndex(totalMinted) {
  return Math.floor(Math.max(0, totalMinted) / TIER_SIZE);
}

function usdForTier(tier) {
  const raw = BASE_USD + tier * STEP_USD;
  return Math.min(CAP_USD, Math.round(raw * 100) / 100);
}

function weiForUsd(usd) {
  return BigInt(Math.floor((usd / ETH_USD) * 1e18));
}

function castCall(signature) {
  const out = execSync(
    `cast call ${CONTRACT} "${signature}" --rpc-url ${RPC}`,
    { encoding: "utf8" },
  ).trim();
  return out.split(/\s/)[0];
}

const totalMinted = Number(castCall("totalMinted()(uint256)"));
const currentWei = BigInt(castCall("mintPrice()(uint256)"));
const tier = tierIndex(totalMinted);
const targetUsd = usdForTier(tier);
const targetWei = weiForUsd(targetUsd);

console.log(JSON.stringify({
  contract: CONTRACT,
  rpc: RPC,
  ethUsd: ETH_USD,
  totalMinted,
  tier,
  targetUsd,
  currentWei: currentWei.toString(),
  targetWei: targetWei.toString(),
  dryRun: DRY_RUN,
}, null, 2));

if (currentWei === targetWei) {
  console.log("mintPrice already matches ladder tier — no tx needed.");
  process.exit(0);
}

if (DRY_RUN) {
  console.log("DRY_RUN=1 — set DRY_RUN=0 and PRIVATE_KEY to broadcast setMintPrice.");
  process.exit(0);
}

if (!process.env.PRIVATE_KEY?.trim()) {
  console.error("PRIVATE_KEY required for broadcast.");
  process.exit(1);
}

process.env.MINT_PRICE_WEI = targetWei.toString();
process.env.IDENTITY_CONTRACT_ADDRESS = CONTRACT;

execSync("bash scripts/set-identity-mint-price-onchain.sh", {
  stdio: "inherit",
  env: process.env,
});

console.log("Ladder sync complete.");
