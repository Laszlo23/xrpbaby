import { base, baseSepolia } from "viem/chains";

const chainId = Number(import.meta.env.VITE_CHAIN_ID || "84532");

export const appChain = chainId === base.id ? base : baseSepolia;

export const chainLabel =
  appChain.id === base.id ? ("Base mainnet" as const) : ("Base Sepolia" as const);

export const identityContractAddress = (import.meta.env.VITE_IDENTITY_CONTRACT_ADDRESS ||
  "") as `0x${string}`;

export const isContractConfigured =
  identityContractAddress.length === 42 &&
  identityContractAddress.startsWith("0x");

export const rpcUrl =
  import.meta.env.VITE_RPC_URL ||
  (appChain.id === base.id ? "https://mainnet.base.org" : "https://sepolia.base.org");

export const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

export const basescanUrl =
  appChain.id === base.id ? "https://basescan.org" : "https://sepolia.basescan.org";
