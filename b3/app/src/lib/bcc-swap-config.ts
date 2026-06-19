import { BCC_SWAP_CHAIN_ID, type BccSwapInput } from "@bc/bcc-kit";
import { base } from "@/lib/chains";

/** Default slippage tolerance in basis points. */
export const DEFAULT_BCC_SWAP_SLIPPAGE_BPS = 50;

/** Suggested ETH amount for Privy card on-ramp (covers small swap + gas). */
export const DEFAULT_ONRAMP_ETH_AMOUNT = "0.02";

/** Suggested USDC amount for Privy card on-ramp. */
export const DEFAULT_ONRAMP_USDC_AMOUNT = "25";

export const BCC_SWAP_CHAIN = base;

export const BCC_SWAP_EXPLORER = "https://basescan.org";

export function bccSwapExplorerTx(hash: string): string {
  return `${BCC_SWAP_EXPLORER}/tx/${hash}`;
}

export function isValidSwapInput(input: BccSwapInput): input is BccSwapInput {
  return input === "eth" || input === "usdc";
}

export { BCC_SWAP_CHAIN_ID };
