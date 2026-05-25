import type { Address } from "viem";
import { resolvePitNftContractAddress } from "@bc/contracts-sdk";
import { getDefaultChain } from "@/lib/chains";

function env(): Record<string, string | undefined> {
  return import.meta.env as Record<string, string | undefined>;
}

/**
 * PIT NFT (or primary Base contract) used for marketplace / profile surfaces.
 * Uses `VITE_PIT_NFT_CONTRACT_ADDRESS`, or falls back to `VITE_BASE_PRIMARY_CONTRACT_ADDRESS`
 */
export function getPitNftContractAddress(): Address | undefined {
  return resolvePitNftContractAddress(getDefaultChain().id, env());
}

export function describePitNftContract(): string {
  const addr = getPitNftContractAddress();
  if (!addr) return "not configured";
  return addr;
}

export function pitNftContractShort(addr: Address | undefined): string {
  const pit = getPitNftContractAddress();
  if (!pit || !addr) return "—";
  if (pit.toLowerCase() !== addr.toLowerCase()) return "custom";
  return "default";
}

/** Human label for the featured marketplace collection (see `VITE_FEATURED_COLLECTION_LABEL`). */
export function getFeaturedCollectionLabel(): string {
  const v = import.meta.env.VITE_FEATURED_COLLECTION_LABEL as string | undefined;
  const t = v?.trim();
  return t || "OBC";
}

function thirdwebExploreSlugForChain(chainId: number): string {
  if (chainId === 8453) return "base";
  if (chainId === 84532) return "base-sepolia";
  if (chainId === 56) return "bnb-chain";
  return `chain-${chainId}`;
}

/** thirdweb.com collection URL for the configured PIT / primary contract, when an address exists. */
export function getFeaturedCollectionThirdwebUrl(): string | undefined {
  const addr = getPitNftContractAddress();
  if (!addr) return undefined;
  const slug = thirdwebExploreSlugForChain(getDefaultChain().id);
  return `https://thirdweb.com/${slug}/${addr}`;
}

/** True when the listing asset contract matches the configured featured / PIT collection. */
export function isPitAsset(address: string | undefined): boolean {
  if (!address) return false;
  const pit = getPitNftContractAddress();
  if (!pit) return false;
  return pit.toLowerCase() === address.toLowerCase();
}
