#!/usr/bin/env node
/**
 * Compute CultureLayerIdentity mintPrice wei for a target USD amount in native gas token.
 * Usage:
 *   node scripts/identity-mint-price-wei.mjs
 *   node scripts/identity-mint-price-wei.mjs --usd 1.11 --eth-usd 3000
 *   node scripts/identity-mint-price-wei.mjs --native bnb --bnb-usd 600
 *   ETH_USD=3200 node scripts/identity-mint-price-wei.mjs
 */
const TARGET_USD = Number(process.env.MINT_TARGET_USD ?? "1.11");
const args = process.argv.slice(2);

function arg(name, fallback) {
  const i = args.indexOf(name);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return fallback;
}

const native = (arg("--native", process.env.MINT_NATIVE ?? "eth") || "eth").toLowerCase();
const usd = Number(arg("--usd", process.env.MINT_TARGET_USD ?? TARGET_USD));

let spotUsd;
let nativeLabel;
if (native === "bnb" || native === "bsc") {
  spotUsd = Number(arg("--bnb-usd", process.env.BNB_USD ?? "600"));
  nativeLabel = "BNB";
} else {
  spotUsd = Number(arg("--eth-usd", process.env.ETH_USD ?? "3000"));
  nativeLabel = "ETH";
}

if (!Number.isFinite(usd) || usd <= 0) {
  console.error("Invalid USD target");
  process.exit(1);
}
if (!Number.isFinite(spotUsd) || spotUsd <= 0) {
  console.error(`Invalid ${nativeLabel}_USD rate`);
  process.exit(1);
}

const amount = usd / spotUsd;
const wei = BigInt(Math.floor(amount * 1e18));

console.log(`Target: ~$${usd} USD at $${spotUsd}/${nativeLabel}`);
console.log(`${nativeLabel}:  ${amount}`);
console.log(`Wei:    ${wei}`);
console.log(`MINT_PRICE_WEI=${wei}`);
