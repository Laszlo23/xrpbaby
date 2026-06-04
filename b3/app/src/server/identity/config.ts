import { base, baseSepolia } from "viem/chains";
import { bsc } from "viem/chains";

import type { IdentityNetworkId } from "@/lib/identity/networks";

export type IdentityServerConfig = {
  networkId: IdentityNetworkId;
  chain: typeof base | typeof baseSepolia | typeof bsc;
  chainId: number;
  contractAddress: `0x${string}`;
  rpcUrl: string;
  configured: boolean;
};

function env(key: string): string | undefined {
  return process.env[key] ?? (import.meta.env?.[key] as string | undefined);
}

function parseAddress(raw: string | undefined): `0x${string}` | "" {
  const v = raw?.trim() ?? "";
  if (v.length === 42 && v.startsWith("0x")) return v as `0x${string}`;
  return "";
}

function readNetworkId(): IdentityNetworkId {
  const q = env("IDENTITY_NETWORK")?.trim().toLowerCase();
  if (q === "bsc") return "bsc";
  const chainId = Number(
    env("VITE_IDENTITY_CHAIN_ID") ??
      env("VITE_IDENTITY_BSC_CHAIN_ID") ??
      env("VITE_EVM_CHAIN_ID") ??
      "8453",
  );
  if (chainId === 56) return "bsc";
  return "base";
}

export function getIdentityServerConfig(networkId?: IdentityNetworkId): IdentityServerConfig {
  const id = networkId ?? readNetworkId();

  if (id === "bsc") {
    const chainId = Number(env("VITE_IDENTITY_BSC_CHAIN_ID") ?? "56");
    const contractAddress = parseAddress(env("VITE_IDENTITY_BSC_CONTRACT_ADDRESS"));
    const rpcUrl =
      env("VITE_BSC_HTTP_URL")?.trim() ||
      env("VITE_BSC_RPC_URL")?.trim() ||
      "https://bsc-dataseed.binance.org";
    return {
      networkId: "bsc",
      chain: bsc,
      chainId,
      contractAddress:
        contractAddress || ("0x0000000000000000000000000000000000000000" as `0x${string}`),
      rpcUrl,
      configured: contractAddress !== "",
    };
  }

  const chainId = Number(env("VITE_IDENTITY_CHAIN_ID") ?? env("VITE_EVM_CHAIN_ID") ?? "8453");
  const chain = chainId === base.id ? base : baseSepolia;
  const contractAddress = parseAddress(env("VITE_IDENTITY_CONTRACT_ADDRESS"));
  const rpcUrl =
    env("VITE_BASE_RPC_URL")?.trim() ||
    (chain.id === base.id ? "https://mainnet.base.org" : "https://sepolia.base.org");

  return {
    networkId: "base",
    chain,
    chainId: chain.id,
    contractAddress:
      contractAddress || ("0x0000000000000000000000000000000000000000" as `0x${string}`),
    rpcUrl,
    configured: contractAddress !== "",
  };
}
