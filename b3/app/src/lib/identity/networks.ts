import type { Chain } from "viem/chains";
import { base, baseSepolia } from "viem/chains";
import { base as appBase, bsc as appBsc } from "@/lib/chains";

const viteEnv =
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : ({} as ImportMetaEnv);

export type IdentityNetworkId = "base" | "bsc";

export type IdentityNetworkConfig = {
  id: IdentityNetworkId;
  chainId: number;
  chain: Chain;
  contractAddress: `0x${string}` | "";
  isConfigured: boolean;
  nativeSymbol: "ETH" | "BNB";
  chainLabel: string;
  explorerAddressUrl: (address: string) => string;
  explorerTxUrl: (hash: string) => string;
};

function parseAddress(raw: string | undefined): `0x${string}` | "" {
  const v = raw?.trim() ?? "";
  if (v.length === 42 && v.startsWith("0x")) return v as `0x${string}`;
  return "";
}

function buildBaseNetwork(): IdentityNetworkConfig {
  const chainId = Number(viteEnv.VITE_IDENTITY_CHAIN_ID ?? "8453");
  const chain = chainId === base.id ? appBase : baseSepolia;
  const contractAddress = parseAddress(viteEnv.VITE_IDENTITY_CONTRACT_ADDRESS);
  return {
    id: "base",
    chainId: chain.id,
    chain,
    contractAddress,
    isConfigured: contractAddress !== "",
    nativeSymbol: "ETH",
    chainLabel: chain.id === base.id ? "Base" : "Base Sepolia",
    explorerAddressUrl: (a) =>
      `https://${chain.id === base.id ? "basescan.org" : "sepolia.basescan.org"}/address/${a}`,
    explorerTxUrl: (h) =>
      `https://${chain.id === base.id ? "basescan.org" : "sepolia.basescan.org"}/tx/${h}`,
  };
}

function buildBscNetwork(): IdentityNetworkConfig {
  const chainId = Number(viteEnv.VITE_IDENTITY_BSC_CHAIN_ID ?? "56");
  const contractAddress = parseAddress(viteEnv.VITE_IDENTITY_BSC_CONTRACT_ADDRESS);
  return {
    id: "bsc",
    chainId,
    chain: appBsc,
    contractAddress,
    isConfigured: contractAddress !== "",
    nativeSymbol: "BNB",
    chainLabel: "BNB Chain",
    explorerAddressUrl: (a) => `https://bscscan.com/address/${a}`,
    explorerTxUrl: (h) => `https://bscscan.com/tx/${h}`,
  };
}

const REGISTRY: Record<IdentityNetworkId, IdentityNetworkConfig> = {
  base: buildBaseNetwork(),
  bsc: buildBscNetwork(),
};

export function listIdentityNetworks(): IdentityNetworkConfig[] {
  return [REGISTRY.base, REGISTRY.bsc];
}

export function getIdentityNetwork(id: IdentityNetworkId): IdentityNetworkConfig {
  return REGISTRY[id];
}

export function getIdentityNetworkByChainId(chainId: number): IdentityNetworkConfig | undefined {
  return listIdentityNetworks().find((n) => n.chainId === chainId);
}

export function isIdentityNetworkId(v: string): v is IdentityNetworkId {
  return v === "base" || v === "bsc";
}

export const DEFAULT_IDENTITY_NETWORK_ID: IdentityNetworkId = "base";
