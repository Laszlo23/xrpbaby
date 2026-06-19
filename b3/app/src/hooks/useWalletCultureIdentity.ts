import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useReadContract } from "wagmi";
import type { Address } from "viem";
import { getStoredIdentities } from "@/lib/identity/identityStorage";
import { cultureLayerIdentityAbi } from "@/lib/identity/identityAbi";
import { getIdentityConfigForNetwork } from "@/lib/identity/config";
import { cultureProfilePath } from "@/lib/identity/urls";
import { parseIdentityFullName } from "@/lib/identity/tlds";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";
import { privyEnabled } from "@/lib/privy-env";

export type WalletCultureIdentity = {
  primaryName: string | null;
  profilePath: string | null;
  isVerified: boolean;
  isLoading: boolean;
};

function resolveCandidate(address: string | undefined): string | null {
  if (!address) return null;
  const stored = getStoredIdentities(address);
  return stored[0] ?? null;
}

export function walletCultureIdentityQueryKey(address?: string) {
  return ["walletCultureIdentity", address?.toLowerCase()] as const;
}

/** Pure resolver for unit tests and on-chain verification. */
export function resolveVerifiedCultureIdentity(input: {
  address: string;
  candidate: string;
  tokenId?: bigint;
  owner?: string;
}): WalletCultureIdentity {
  const parsed = parseIdentityFullName(input.candidate);
  if (!parsed) {
    return { primaryName: null, profilePath: null, isVerified: false, isLoading: false };
  }

  const tokenIdBig = input.tokenId ?? 0n;
  const hasToken = tokenIdBig > 0n;
  const fullName = `${parsed.handle}.${parsed.tld}`;
  const ownerMatch =
    hasToken && input.owner && input.owner.toLowerCase() === input.address.toLowerCase();

  if (ownerMatch) {
    return {
      primaryName: fullName,
      profilePath: cultureProfilePath(fullName),
      isVerified: true,
      isLoading: false,
    };
  }

  return { primaryName: null, profilePath: null, isVerified: false, isLoading: false };
}

export function useWalletCultureIdentity(): WalletCultureIdentity {
  const privyAddress = usePrivyWalletAddress();
  const { address: wagmiAddress } = useAccount();
  const address = (privyEnabled ? (privyAddress ?? wagmiAddress) : wagmiAddress) as
    | Address
    | undefined;

  const { data: candidate, isLoading: storedLoading } = useQuery({
    queryKey: walletCultureIdentityQueryKey(address),
    queryFn: () => resolveCandidate(address),
    enabled: Boolean(address),
    staleTime: 30_000,
  });
  const parsed = useMemo(() => (candidate ? parseIdentityFullName(candidate) : null), [candidate]);

  const identityCfg = getIdentityConfigForNetwork("base");
  const contract = identityCfg.identityContractAddress;
  const chainId = identityCfg.identityChainId;
  const enabled = Boolean(address && parsed && contract);

  const { data: tokenId, isLoading: tokenLoading } = useReadContract({
    chainId,
    address: contract || undefined,
    abi: cultureLayerIdentityAbi,
    functionName: "getTokenId",
    args: parsed ? [parsed.handle, parsed.tldId] : undefined,
    query: { enabled },
  });

  const tokenIdBig = typeof tokenId === "bigint" ? tokenId : 0n;
  const hasToken = tokenIdBig > 0n;

  const { data: owner, isLoading: ownerLoading } = useReadContract({
    chainId,
    address: contract || undefined,
    abi: cultureLayerIdentityAbi,
    functionName: "ownerOf",
    args: hasToken ? [tokenIdBig] : undefined,
    query: { enabled: enabled && hasToken },
  });

  const isLoading = Boolean(
    address && (storedLoading || (parsed && (tokenLoading || (hasToken && ownerLoading)))),
  );

  if (!address || !parsed || !candidate) {
    return { primaryName: null, profilePath: null, isVerified: false, isLoading: false };
  }

  if (isLoading) {
    return { primaryName: null, profilePath: null, isVerified: false, isLoading: true };
  }

  const ownerMatch =
    hasToken && owner && typeof owner === "string" && owner.toLowerCase() === address.toLowerCase();

  if (ownerMatch) {
    return resolveVerifiedCultureIdentity({
      address,
      candidate,
      tokenId: tokenIdBig,
      owner: owner as string,
    });
  }

  return { primaryName: null, profilePath: null, isVerified: false, isLoading: false };
}
