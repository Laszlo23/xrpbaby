import { useChainId } from "wagmi";

import { resolveBcdGenesisClaimAddress, resolveBcdTokenAddress } from "@bc/contracts-sdk";

const BASE_SEPOLIA_CHAIN_ID = 84532;

/** True when BCD token + genesis claim are known for the active chain. */
export function isBcdConfiguredForChain(chainId: number): boolean {
  const env =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env as Record<string, string | undefined>)
      : {};
  const token = resolveBcdTokenAddress(chainId, env);
  const genesis = resolveBcdGenesisClaimAddress(chainId, env);
  return Boolean(token && genesis);
}

export function useBcdConfigured(): boolean {
  const chainId = useChainId();
  return isBcdConfiguredForChain(chainId);
}

export function bcdStagingHint(chainId: number): string | null {
  if (chainId === BASE_SEPOLIA_CHAIN_ID && !isBcdConfiguredForChain(chainId)) {
    return "BCD contracts are not deployed on Base Sepolia yet. Use Base mainnet or run scripts/deploy-bcd-base-sepolia.sh.";
  }
  if (!isBcdConfiguredForChain(chainId)) {
    return "BCD contracts are not configured for this network.";
  }
  return null;
}
