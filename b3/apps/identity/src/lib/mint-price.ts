import { formatEther } from "viem";

/** Keep in sync with `app/src/lib/identity/mint-price.ts`. */
export const IDENTITY_MINT_TARGET_USD = 1.11;
export const IDENTITY_MINT_PRICE_WEI_DEFAULT = 370_000_000_000_000n;
export const IDENTITY_MAINNET_ADDRESS =
  "0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863" as const;
export const identityMintPriceTagline = `~$${IDENTITY_MINT_TARGET_USD} on Base (paid in ETH)`;
export const identityMintPriceShort = `~$${IDENTITY_MINT_TARGET_USD} in ETH`;

function trimEthDisplay(eth: string): string {
  return eth.replace(/\.?0+$/, "") || "0";
}

export function formatIdentityMintPrice(wei: bigint | undefined): string {
  if (wei === undefined) return identityMintPriceTagline;
  return `${trimEthDisplay(formatEther(wei))} ETH (~$${IDENTITY_MINT_TARGET_USD})`;
}
