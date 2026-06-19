import { useCallback } from "react";
import { useConnect, useConnectors } from "wagmi";
import { useCultureLogin } from "@/hooks/useCultureLogin";
import { privyEnabled } from "@/lib/privy-env";

/** Opens wallet connect via Privy (unified app) or wagmi fallback. */
export function useOpenWallet() {
  const { ready: privyReady, openPreferredLogin, openWalletLogin } = useCultureLogin();
  const { connect, isPending } = useConnect();
  const connectors = useConnectors();

  const openWallet = useCallback(() => {
    if (privyEnabled) {
      if (privyReady) openPreferredLogin();
      return;
    }

    const injected = connectors.find((c) => c.id === "injected");
    const walletConnect = connectors.find((c) => c.id === "walletConnect");
    const connector = injected ?? walletConnect ?? connectors[0];
    if (connector) void connect({ connector });
  }, [connect, connectors, openPreferredLogin, privyReady]);

  const openWalletOnly = useCallback(() => {
    if (privyEnabled) {
      if (privyReady) openWalletLogin();
      return;
    }
    const injected = connectors.find((c) => c.id === "injected");
    const walletConnect = connectors.find((c) => c.id === "walletConnect");
    const connector = injected ?? walletConnect ?? connectors[0];
    if (connector) void connect({ connector });
  }, [connect, connectors, openWalletLogin, privyReady]);

  return { openWallet, openWalletOnly, isPending, miniAppReady: true, isMiniApp: false };
}
