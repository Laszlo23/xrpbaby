/**
 * BCC swap helpers — Uniswap V3 on Base (SwapRouter02 + QuoterV2).
 * Framework-agnostic; callers pass a pool lookup for fee-tier resolution.
 */

/** BCC ERC-20 on Base (mirrors index.ts — kept local to avoid circular imports). */
export const BCC_SWAP_TOKEN = "0xb890a5289f789f1346032ccc1847939e855fab07" as const;

export type HexAddress = `0x${string}`;

/** Base mainnet WETH. */
export const BASE_WETH = "0x4200000000000000000000000000000000000006" as const;

/** Base mainnet USDC. */
export const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

/** Uniswap V3 SwapRouter02 on Base. */
export const UNISWAP_SWAP_ROUTER =
  "0x2626664c2603336E57B271c5C0b26F421741e481" as const;

/** Uniswap V3 QuoterV2 on Base. */
export const UNISWAP_QUOTER_V2 = "0x61fFE014bA17989E743c5F6cB21bF9697530B8e0" as const;

/** Uniswap V3 factory on Base. */
export const UNISWAP_V3_FACTORY = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD" as const;

/** Known BCC/WETH pool (from deployments/bcc-8453.json). */
export const BCC_WETH_POOL =
  "0xbb1a4e26d908a8fdddcea5d634faaa47eb8959b78384af66fea0bf45732143fb" as const;

/** Fee tiers to probe for BCC/WETH (bps). */
export const BCC_WETH_FEE_TIERS = [10_000, 3_000, 500, 100] as const;

/** Fee tier for USDC/WETH hop on Base (common stable/ETH tier). */
export const USDC_WETH_FEE = 500 as const;

export type BccSwapInput = "eth" | "usdc";

export const quoterV2Abi = [
  {
    name: "quoteExactInputSingle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
  },
  {
    name: "quoteExactInput",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "path", type: "bytes" },
      { name: "amountIn", type: "uint256" },
    ],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96AfterList", type: "uint160[]" },
      { name: "initializedTicksCrossedList", type: "uint32[]" },
      { name: "gasEstimate", type: "uint256" },
    ],
  },
] as const;

export const swapRouter02Abi = [
  {
    name: "exactInputSingle",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    name: "exactInput",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "path", type: "bytes" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

export const uniV3FactoryAbi = [
  {
    name: "getPool",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" },
    ],
    outputs: [{ name: "pool", type: "address" }],
  },
] as const;

export const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

const ZERO_POOL = "0x0000000000000000000000000000000000000000";

/** Apply slippage tolerance (bps) to a quoted output amount. */
export function minAmountOut(amountOut: bigint, slippageBps: number): bigint {
  if (slippageBps < 0 || slippageBps > 10_000) {
    throw new Error("slippageBps must be between 0 and 10000");
  }
  return (amountOut * BigInt(10_000 - slippageBps)) / 10_000n;
}

/** Pack a Uniswap V3 multi-hop path: token + fee + token + fee + … */
export function encodeV3Path(tokens: readonly HexAddress[], fees: readonly number[]): HexAddress {
  if (tokens.length < 2) throw new Error("path requires at least two tokens");
  if (fees.length !== tokens.length - 1) {
    throw new Error("fees length must be tokens.length - 1");
  }
  let encoded = tokens[0].slice(2).toLowerCase();
  for (let i = 0; i < fees.length; i++) {
    encoded += fees[i].toString(16).padStart(6, "0");
    encoded += tokens[i + 1]!.slice(2).toLowerCase();
  }
  return `0x${encoded}` as HexAddress;
}

/** USDC → WETH → BCC path for exactInput / quoteExactInput. */
export function encodeUsdcToBccPath(
  bccWethFee: number = BCC_WETH_FEE_TIERS[0],
  usdcWethFee: number = USDC_WETH_FEE,
): HexAddress {
  return encodeV3Path(
    [BASE_USDC, BASE_WETH, BCC_SWAP_TOKEN],
    [usdcWethFee, bccWethFee],
  );
}

export type GetPoolFn = (
  tokenA: HexAddress,
  tokenB: HexAddress,
  fee: number,
) => Promise<HexAddress | null | undefined>;

/**
 * Resolve the fee tier for the BCC/WETH Uniswap V3 pool.
 * Tries known tiers in order; defaults to 10000 if none found.
 */
export async function resolveBccPoolFee(getPool: GetPoolFn): Promise<number> {
  for (const fee of BCC_WETH_FEE_TIERS) {
    const pool = await getPool(BASE_WETH, BCC_SWAP_TOKEN, fee);
    if (pool && pool.toLowerCase() !== ZERO_POOL) return fee;
  }
  return BCC_WETH_FEE_TIERS[0];
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

/** Build params for ETH → BCC via WETH pool (router receives native ETH as value). */
export function buildEthToBccSwapParams(args: {
  recipient: HexAddress;
  amountInWei: bigint;
  amountOutMinimum: bigint;
  fee: number;
}): ExactInputSingleParams {
  return {
    tokenIn: BASE_WETH,
    tokenOut: BCC_SWAP_TOKEN,
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

/** Build params for USDC → BCC multi-hop swap. */
export function buildUsdcToBccSwapParams(args: {
  recipient: HexAddress;
  amountIn: bigint;
  amountOutMinimum: bigint;
  bccWethFee: number;
}): ExactInputParams {
  return {
    path: encodeUsdcToBccPath(args.bccWethFee),
    recipient: args.recipient,
    amountIn: args.amountIn,
    amountOutMinimum: args.amountOutMinimum,
  };
}

/** Swap deadline: now + offset seconds (default 30 min). */
export function swapDeadline(offsetSec = 1800): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + offsetSec);
}

/** Base mainnet chain id for BCC swaps. */
export const BCC_SWAP_CHAIN_ID = 8453 as const;
