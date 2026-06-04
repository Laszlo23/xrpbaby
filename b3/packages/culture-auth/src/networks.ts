export type CultureNetworkId = "base" | "bsc";

export const DEFAULT_CULTURE_NETWORK_ID: CultureNetworkId = "base";

export const CULTURE_NETWORK_CHAIN_IDS: Record<CultureNetworkId, number> = {
  base: 8453,
  bsc: 56,
};

export function isCultureNetworkId(value: string): value is CultureNetworkId {
  return value === "base" || value === "bsc";
}

export function cultureNetworkIdFromChainId(chainId: number): CultureNetworkId | undefined {
  if (chainId === CULTURE_NETWORK_CHAIN_IDS.base) return "base";
  if (chainId === CULTURE_NETWORK_CHAIN_IDS.bsc) return "bsc";
  return undefined;
}

export const CULTURE_ACTIVE_NETWORK_STORAGE_KEY = "culture_active_network";
