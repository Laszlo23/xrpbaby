import { BSC_BCC_SWAP_CHAIN_ID, type BscSwapInput } from "@bc/bcc-kit";
import { bsc } from "@/lib/chains";

export const DEFAULT_BSC_BCC_SWAP_SLIPPAGE_BPS = 50;

export const BSC_BCC_SWAP_CHAIN = bsc;

export const BSC_BCC_SWAP_EXPLORER = "https://bscscan.com";

export function bscBccSwapExplorerTx(hash: string): string {
  return `${BSC_BCC_SWAP_EXPLORER}/tx/${hash}`;
}

export function getBccBscOftAddress(): `0x${string}` | undefined {
  const raw =
    import.meta.env.VITE_BCC_BSC_OFT_ADDRESS?.trim() ||
    import.meta.env.VITE_BCC_BSC_TOKEN_ADDRESS?.trim();
  if (raw && raw.length === 42 && raw.startsWith("0x")) {
    return raw as `0x${string}`;
  }
  return undefined;
}

export function isBscSwapConfigured(): boolean {
  return Boolean(getBccBscOftAddress());
}

export function isValidBscSwapInput(input: BscSwapInput): input is BscSwapInput {
  return input === "bnb" || input === "usdt";
}

export { BSC_BCC_SWAP_CHAIN_ID };
