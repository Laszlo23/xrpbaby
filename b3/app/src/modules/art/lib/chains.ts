import { base, baseSepolia } from "wagmi/chains";

/** Default to Base Sepolia for development; set VITE_CHAIN_ID=8453 for mainnet. */
export const targetChainId = Number(import.meta.env.VITE_CHAIN_ID ?? baseSepolia.id);

export const targetChain = targetChainId === base.id ? base : baseSepolia;

export const supportedChains = [base, baseSepolia] as const;

export const blockExplorerUrl =
  targetChainId === base.id ? "https://basescan.org" : "https://sepolia.basescan.org";
