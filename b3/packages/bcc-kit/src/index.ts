/**
 * BCC token — shared, framework-agnostic constants and helpers.
 *
 * BCC is Building Culture's market token, fair-launched on Base. Holders can
 * pay with BCC for an 11.11% discount on priced features (identity mint, art
 * tickets, Places). The token only exists on Base, so the on-chain discount is
 * Base-only.
 */

/** BCC ERC-20 contract address on Base mainnet. */
export const BCC_ADDRESS = "0xb890a5289f789f1346032ccc1847939e855fab07" as const;

/** Base mainnet chain id (BCC is Base-only). */
export const BCC_CHAIN_ID = 8453 as const;

/** Token symbol for UI copy (ticker with $ prefix). */
export const BCC_SYMBOL = "$BCC" as const;

/** Uniswap swap deep-link that pre-selects BCC as the output token on Base. */
export const BCC_UNISWAP_URL =
  "https://app.uniswap.org/swap?outputCurrency=0xB890a5289F789f1346032Ccc1847939e855FAb07&chain=base" as const;

/** Main app in-app swap route (satellite apps can link here). */
export const BCC_IN_APP_SWAP_PATH = "/swap" as const;

/**
 * Discount applied when paying with BCC, in basis points.
 * 11.11% off => pay 8889/10000 of the list price (≈ 8/9, on-brand).
 */
export const BCC_DISCOUNT_BPS = 1111 as const;

/** Basis-point denominator. */
export const BPS_DENOMINATOR = 10_000n;

/** Multiplier (in bps) actually charged when paying with BCC. */
export const BCC_PAY_BPS = Number(BPS_DENOMINATOR) - BCC_DISCOUNT_BPS; // 8889

/**
 * Apply the BCC discount to an on-chain wei/integer amount.
 * Returns `amount * (10000 - discountBps) / 10000`, floored.
 */
export function bccDiscountedAmount(
  amount: bigint,
  discountBps: number = BCC_DISCOUNT_BPS,
): bigint {
  if (amount < 0n) throw new Error("amount must be non-negative");
  const payBps = BigInt(Number(BPS_DENOMINATOR) - discountBps);
  return (amount * payBps) / BPS_DENOMINATOR;
}

/**
 * Apply the BCC discount to a fiat/number amount (e.g. USD).
 * Rounds to the given number of decimals (default 2).
 */
export function bccDiscountedUsd(
  amount: number,
  discountBps: number = BCC_DISCOUNT_BPS,
  decimals = 2,
): number {
  if (amount < 0) throw new Error("amount must be non-negative");
  const payFraction = (Number(BPS_DENOMINATOR) - discountBps) / Number(BPS_DENOMINATOR);
  const factor = 10 ** decimals;
  return Math.round(amount * payFraction * factor) / factor;
}

/** Human label like "11.11% off with BCC". */
export const BCC_DISCOUNT_LABEL = `${(BCC_DISCOUNT_BPS / 100).toFixed(2)}% off with ${BCC_SYMBOL}`;

export {
  BASE_USDC,
  BASE_WETH,
  BCC_SWAP_CHAIN_ID,
  BCC_SWAP_TOKEN,
  BCC_WETH_FEE_TIERS,
  BCC_WETH_POOL,
  type BccSwapInput,
  type ExactInputParams,
  type ExactInputSingleParams,
  type GetPoolFn,
  type HexAddress,
  buildEthToBccSwapParams,
  buildUsdcToBccSwapParams,
  encodeUsdcToBccPath,
  encodeV3Path,
  erc20Abi,
  minAmountOut,
  quoterV2Abi,
  resolveBccPoolFee,
  swapDeadline,
  swapRouter02Abi,
  UNISWAP_QUOTER_V2,
  UNISWAP_SWAP_ROUTER,
  UNISWAP_V3_FACTORY,
  uniV3FactoryAbi,
  USDC_WETH_FEE,
} from "./swap.js";

export {
  SOLANA_NATIVE_MINT,
  SOLANA_USDC_MINT,
  buildDebridgeToBaseBccUrl,
  buildJumperSolToBccUrl,
  buildJupiterBridgeUrl,
  buildRangoSolToBccUrl,
  buildSolanaToBccRoutes,
  type BccSolanaBuyRoute,
  type BccSolanaBuyStep,
} from "./solana.js";
