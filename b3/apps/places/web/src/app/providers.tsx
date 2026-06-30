"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider as WagmiProviderPrivy } from "@privy-io/wagmi";
import { WagmiProvider as WagmiProviderVanilla } from "wagmi";
import { base } from "viem/chains";
import { useMemo, useState } from "react";
import {
  buildPrivyConfig,
  createCultureWagmiConfig,
} from "@bc/culture-auth";
import { CultureMemberSync } from "@bc/culture-auth/react";
import { AnalyticsRouteListener } from "@/components/AnalyticsRouteListener";
import { BuyBccChrome } from "@/components/BuyBccChrome";
import { legacyTestnetEnabled, ogGalileo } from "@/lib/chain";
import { privyAppId, privyEnabled } from "@/lib/privy-env";
import { wagmiConfigVanilla } from "@/wagmi";

const DEFAULT_PRIVY_CLIENT_ID =
  "client-WY6YUv2Pa1JUftGa3dMubEKjQvQQ34NqD1E3o2RETGWfX";

const SYNC_API_ORIGIN =
  process.env.NEXT_PUBLIC_PLATFORM_ORIGIN?.trim() || "https://0x.buildingcultureid.space";

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

  const supportedChains = legacyTestnetEnabled ? [base, ogGalileo] : [base];

  const privyConfig = useMemo(
    () =>
      buildPrivyConfig({
        appName: "Build Culture Places",
        clientId: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? DEFAULT_PRIVY_CLIENT_ID,
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        // culture-auth resolves viem from monorepo root; Places web may hoist a duplicate copy
        supportedChains: supportedChains as never,
        createOnLogin: "users-without-wallets",
      }),
    [supportedChains],
  );

  const wagmiConfigPrivy = useMemo(
    () =>
      createCultureWagmiConfig({ chains: supportedChains as never }),
    [supportedChains],
  );

  const inner = (
    <QueryClientProvider client={queryClient}>
      {privyEnabled ? (
        <WagmiProviderPrivy config={wagmiConfigPrivy as never}>
          <CultureMemberSync syncApiOrigin={SYNC_API_ORIGIN} />
          <AnalyticsRouteListener />
          {children}
          <BuyBccChrome />
        </WagmiProviderPrivy>
      ) : (
        <WagmiProviderVanilla config={wagmiConfigVanilla}>
          <AnalyticsRouteListener />
          {children}
          <BuyBccChrome />
        </WagmiProviderVanilla>
      )}
    </QueryClientProvider>
  );

  if (!privyEnabled) {
    return inner;
  }

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig as never}>
      {inner}
    </PrivyProvider>
  );
}
