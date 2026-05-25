import { base } from "viem/chains";
import { isBaseConfigured } from "@/lib/base-addresses";

/** Human label for the chain used by property listings. */
export function getListingsChainDisplayName(chainId: number): string {
  if (chainId === base.id) return "Base";
  return `Chain ${chainId}`;
}

/**
 * Chain used for /properties listings and share-token reads — Base mainnet only for production.
 */
export function getListingsChainId(): number {
  return base.id;
}

/** Registry + share factory set for Base deployment (`NEXT_PUBLIC_BASE_*`). */
export function areListingsConfigured(): boolean {
  return isBaseConfigured();
}
