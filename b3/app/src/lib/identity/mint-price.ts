import { formatEther } from "viem";
import type { IdentityNetworkId } from "@/lib/identity/networks";
import { getIdentityNetwork } from "@/lib/identity/networks";

/** Product price: ~$1.11 USD, paid in native gas token at on-chain `mintPrice`. */
export const IDENTITY_MINT_TARGET_USD = 1.11;

/** Default wei at $3,000/ETH — use `node scripts/identity-mint-price-wei.mjs` to refresh. */
export const IDENTITY_MINT_PRICE_WEI_DEFAULT = 370_000_000_000_000n;

export const IDENTITY_MAINNET_ADDRESS = "0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863" as const;

/** Set after BSC deploy — override via VITE_IDENTITY_BSC_CONTRACT_ADDRESS */
export const IDENTITY_BSC_MAINNET_ADDRESS = "" as const;

export const identityMintPriceTagline = `~$${IDENTITY_MINT_TARGET_USD} on Base or BNB Chain`;

export const identityMintPriceShort = `~$${IDENTITY_MINT_TARGET_USD} native`;

function trimNativeDisplay(amount: string): string {
  return amount.replace(/\.?0+$/, "") || "0";
}

export type MintPriceFormatOptions = {
  networkId?: IdentityNetworkId;
  symbol?: "ETH" | "BNB" | (string & {});
};

function resolveSymbol(opts?: MintPriceFormatOptions): string {
  if (opts?.symbol) return opts.symbol;
  const id = opts?.networkId ?? "base";
  return getIdentityNetwork(id).nativeSymbol;
}

/** User-facing mint price: live native amount from chain + USD product price. */
export function formatIdentityMintPrice(
  wei: bigint | undefined,
  opts?: MintPriceFormatOptions,
): string {
  const symbol = resolveSymbol(opts);
  const net = getIdentityNetwork(opts?.networkId ?? "base");
  if (wei === undefined) {
    return `~$${IDENTITY_MINT_TARGET_USD} on ${net.chainLabel} (paid in ${symbol})`;
  }
  const native = trimNativeDisplay(formatEther(wei));
  return `${native} ${symbol} (~$${IDENTITY_MINT_TARGET_USD})`;
}

export function formatIdentityMintPriceNativeOnly(
  wei: bigint | undefined,
  opts?: MintPriceFormatOptions,
): string {
  if (wei === undefined) return "—";
  const symbol = resolveSymbol(opts);
  return `${trimNativeDisplay(formatEther(wei))} ${symbol}`;
}

/** @deprecated Use formatIdentityMintPriceNativeOnly */
export function formatIdentityMintPriceEthOnly(wei: bigint | undefined): string {
  return formatIdentityMintPriceNativeOnly(wei, { symbol: "ETH" });
}
