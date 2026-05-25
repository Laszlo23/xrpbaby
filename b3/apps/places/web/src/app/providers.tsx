"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider as WagmiProviderPrivy } from "@privy-io/wagmi";
import { WagmiProvider as WagmiProviderVanilla } from "wagmi";
import { base } from "viem/chains";
import { useMemo, useState } from "react";
import { AnalyticsRouteListener } from "@/components/AnalyticsRouteListener";
import { legacyTestnetEnabled, ogGalileo } from "@/lib/chain";
import { privyAppId, privyEnabled } from "@/lib/privy-env";
import { wagmiConfigPrivy, wagmiConfigVanilla } from "@/wagmi";

/** Default web app client from Privy dashboard (override with `NEXT_PUBLIC_PRIVY_CLIENT_ID`). */
const DEFAULT_PRIVY_CLIENT_ID =
  "client-WY6YUv2Pa1JUftGa3dMubEKjQvQQ34NqD1E3o2RETGWfX";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 300_000,
          },
        },
      }),
  );

  const privyConfig = useMemo(
    () => ({
      defaultChain: base,
      supportedChains: legacyTestnetEnabled ? [base, ogGalileo] : [base],
      walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      appearance: {
        showWalletLoginFirst: true,
      },
      embeddedWallets: {
        ethereum: {
          createOnLogin: "off" as const,
        },
      },
    }),
    [],
  );

  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? DEFAULT_PRIVY_CLIENT_ID;

  const inner = (
    <QueryClientProvider client={queryClient}>
      {privyEnabled ? (
        <WagmiProviderPrivy config={wagmiConfigPrivy}>
          <AnalyticsRouteListener />
          {children}
        </WagmiProviderPrivy>
      ) : (
        <WagmiProviderVanilla config={wagmiConfigVanilla}>
          <AnalyticsRouteListener />
          {children}
        </WagmiProviderVanilla>
      )}
    </QueryClientProvider>
  );

  if (!privyEnabled) {
    return inner;
  }

  return (
    <PrivyProvider appId={privyAppId} clientId={clientId} config={privyConfig}>
      {inner}
    </PrivyProvider>
  );
}
