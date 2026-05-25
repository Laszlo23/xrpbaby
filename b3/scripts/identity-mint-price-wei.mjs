#!/usr/bin/env node
/**
 * Compute CultureLayerIdentity mintPrice wei for a target USD amount paid in ETH.
 * Usage:
 *   node scripts/identity-mint-price-wei.mjs
 *   node scripts/identity-mint-price-wei.mjs --usd 1.11 --eth-usd 3000
 *   ETH_USD=3200 node scripts/identity-mint-price-wei.mjs
 */
const TARGET_USD = Number(process.env.MINT_TARGET_USD ?? "1.11");
const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return fallback;
}

const usd = Number(arg("--usd", process.env.MINT_TARGET_USD ?? TARGET_USD));
const ethUsd = Number(arg("--eth-usd", process.env.ETH_USD ?? "3000"));

if (!Number.isFinite(usd) || usd <= 0) {
  console.error("Invalid USD target");
  process.exit(1);
}
if (!Number.isFinite(ethUsd) || ethUsd <= 0) {
  console.error("Invalid ETH_USD rate");
  process.exit(1);
}

const eth = usd / ethUsd;
const wei = BigInt(Math.floor(eth * 1e18));

console.log(`Target: ~$${usd} USD at $${ethUsd}/ETH`);
console.log(`ETH:    ${eth}`);
console.log(`Wei:    ${wei}`);
console.log(`MINT_PRICE_WEI=${wei}`);
