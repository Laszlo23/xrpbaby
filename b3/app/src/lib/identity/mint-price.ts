import { formatEther } from "viem";
import type { IdentityNetworkId } from "@/lib/identity/networks";
import { getIdentityNetwork } from "@/lib/identity/networks";
import {
  IDENTITY_MINT_BASE_USD,
  IDENTITY_MINT_CAP_USD,
  IDENTITY_MINT_LADDER_RANGE_LABEL,
  formatTierUsd,
  ladderSummary,
  usdPriceForTotalMinted,
  weiForUsdPrice,
} from "@/lib/identity/mint-ladder";

/** @deprecated Use ladder tier USD via usdPriceForTotalMinted. Kept for sample-mint API compat. */
export const IDENTITY_MINT_TARGET_USD = IDENTITY_MINT_BASE_USD;

/** Default wei at tier 0, $3,000/ETH — keeper refreshes on-chain. */
export const IDENTITY_MINT_PRICE_WEI_DEFAULT = weiForUsdPrice(IDENTITY_MINT_BASE_USD);

export const IDENTITY_MAINNET_ADDRESS = "0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863" as const;

/** Set after BSC deploy — override via VITE_IDENTITY_BSC_CONTRACT_ADDRESS */
export const IDENTITY_BSC_MAINNET_ADDRESS = "" as const;

export const identityMintPriceTagline = `${IDENTITY_MINT_LADDER_RANGE_LABEL} on Base or BNB Chain`;

export const identityMintPriceShort = `${IDENTITY_MINT_LADDER_RANGE_LABEL} native`;

export { IDENTITY_MINT_LADDER_RANGE_LABEL };

function trimNativeDisplay(amount: string): string {
  return amount.replace(/\.?0+$/, "") || "0";
}

export type MintPriceFormatOptions = {
  networkId?: IdentityNetworkId;
  symbol?: "ETH" | "BNB" | (string & {});
  /** Current on-chain totalMinted — drives tier USD in labels. */
  totalMinted?: number;
  /** Override USD label when tier is known. */
  tierUsd?: number;
};

function resolveSymbol(opts?: MintPriceFormatOptions): string {
  if (opts?.symbol) return opts.symbol;
  const id = opts?.networkId ?? "base";
  return getIdentityNetwork(id).nativeSymbol;
}

function resolveTierUsd(opts?: MintPriceFormatOptions): number {
  if (opts?.tierUsd !== undefined) return opts.tierUsd;
  if (opts?.totalMinted !== undefined) return usdPriceForTotalMinted(opts.totalMinted);
  return IDENTITY_MINT_BASE_USD;
}

/** User-facing mint price: live native amount from chain + ladder USD tier. */
export function formatIdentityMintPrice(
  wei: bigint | undefined,
  opts?: MintPriceFormatOptions,
): string {
  const symbol = resolveSymbol(opts);
  const net = getIdentityNetwork(opts?.networkId ?? "base");
  const tierUsd = resolveTierUsd(opts);
  const usdLabel = formatTierUsd(tierUsd);

  if (wei === undefined) {
    return `${IDENTITY_MINT_LADDER_RANGE_LABEL} on ${net.chainLabel} (paid in ${symbol})`;
  }
  const native = trimNativeDisplay(formatEther(wei));
  return `${native} ${symbol} (${usdLabel})`;
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

export function formatIdentityMintLadderUrgency(totalMinted: number): string {
  const summary = ladderSummary(totalMinted);
  if (summary.atCap) {
    return `${formatTierUsd(summary.tierUsd)} per mint — ladder cap reached`;
  }
  return `${summary.mintsLeftInTier} mints left at ${formatTierUsd(summary.tierUsd)}`;
}

export {
  ladderSummary,
  usdPriceForTotalMinted,
  weiForUsdPrice,
  formatTierUsd,
  IDENTITY_MINT_CAP_USD,
  IDENTITY_MINT_BASE_USD,
} from "@/lib/identity/mint-ladder";
