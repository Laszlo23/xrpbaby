import { formatEther } from "viem";

/** Product price: ~$1.11 USD, paid in ETH at on-chain `mintPrice`. */
export const IDENTITY_MINT_TARGET_USD = 1.11;

/** Default wei at $3,000/ETH — use `node scripts/identity-mint-price-wei.mjs` to refresh. */
export const IDENTITY_MINT_PRICE_WEI_DEFAULT = 370_000_000_000_000n;

export const IDENTITY_MAINNET_ADDRESS =
  "0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863" as const;

export const identityMintPriceTagline = `~$${IDENTITY_MINT_TARGET_USD} on Base (paid in ETH)`;

export const identityMintPriceShort = `~$${IDENTITY_MINT_TARGET_USD} in ETH`;

function trimEthDisplay(eth: string): string {
  return eth.replace(/\.?0+$/, "") || "0";
}

/** User-facing mint price: live ETH from chain + USD product price. */
export function formatIdentityMintPrice(wei: bigint | undefined): string {
  if (wei === undefined) return identityMintPriceTagline;
  const eth = trimEthDisplay(formatEther(wei));
  return `${eth} ETH (~$${IDENTITY_MINT_TARGET_USD})`;
}

export function formatIdentityMintPriceEthOnly(wei: bigint | undefined): string {
  if (wei === undefined) return "—";
  return `${trimEthDisplay(formatEther(wei))} ETH`;
}
