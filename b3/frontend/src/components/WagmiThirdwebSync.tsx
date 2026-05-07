import { useEffect, useRef } from "react";
import { captureWalletConnected, initProductAnalytics } from "@/lib/analytics";
import { useAccount, useChainId } from "wagmi";
import { useActiveWallet, useDisconnect, useSetActiveWallet } from "thirdweb/react";
import { EIP1193 } from "thirdweb/wallets";
import { thirdwebClient } from "@/lib/thirdweb-client";

/**
 * Keeps thirdweb's active wallet aligned with the wagmi-connected EIP-1193 provider.
 */
export function WagmiThirdwebSync() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const setActiveWallet = useSetActiveWallet();
  const { disconnect } = useDisconnect();
  const activeTwWallet = useActiveWallet();
  const walletTracked = useRef<string | null>(null);

  useEffect(() => {
    initProductAnalytics();
    if (!isConnected || !address) return;
    if (walletTracked.current === address) return;
    walletTracked.current = address;
    captureWalletConnected(address as `0x${string}`);
  }, [isConnected, address]);

  useEffect(() => {
    if (!thirdwebClient || !isConnected || !connector) return;

    let cancelled = false;

    void (async () => {
      try {
        const getProvider = connector.getProvider?.bind(connector);
        if (!getProvider) return;
        const provider = await getProvider({ chainId });
        const twWallet = EIP1193.fromProvider({
          provider: provider as never,
        });
        await twWallet.connect({ client: thirdwebClient });
        if (!cancelled) await setActiveWallet(twWallet);
      } catch (e) {
        console.error("WagmiThirdwebSync: failed to set active thirdweb wallet", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isConnected, connector, chainId, address, setActiveWallet]);

  useEffect(() => {
    if (isConnected || !activeTwWallet) return;
    try {
      disconnect(activeTwWallet);
    } catch {
      /* ignore */
    }
  }, [isConnected, activeTwWallet, disconnect]);

  return null;
}
