import { useAccount } from "wagmi";
import type { Address } from "viem";
import type { WalletPrincipal } from "../server/principal.js";

/** Wagmi hook mirroring `WalletPrincipal` (FID is optional — set when integrating Farcaster auth). */
export function useWalletPrincipal(fid?: number): WalletPrincipal | null {
  const { address, chainId } = useAccount();
  if (!address || chainId === undefined) return null;
  return { address: address as Address, chainId, fid };
}
