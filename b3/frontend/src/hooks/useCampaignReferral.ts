import { useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import type { Address } from "viem";
import { isAddress } from "viem";
import {
  buildCampaignUrl,
  getStoredReferrer,
  persistReferrerFromSearch,
} from "@/lib/campaign-share";

/**
 * Reads `?ref=0x…` from the URL (TanStack search), persists it, and resolves effective referrer for mints.
 */
export function useCampaignReferral(search: { ref?: string }) {
  const { address } = useAccount();

  useEffect(() => {
    persistReferrerFromSearch(search.ref);
  }, [search.ref]);

  const effectiveReferrer = useMemo((): Address | undefined => {
    const fromUrl = search.ref?.trim();
    if (fromUrl && isAddress(fromUrl)) {
      const a = fromUrl as Address;
      if (address && a.toLowerCase() === address.toLowerCase()) return undefined;
      return a;
    }
    const stored = getStoredReferrer();
    if (stored && address && stored.toLowerCase() === address.toLowerCase()) return undefined;
    return stored;
  }, [search.ref, address]);

  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    return buildCampaignUrl(window.location.origin, address);
  }, [address]);

  return { effectiveReferrer, shareLink };
}
