import { base } from "viem/chains";
import type { Chain } from "viem";

/** Default chain id for new SIWE messages when the wallet has not reported one yet (production: Base). */
export const SIWE_DEFAULT_CHAIN_ID = base.id;

/**
 * RPC + chain used to verify SIWE signatures. Must match the `chainId` embedded in the SIWE message.
 */
export function getSiweVerificationTransport(chainId: number): { chain: Chain; rpcUrl: string } {
  void chainId;
  return {
    chain: base,
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC?.trim() || "https://mainnet.base.org",
  };
}
