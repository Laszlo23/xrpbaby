import "@worldcoin/minikit-js/wagmi-fallback";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider as WagmiProviderPrivy } from "@privy-io/wagmi";
import { WagmiProvider } from "wagmi";
import { ThirdwebProvider } from "thirdweb/react";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { useMemo } from "react";
import { wagmiConfig } from "@/lib/wagmi-config";
import { wagmiConfigPrivy } from "@/lib/wagmi-privy-config";
import { buildPrivyConfig } from "@/lib/privy-config";
import { privyAppId, privyEnabled } from "@/lib/privy-env";
import { WagmiThirdwebSync } from "@/components/WagmiThirdwebSync";
import { FarcasterMiniAppBridge } from "@/components/FarcasterMiniAppBridge";
import { WorldMiniAppBridge } from "@/components/WorldMiniAppBridge";
import { PrivyMemberSync } from "@/components/PrivyMemberSync";
import { PrivyWagmiSync } from "@/components/PrivyWagmiSync";
import { CultureNetworkProvider } from "@/contexts/CultureNetworkContext";
import { WalletSessionProvider } from "@/contexts/WalletSessionContext";
import { thirdwebClient } from "@/lib/thirdweb-client";

function Web3Core({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FarcasterMiniAppBridge />
      <WorldMiniAppBridge />
      {privyEnabled ? (
        <>
          <PrivyWagmiSync />
          <PrivyMemberSync />
        </>
      ) : null}
      <WalletSessionProvider privyMode={privyEnabled}>
        <CultureNetworkProvider>{children}</CultureNetworkProvider>
      </WalletSessionProvider>
    </>
  );
}

const worldMiniAppId =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WORLD_MINI_APP_ID?.trim()) ||
  undefined;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: true,
    },
  },
});

function Web3Inner({ children }: { children: React.ReactNode }) {
  const core = thirdwebClient ? (
    <ThirdwebProvider>
      <WagmiThirdwebSync />
      <Web3Core>{children}</Web3Core>
    </ThirdwebProvider>
  ) : (
    <Web3Core>{children}</Web3Core>
  );

  if (!worldMiniAppId) {
    return core;
  }

  return (
    <MiniKitProvider
      props={{ wagmiConfig: privyEnabled ? wagmiConfigPrivy : wagmiConfig, appId: worldMiniAppId }}
    >
      {core}
    </MiniKitProvider>
  );
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const privyConfig = useMemo(() => buildPrivyConfig(), []);

  const inner = (
    <QueryClientProvider client={queryClient}>
      {privyEnabled ? (
        <WagmiProviderPrivy config={wagmiConfigPrivy}>
          <Web3Inner>{children}</Web3Inner>
        </WagmiProviderPrivy>
      ) : (
        <WagmiProvider config={wagmiConfig}>
          <Web3Inner>{children}</Web3Inner>
        </WagmiProvider>
      )}
    </QueryClientProvider>
  );

  if (!privyEnabled) {
    return inner;
  }

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      {inner}
    </PrivyProvider>
  );
}
