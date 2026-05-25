import { parseAbi } from "viem";

/** Minimal reads for holder checks (Genesis District & similar ERC-721s). */
export const erc721MinimalAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
]);
