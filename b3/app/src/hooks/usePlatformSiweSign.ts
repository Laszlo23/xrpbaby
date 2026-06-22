import { useWallets } from "@privy-io/react-auth";
import { useCallback, useState } from "react";
import { createWalletClient, custom, type Address } from "viem";
import { useAccount, useChainId, useSignMessage } from "wagmi";

import { useLinkedWalletAddress } from "@/hooks/useLinkedWalletAddress";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { base } from "@/lib/chains";
import { detectFarcasterMiniApp } from "@/lib/farcaster-miniapp";
import { buildPlatformSiweMessage } from "@/lib/platform-siwe";
import { privyEnabled } from "@/lib/privy-env";

export type PlatformSiweResult = {
  prepared: string;
  signature: string;
  address: string;
};

async function signViaFarcasterProvider(
  message: string,
  address: Address,
): Promise<string> {
  const sdk = (await import("@farcaster/miniapp-sdk")).default;
  const client = createWalletClient({
    account: address,
    chain: base,
    transport: custom(sdk.wallet.ethProvider),
  });
  return client.signMessage({ message });
}

/** SIWE for platform onboarding and other server-gated flows. */
export function usePlatformSiweSign() {
  const linkedAddress = useLinkedWalletAddress();
  const { address: wagmiAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending: wagmiSigning } = useSignMessage();
  const { wallets } = useWallets();
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

        let signature: string;

        if (privyEnabled) {
          const privyWallet = wallets.find(
            (w) => w.address?.toLowerCase() === address.toLowerCase(),
          );
          if (privyWallet) {
            signature = await privyWallet.sign(prepared);
          } else if (wagmiAddress?.toLowerCase() === address.toLowerCase()) {
            signature = await signMessageAsync({ message: prepared, account: address });
          } else if (await detectFarcasterMiniApp()) {
            signature = await signViaFarcasterProvider(prepared, address);
          } else {
            const fallback = wallets.find((w) => w.address);
            if (!fallback?.address) throw new Error("wallet_not_ready");
            const { prepared: fallbackPrepared } = await buildPlatformSiweMessage(
              fallback.address as Address,
              effectiveChainId,
              defaultStatement,
            );
            signature = await fallback.sign(fallbackPrepared);
            return { prepared: fallbackPrepared, signature, address: fallback.address };
          }
        } else if (await detectFarcasterMiniApp()) {
          signature = await signViaFarcasterProvider(prepared, address);
        } else {
          signature = await signMessageAsync({ message: prepared, account: address });
        }

        return { prepared, signature, address };
      } finally {
        setSigning(false);
      }
    },
    [resolveAddress, resolveChainId, wallets, wagmiAddress, signMessageAsync],
  );

  return {
    signPlatformSiwe,
    signing: signing || wagmiSigning,
    address: resolveAddress(),
  };
}
