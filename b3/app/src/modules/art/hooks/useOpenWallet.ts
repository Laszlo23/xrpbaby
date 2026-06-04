import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useConnect, useConnectors } from "wagmi";
import { privyEnabled } from "@/lib/privy-env";

/** Opens wallet connect via Privy (unified app) or wagmi fallback. */
export function useOpenWallet() {
  const { login, ready: privyReady } = usePrivy();
  const { connect, isPending } = useConnect();
  const connectors = useConnectors();

  const openWallet = useCallback(() => {
    if (privyEnabled) {
      if (privyReady) void login();
      return;
    }

    const injected = connectors.find((c) => c.id === "injected");
    const walletConnect = connectors.find((c) => c.id === "walletConnect");
    const connector = injected ?? walletConnect ?? connectors[0];
    if (connector) void connect({ connector });
  }, [connect, connectors, login, privyReady]);

  return { openWallet, isPending, miniAppReady: true, isMiniApp: false };
}
