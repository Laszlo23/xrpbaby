import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useCallback, useRef, useState } from "react";
import type { Address } from "viem";
import { useAccount, useChainId, useSignMessage } from "wagmi";

import { useLinkedWalletAddress } from "@/hooks/useLinkedWalletAddress";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { base } from "@/lib/chains";
import { buildPlatformSiweMessage } from "@/lib/platform-siwe";
import { signPlatformSiweMessage } from "@/lib/platform-siwe-sign";
import { privyEnabled } from "@/lib/privy-env";

export type PlatformSiweResult = {
  prepared: string;
  signature: string;
  address: string;
};

/** SIWE for platform onboarding and other server-gated flows. */
export function usePlatformSiweSign() {
  const linkedAddress = useLinkedWalletAddress();
  const { address: wagmiAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending: wagmiSigning } = useSignMessage();
  const { wallets } = useWallets();
  const walletsRef = useRef(wallets);
  walletsRef.current = wallets;
  const { authenticated, signMessage: privySignMessage } = usePrivy();
  const [signing, setSigning] = useState(false);

  const resolveAddress = useCallback((): Address | undefined => {
    const raw = linkedAddress ?? (isConnected ? wagmiAddress : undefined);
    return raw as Address | undefined;
  }, [linkedAddress, isConnected, wagmiAddress]);

  const resolveChainId = useCallback((): number => {
    if (chainId && chainId > 0) return chainId;
    return base.id;
  }, [chainId]);

  const signPlatformSiwe = useCallback(
    async (statement?: string): Promise<PlatformSiweResult | undefined> => {
      const address = resolveAddress();
      if (!address) return undefined;

      const effectiveChainId = resolveChainId();
      const defaultStatement = statement ?? `Create your pass on ${BRAND_DISPLAY_NAME}.`;

      setSigning(true);
      try {
        const { prepared } = await buildPlatformSiweMessage(
          address,
          effectiveChainId,
          defaultStatement,
        );

        const { signature, address: signedAddress } = await signPlatformSiweMessage({
          prepared,
          address,
          wallets,
          getWallets: () => walletsRef.current,
          wagmiAddress: wagmiAddress as Address | undefined,
          privyAuthenticated: privyEnabled && authenticated,
          privySignMessage: privyEnabled ? privySignMessage : undefined,
          signMessageAsync,
        });

        return { prepared, signature, address: signedAddress };
      } finally {
        setSigning(false);
      }
    },
    [
      resolveAddress,
      resolveChainId,
      wallets,
      wagmiAddress,
      authenticated,
      privySignMessage,
      signMessageAsync,
    ],
  );

  return {
    signPlatformSiwe,
    signing: signing || wagmiSigning,
    address: resolveAddress(),
  };
}
