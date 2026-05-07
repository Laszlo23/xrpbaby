import { useAccount, useReadContract } from "wagmi";
import { erc721MinimalAbi } from "@/lib/erc721-minimal-abi";
import {
  getDistinctLegacyGenesisDistrictAddress,
  getGenesisVaultPassPhase0Address,
  getGenesisVaultPassPhase1Address,
  getGenesisVaultPassPhase2Address,
  resolveHighestGenesisVaultTier,
  type GenesisVaultTier,
} from "@/lib/genesis-district-config";
import { getDefaultChain } from "@/lib/chains";

/** Shared on-chain reads for vault pass tier (Base / `getDefaultChain`). */
export function useGenesisVaultHighestTier(): {
  highestTier: GenesisVaultTier | null;
  isPending: boolean;
  holdsAny: boolean;
} {
  const { address } = useAccount();
  const deployChainId = getDefaultChain().id;
  const gvp0 = getGenesisVaultPassPhase0Address();
  const gvp1 = getGenesisVaultPassPhase1Address();
  const gvp2 = getGenesisVaultPassPhase2Address();
  const legacy = getDistinctLegacyGenesisDistrictAddress();

  const q0 = useReadContract({
    chainId: deployChainId,
    address: gvp0,
    abi: erc721MinimalAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!gvp0 && !!address },
  });
  const qLeg = useReadContract({
    chainId: deployChainId,
    address: legacy,
    abi: erc721MinimalAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!legacy && !!address },
  });
  const q1 = useReadContract({
    chainId: deployChainId,
    address: gvp1,
    abi: erc721MinimalAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!gvp1 && !!address },
  });
  const q2 = useReadContract({
    chainId: deployChainId,
    address: gvp2,
    abi: erc721MinimalAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!gvp2 && !!address },
  });

  const pending =
    (!!gvp0 && q0.isPending) ||
    (!!legacy && qLeg.isPending) ||
    (!!gvp1 && q1.isPending) ||
    (!!gvp2 && q2.isPending);

  const p0 = (gvp0 ? (q0.data ?? 0n) : 0n) + (legacy ? (qLeg.data ?? 0n) : 0n);
  const p1 = gvp1 ? (q1.data ?? 0n) : 0n;
  const p2 = gvp2 ? (q2.data ?? 0n) : 0n;

  const highestTier = pending
    ? null
    : resolveHighestGenesisVaultTier({
        balancePhase0: p0,
        balancePhase1: p1,
        balancePhase2: p2,
      });

  return {
    highestTier,
    isPending: pending,
    holdsAny: highestTier !== null,
  };
}
