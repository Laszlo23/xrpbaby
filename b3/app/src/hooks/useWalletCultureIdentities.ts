import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { Address } from "viem";

import {
  getActiveIdentity,
  getStoredIdentities,
  mergeIdentityLists,
  setActiveIdentity,
} from "@/lib/identity/identityStorage";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";
import { privyEnabled } from "@/lib/privy-env";
import { walletCultureIdentityQueryKey } from "@/hooks/useWalletCultureIdentity";

export function walletCultureIdentitiesQueryKey(address?: string) {
  return ["walletCultureIdentities", address?.toLowerCase()] as const;
}

async function fetchServerHandles(address: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/identity/by-wallet?address=${encodeURIComponent(address)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { ok?: boolean; handles?: string[]; handle?: string | null };
    if (!data.ok) return [];
    if (Array.isArray(data.handles) && data.handles.length > 0) {
      return data.handles.map((h) => h.toLowerCase());
    }
    if (typeof data.handle === "string" && data.handle.includes(".")) {
      return [data.handle.toLowerCase()];
    }
  } catch {
    /* best-effort */
  }
  return [];
}

export function useWalletCultureIdentities() {
  const privyAddress = usePrivyWalletAddress();
  const { address: wagmiAddress } = useAccount();
  const address = (privyEnabled ? (privyAddress ?? wagmiAddress) : wagmiAddress) as
    | Address
    | undefined;
  const queryClient = useQueryClient();

  const { data: serverHandles, isLoading: serverLoading } = useQuery({
    queryKey: walletCultureIdentitiesQueryKey(address),
    queryFn: () => fetchServerHandles(address!),
    enabled: Boolean(address),
    staleTime: 60_000,
  });

  const identities = useMemo(() => {
    if (!address) return [];
    return mergeIdentityLists(getStoredIdentities(address), serverHandles ?? []);
  }, [address, serverHandles]);

  const [activeName, setActiveNameState] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setActiveNameState(null);
      return;
    }
    const storedActive = getActiveIdentity(address);
    if (storedActive && identities.includes(storedActive)) {
      setActiveNameState(storedActive);
      return;
    }
    if (identities.length > 0) {
      setActiveNameState(identities[0]!);
      setActiveIdentity(address, identities[0]!);
      return;
    }
    setActiveNameState(null);
  }, [address, identities]);

  const setActiveName = useCallback(
    (fullName: string) => {
      if (!address) return;
      const normalized = fullName.toLowerCase();
      if (!identities.includes(normalized)) return;
      setActiveIdentity(address, normalized);
      setActiveNameState(normalized);
      void queryClient.invalidateQueries({ queryKey: walletCultureIdentityQueryKey(address) });
    },
    [address, identities, queryClient],
  );

  return {
    address,
    identities,
    activeName,
    setActiveName,
    isLoading: Boolean(address && serverLoading && identities.length === 0),
    hasMultiple: identities.length > 1,
  };
}
