/**
 * One-off seller helper: create a Marketplace V3 direct listing for an NFT.
 *
 * Required env:
 *   THIRDWEB_SECRET_KEY — server SDK (same as x402; never commit)
 *   SELLER_PRIVATE_KEY — 0x… hex for the listing wallet (must hold the NFT)
 *
 * Contract / listing:
 *   MARKETPLACE_CONTRACT_ADDRESS — optional; falls back to VITE_MARKETPLACE_CONTRACT_ADDRESS
 *   ASSET_CONTRACT_ADDRESS, VITE_PIT_NFT_CONTRACT_ADDRESS, or VITE_BASE_PRIMARY_CONTRACT_ADDRESS — NFT collection
 *   CHAIN_ID — default 8453 (Base mainnet)
 *
 * Listing params:
 *   TOKEN_ID — bigint string, default "0"
 *   PRICE_PER_TOKEN — e.g. "0.01" (native ETH unless you extend this script for ERC20)
 *
 * Run (from b3/frontend):
 *   npx tsx scripts/pit-create-direct-listing.ts
 */
import { createThirdwebClient } from "thirdweb";
import { getContract, sendTransaction } from "thirdweb";
import { createListing } from "thirdweb/extensions/marketplace";
import { privateKeyToAccount } from "thirdweb/wallets";
import { defineChain } from "thirdweb";

function reqEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function pickAddr(...keys: string[]): `0x${string}` {
  for (const k of keys) {
    const v = process.env[k];
    if (v && /^0x[a-fA-F0-9]{40}$/.test(v)) return v as `0x${string}`;
  }
  throw new Error(`Set one of: ${keys.join(", ")}`);
}

async function main() {
  const secretKey = reqEnv("THIRDWEB_SECRET_KEY");
  const pk = reqEnv("SELLER_PRIVATE_KEY");
  const marketplace = pickAddr("MARKETPLACE_CONTRACT_ADDRESS", "VITE_MARKETPLACE_CONTRACT_ADDRESS");
  const asset = pickAddr(
    "ASSET_CONTRACT_ADDRESS",
    "VITE_PIT_NFT_CONTRACT_ADDRESS",
    "VITE_BASE_PRIMARY_CONTRACT_ADDRESS",
  );
  const chainId = Number(process.env.CHAIN_ID ?? "8453");
  const tokenId = BigInt(process.env.TOKEN_ID ?? "0");
  const pricePerToken = process.env.PRICE_PER_TOKEN ?? "0.001";

  const client = createThirdwebClient({ secretKey });
  const account = privateKeyToAccount({ client, privateKey: pk });
  const chain = defineChain(chainId);

  const contract = getContract({
    client,
    chain,
    address: marketplace,
  });

  const tx = createListing({
    contract,
    assetContractAddress: asset,
    tokenId,
    pricePerToken,
  });

  console.log("Sending createListing from", account.address, "on chain", chainId, "…");
  const result = await sendTransaction({ transaction: tx, account });
  console.log("Submitted:", result.transactionHash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
