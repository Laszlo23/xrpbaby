import {
  base as baseChain,
  baseSepolia as baseSepoliaChain,
  bsc as bscChain,
  type Chain as WagmiChain,
} from "wagmi/chains";
import { defineChain } from "viem";

function bsc4everlandHttpUrl(): string {
  const custom = import.meta.env.VITE_BSC_HTTP_URL as string | undefined;
  if (custom?.trim()) return custom.trim();
  const key = import.meta.env.VITE_4EVERLAND_BSC_API_KEY as string | undefined;
  if (key?.trim()) return `https://bsc-mainnet.4everland.org/v1/${key.trim()}`;
  return bscChain.rpcUrls.default.http[0];
}

/** B3 Mainnet — https://docs.b3.fun/protocol/network-setup */
export const b3Mainnet = defineChain({
  id: 8333,
  name: "B3 Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_B3_MAINNET_RPC_URL ?? "https://mainnet-rpc.b3.fun"] },
  },
  blockExplorers: {
    default: { name: "B3 Explorer", url: "https://explorer.b3.fun" },
  },
});

/** B3 Testnet */
export const b3Testnet = defineChain({
  id: 1993,
  name: "B3 Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_B3_TESTNET_RPC_URL ?? "https://testnet-rpc.b3.fun"] },
  },
  blockExplorers: {
    default: { name: "B3 Testnet Explorer", url: "https://testnet-explorer.b3.fun" },
  },
});

/** Base — optional public RPC override */
export const base: WagmiChain = {
  ...baseChain,
  rpcUrls: {
    ...baseChain.rpcUrls,
    default: {
      http: [import.meta.env.VITE_BASE_RPC_URL ?? baseChain.rpcUrls.default.http[0]],
    },
  },
};

/** Base Sepolia — optional public RPC override */
export const baseSepolia: WagmiChain = {
  ...baseSepoliaChain,
  rpcUrls: {
    ...baseSepoliaChain.rpcUrls,
    default: {
      http: [import.meta.env.VITE_BASE_SEPOLIA_RPC_URL ?? baseSepoliaChain.rpcUrls.default.http[0]],
    },
  },
};

/** BNB Smart Chain mainnet — optional 4everland or custom HTTP (see VITE_4EVERLAND_BSC_API_KEY). */
export const bsc: WagmiChain = {
  ...bscChain,
  rpcUrls: {
    ...bscChain.rpcUrls,
    default: {
      http: [bsc4everlandHttpUrl()],
    },
  },
};

export type SupportedB3Chain = typeof b3Mainnet | typeof b3Testnet;

export type EvmNetworkId = "base" | "base-sepolia" | "b3" | "b3-testnet" | "bsc";

export function parseEvmNetwork(): EvmNetworkId {
  const v = import.meta.env.VITE_EVM_NETWORK as string | undefined;
  if (v === "base") return "base";
  if (v === "base-sepolia") return "base-sepolia";
  if (v === "b3") return "b3";
  if (v === "b3-testnet") return "b3-testnet";
  if (v === "bsc" || v === "bnb") return "bsc";
  const legacy = import.meta.env.VITE_B3_NETWORK as string | undefined;
  if (legacy === "mainnet") return "b3";
  if (legacy === "testnet") return "b3-testnet";
  return "base";
}

export function networkIdToChain(network: EvmNetworkId): WagmiChain {
  switch (network) {
    case "base":
      return base;
    case "base-sepolia":
      return baseSepolia;
    case "b3":
      return b3Mainnet;
    case "b3-testnet":
      return b3Testnet;
    case "bsc":
      return bsc;
  }
}

/** Default chain for non-marketplace routes (driven by `VITE_EVM_NETWORK` / legacy B3 env). */
export function getDefaultChain(): WagmiChain {
  return networkIdToChain(parseEvmNetwork());
}

/** All chains available in the wallet. Base Sepolia is omitted unless `VITE_EVM_NETWORK=base-sepolia` (demo UX). */
export function getAllWagmiChains(): readonly WagmiChain[] {
  const net = parseEvmNetwork();
  const primary = [base, bsc, b3Testnet, b3Mainnet] as const;
  if (net === "base-sepolia") {
    return [baseSepolia, ...primary];
  }
  return primary;
}

export function getWagmiChainById(chainId: number): WagmiChain | undefined {
  return getAllWagmiChains().find((c) => c.id === chainId);
}

export function isBaseChainId(chainId: number): boolean {
  return chainId === base.id || chainId === baseSepolia.id;
}

export function isB3ChainId(chainId: number): boolean {
  return chainId === b3Mainnet.id || chainId === b3Testnet.id;
}

export function isBscChainId(chainId: number): boolean {
  return chainId === bsc.id;
}

/**
 * Chain ID where `VITE_BCD_TOKEN_ADDRESS` is deployed.
 * Defaults to **B3 mainnet (8333)** for legacy installs; set `8453` when BCD ERC-20 is on Base mainnet.
 */
export function parseBcdChainId(): number {
  const raw = import.meta.env.VITE_BCD_CHAIN_ID as string | undefined;
  if (raw?.trim()) {
    const n = Number(raw.trim());
    if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  }
  return b3Mainnet.id;
}

export function isBcdChain(chainId: number): boolean {
  return chainId === parseBcdChainId();
}

/** Short network name for wallet prompts (BCD balance). */
export function getBcdChainShortLabel(): string {
  const id = parseBcdChainId();
  if (id === base.id) return "Base";
  if (id === baseSepolia.id) return "Base Sepolia";
  if (id === b3Mainnet.id) return "B3";
  if (id === b3Testnet.id) return "B3 Testnet";
  if (id === bsc.id) return "BNB Chain";
  return `chain ${id}`;
}

export type MarketplaceNetworkId = "base" | "base-sepolia";

/** Chain where the thirdweb Marketplace contract is deployed. */
export function parseMarketplaceNetwork(): MarketplaceNetworkId {
  const v = import.meta.env.VITE_MARKETPLACE_NETWORK as string | undefined;
  if (v === "base-sepolia") return "base-sepolia";
  return "base";
}

export function getMarketplaceChain(): WagmiChain {
  return parseMarketplaceNetwork() === "base" ? base : baseSepolia;
}
