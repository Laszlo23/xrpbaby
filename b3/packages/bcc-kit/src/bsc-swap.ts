/**
 * BCC swap helpers — PancakeSwap V3 on BNB Smart Chain.
 * Uses bridged BCC OFT on BSC (1:1 with canonical Base token).
 */

import { BSC_CHAIN_ID } from "./bnb.js";

/** BCC OFT on BSC — set after deploy (same supply as Base, bridged 1:1). */
export const BCC_BSC_SWAP_TOKEN_DEFAULT = "" as const;

/** BSC mainnet WBNB. */
export const BSC_WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" as const;

/** BSC mainnet USDT (BEP-20). */
export const BSC_USDT_SWAP = "0x55d398326f99059fF775485246999027B3197955" as const;

/** PancakeSwap V3 Smart Router on BSC. */
export const PANCAKE_SWAP_ROUTER = "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4" as const;

/** PancakeSwap V3 QuoterV2 on BSC. */
export const PANCAKE_QUOTER_V2 = "0x78D78E420Da98ad378D407D4eD8803A6D37013d1" as const;

/** PancakeSwap V3 Factory on BSC. */
export const PANCAKE_V3_FACTORY = "0x0BFbCF9fa4f9C56B0F40a671Ad40E8275Dc091A3" as const;

/** Fee tiers to probe for BCC/WBNB on PancakeSwap V3. */
export const BCC_WBNB_FEE_TIERS = [10_000, 2_500, 500, 100] as const;

/** Fee tier for USDT/WBNB hop on BSC. */
export const USDT_WBNB_FEE = 500 as const;

export type BscSwapInput = "bnb" | "usdt";

export type HexAddress = `0x${string}`;

export const BSC_BCC_SWAP_CHAIN_ID = BSC_CHAIN_ID;

import { encodeV3Path } from "./swap.js";

export {
  erc20Abi,
  minAmountOut,
  quoterV2Abi,
  swapRouter02Abi,
  uniV3FactoryAbi,
  encodeV3Path,
  swapDeadline,
} from "./swap.js";

const ZERO_POOL = "0x0000000000000000000000000000000000000000";

/** USDT → WBNB → BCC path for PancakeSwap V3 exactInput. */
export function encodeUsdtToBccPath(
  bccToken: HexAddress,
  bccWbnbFee: number = BCC_WBNB_FEE_TIERS[0],
  usdtWbnbFee: number = USDT_WBNB_FEE,
): HexAddress {
  return encodeV3Path(
    [BSC_USDT_SWAP, BSC_WBNB, bccToken],
    [usdtWbnbFee, bccWbnbFee],
  );
}

export type GetPoolFn = (
  tokenA: HexAddress,
  tokenB: HexAddress,
  fee: number,
) => Promise<HexAddress | null | undefined>;

/** Resolve fee tier for BCC/WBNB PancakeSwap V3 pool. */
export async function resolveBscBccPoolFee(
  bccToken: HexAddress,
  getPool: GetPoolFn,
): Promise<number> {
  for (const fee of BCC_WBNB_FEE_TIERS) {
    const pool = await getPool(BSC_WBNB, bccToken, fee);
    if (pool && pool.toLowerCase() !== ZERO_POOL) return fee;
  }
  return BCC_WBNB_FEE_TIERS[0];
}

export type ExactInputSingleParams = {
  tokenIn: HexAddress;
  tokenOut: HexAddress;
  fee: number;
  recipient: HexAddress;
  amountIn: bigint;
  amountOutMinimum: bigint;
  sqrtPriceLimitX96: bigint;
};

/** Build params for BNB → BCC via WBNB pool (router receives native BNB as value). */
export function buildBnbToBccSwapParams(args: {
  bccToken: HexAddress;
  recipient: HexAddress;
  amountInWei: bigint;
  amountOutMinimum: bigint;
  fee: number;
}): ExactInputSingleParams {
  return {
    tokenIn: BSC_WBNB,
    tokenOut: args.bccToken,
    fee: args.fee,
    recipient: args.recipient,
    amountIn: args.amountInWei,
    amountOutMinimum: args.amountOutMinimum,
    sqrtPriceLimitX96: 0n,
  };
}

export type ExactInputParams = {
  path: HexAddress;
  recipient: HexAddress;
  amountIn: bigint;
  amountOutMinimum: bigint;
};

/** Build params for USDT → BCC multi-hop on BSC. */
export function buildUsdtToBccSwapParams(args: {
  bccToken: HexAddress;
  recipient: HexAddress;
  amountIn: bigint;
  amountOutMinimum: bigint;
  bccWbnbFee: number;
}): ExactInputParams {
  return {
    path: encodeUsdtToBccPath(args.bccToken, args.bccWbnbFee),
    recipient: args.recipient,
    amountIn: args.amountIn,
    amountOutMinimum: args.amountOutMinimum,
  };
}
