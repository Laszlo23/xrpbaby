import "@worldcoin/minikit-js/wagmi-fallback";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ThirdwebProvider } from "thirdweb/react";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { wagmiConfig } from "@/lib/wagmi-config";
import { WagmiThirdwebSync } from "@/components/WagmiThirdwebSync";
import { FarcasterMiniAppBridge } from "@/components/FarcasterMiniAppBridge";
import { WorldMiniAppBridge } from "@/components/WorldMiniAppBridge";

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

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <MiniKitProvider props={{ wagmiConfig, appId: worldMiniAppId }}>
          <ThirdwebProvider>
            <WagmiThirdwebSync />
            <FarcasterMiniAppBridge />
            <WorldMiniAppBridge />
            {children}
          </ThirdwebProvider>
        </MiniKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
