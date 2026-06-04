import { base as viemBase, bsc as viemBsc } from "viem/chains";
import type { Chain } from "viem/chains";

const viteEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : ({} as ImportMetaEnv);

function bscHttpUrl(): string {
  const custom = viteEnv.VITE_BSC_HTTP_URL;
  if (custom?.trim()) return custom.trim();
  const key = viteEnv.VITE_4EVERLAND_BSC_API_KEY;
  if (key?.trim()) return `https://bsc-mainnet.4everland.org/v1/${key.trim()}`;
  return viemBsc.rpcUrls.default.http[0]!;
}

function baseHttpUrl(): string {
  const rpc = viteEnv.VITE_BASE_RPC_URL;
  return rpc?.trim() || viemBase.rpcUrls.default.http[0]!;
}

/** Base mainnet with optional RPC override from VITE_BASE_RPC_URL. */
export const base: Chain = viemBase;

/** BNB Smart Chain — use transport overrides in wagmi config for custom RPC. */
export const bsc: Chain = viemBsc;

export const cultureChains = [base, bsc] as const;

export type CultureChain = (typeof cultureChains)[number];

export function getCultureChain(chainId: number): CultureChain | undefined {
  return cultureChains.find((c) => c.id === chainId);
}

export function getBaseRpcUrl(): string {
  return baseHttpUrl();
}

export function getBscRpcUrl(): string {
  return bscHttpUrl();
}

export { viemBase, viemBsc };
