import { parseAbi } from "viem";

/** Block explorer base URL (no trailing slash). Production defaults to Base; override with `NEXT_PUBLIC_EXPLORER`. */
export const explorerBase =
  process.env.NEXT_PUBLIC_EXPLORER ?? "https://basescan.org";

const zero = "0x0000000000000000000000000000000000000000" as const;

/** Set in `.env.local` after `forge script script/DeployAll.s.sol` */
export const addresses = {
  registry:
    (process.env.NEXT_PUBLIC_REGISTRY as `0x${string}` | undefined) ?? zero,
  shareFactory:
    (process.env.NEXT_PUBLIC_SHARE_FACTORY as `0x${string}` | undefined) ?? zero,
  compliance:
    (process.env.NEXT_PUBLIC_COMPLIANCE_REGISTRY as `0x${string}` | undefined) ?? zero,
  weth: (process.env.NEXT_PUBLIC_WETH as `0x${string}` | undefined) ?? zero,
  router: (process.env.NEXT_PUBLIC_ROUTER as `0x${string}` | undefined) ?? zero,
  lendingPool:
    (process.env.NEXT_PUBLIC_LENDING_POOL as `0x${string}` | undefined) ?? zero,
  predictionMarket:
    (process.env.NEXT_PUBLIC_PREDICTION_MARKET as `0x${string}` | undefined) ?? zero,
  proofNft:
    (process.env.NEXT_PUBLIC_PROOF_NFT as `0x${string}` | undefined) ?? zero,
  staking: (process.env.NEXT_PUBLIC_STAKING as `0x${string}` | undefined) ?? zero,
  guestbook: (process.env.NEXT_PUBLIC_GUESTBOOK as `0x${string}` | undefined) ?? zero,
};

export const accessControlAbi = parseAbi([
  "function hasRole(bytes32 role, address account) view returns (bool)",
]);

export const complianceAdminAbi = parseAbi([
  "function setWalletStatus(address wallet, uint8 status)",
]);

export const ogStakingAbi = parseAbi([
  "function stake() payable",
  "function getReward()",
  "function requestUnstake(uint256 amount)",
  "function completeUnstake()",
  "function notifyRewardAmount(uint256 duration) payable",
  "function balanceOf(address) view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function earned(address) view returns (uint256)",
  "function pendingWithdraw(address) view returns (uint256)",
  "function unlockTime(address) view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "function periodFinish() view returns (uint256)",
  "function lastUpdateTime() view returns (uint256)",
  "function rewardPerToken() view returns (uint256)",
  "function cooldownPeriod() view returns (uint256)",
  "function rewards(address) view returns (uint256)",
]);

export const complianceAbi = parseAbi([
  "function isVerified(address wallet) view returns (bool)",
  "function statusOf(address wallet) view returns (uint8)",
  "function kycBypass() view returns (bool)",
]);

export const registryAbi = parseAbi([
  "function nextPropertyId() view returns (uint256)",
  "function propertyExists(uint256 propertyId) view returns (bool)",
]);

export const routerAbi = parseAbi([
  "function getPair(address tokenA, address tokenB) view returns (address)",
  "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) pure returns (uint256)",
  "function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB)",
  "function removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) returns (uint256 amountToken, uint256 amountETH)",
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address tokenIn, address tokenOut, address to, uint256 deadline) returns (uint256 amountOut)",
  "function swapExactETHForTokens(uint256 amountOutMin, address tokenOut, address to, uint256 deadline) payable returns (uint256 amountOut)",
  "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address tokenIn, address to, uint256 deadline) returns (uint256 amountOut)",
]);

export const pairAbi = parseAbi([
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function totalSupply() view returns (uint256)",
]);

export const shareFactoryAbi = parseAbi([
  "function tokenByPropertyId(uint256 propertyId) view returns (address)",
]);

export const erc20Abi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

export const lendingPoolAbi = parseAbi([
  "function collateralOf(address user) view returns (uint256)",
  "function debtOf(address user) view returns (uint256)",
  "function depositCollateral(uint256 amount)",
  "function withdrawCollateral(uint256 amount)",
  "function borrow(uint256 wethAmount)",
  "function repay(uint256 wethAmount)",
  "function maxBorrow(address user) view returns (uint256)",
  "function liquidatable(address user) view returns (bool)",
  "function COLLATERAL() view returns (address)",
  "function WETH() view returns (address)",
]);

export const proofNftAbi = parseAbi([
  "function claim(uint256 propertyId)",
  "function propertyOf(uint256 tokenId) view returns (uint256)",
  "function claimed(address holder, uint256 propertyId) view returns (bool)",
]);

export const predictionAbi = parseAbi([
  "function nextMarketId() view returns (uint256)",
  "function markets(uint256 id) view returns (string question, uint256 endTime, address stakeToken, uint256 yesPool, uint256 noPool, bool resolved, bool outcomeYes)",
  "function stakeYes(uint256 id, uint256 amount)",
  "function stakeNo(uint256 id, uint256 amount)",
]);

export const guestbookAbi = parseAbi([
  "function leaveEntry(string message, string xHandle, string linkedin, string farcaster)",
  "function entryCount() view returns (uint256)",
  "function lastEntryAt(address user) view returns (uint256)",
  "function lastEntries(uint256 maxItems) view returns (address[] authors, uint64[] timestamps, string[] messages, string[] xHandles, string[] linkedins, string[] farcasters)",
  "function getEntry(uint256 index) view returns (address author, uint64 timestamp, string message, string xHandle, string linkedin, string farcaster)",
]);

/** [`PrimaryShareSaleERC20`](../src/PrimaryShareSaleERC20.sol) — fixed ERC-20 price per whole share */
export const primaryShareSaleErc20Abi = parseAbi([
  "function shareToken() view returns (address)",
  "function paymentToken() view returns (address)",
  "function seller() view returns (address)",
  "function pricePerShare() view returns (uint256)",
  "function buyWholeShares(uint256 wholeShares)",
]);
