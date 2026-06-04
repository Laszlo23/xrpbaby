import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider as WagmiProviderPrivy } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, type ReactNode } from "react";
import type { Config } from "wagmi";
import { WagmiProvider } from "wagmi";
import { CultureMemberSync } from "./CultureMemberSync.js";
import { CultureNetworkProvider } from "./CultureNetworkProvider.js";
import { buildPrivyConfig } from "./privy-config.js";
import { createCultureWagmiConfig } from "./wagmi-config.js";
import { resolveCultureAuthEnv, type CultureAuthEnv } from "./env.js";
import type { Chain } from "viem/chains";

export type CultureAuthProviderProps = {
  children: ReactNode;
  /** Override env-derived Privy app id. */
  privyAppId?: string;
  privyClientId?: string;
  platformOrigin?: string;
  syncApiOrigin?: string;
  authHubOrigin?: string;
  accentColor?: string;
  /** When Privy is disabled or `mode` is `fallback`, use this wagmi config (e.g. Farcaster mini). */
  fallbackWagmiConfig?: Config;
  /** Force fallback wagmi (mini app context). */
  mode?: "privy" | "fallback";
  enableMemberSync?: boolean;
  enableNetworkProvider?: boolean;
  includeQueryClient?: boolean;
  queryClient?: QueryClient;
  supportedChains?: readonly Chain[];
  createOnLogin?: "users-without-wallets" | "off" | "all-users";
};

function CultureAuthInner({
  children,
  enableMemberSync = true,
  enableNetworkProvider = true,
  syncApiOrigin,
  usePrivy,
}: {
  children: ReactNode;
  enableMemberSync?: boolean;
  enableNetworkProvider?: boolean;
  syncApiOrigin?: string;
  usePrivy: boolean;
}) {
  const content = (
    <>
      {usePrivy && enableMemberSync ? <CultureMemberSync syncApiOrigin={syncApiOrigin} /> : null}
      {enableNetworkProvider ? (
        <CultureNetworkProvider>{children}</CultureNetworkProvider>
      ) : (
        children
      )}
    </>
  );
  return content;
}

export function CultureAuthProvider({
  children,
  privyAppId,
  privyClientId,
  platformOrigin,
  syncApiOrigin,
  accentColor,
  fallbackWagmiConfig,
  mode = "privy",
  enableMemberSync = true,
  enableNetworkProvider = true,
  includeQueryClient = true,
  queryClient: queryClientProp,
  supportedChains,
  createOnLogin,
}: CultureAuthProviderProps) {
  const env: CultureAuthEnv = resolveCultureAuthEnv({
    privyAppId,
    privyClientId,
    platformOrigin,
  });

  const usePrivy = mode === "privy" && env.privyEnabled;
  const syncOrigin = syncApiOrigin ?? env.platformOrigin;

  const privyConfig = useMemo(
    () =>
      buildPrivyConfig({
        clientId: env.privyClientId || undefined,
        walletConnectProjectId: env.walletConnectProjectId || undefined,
        accentColor,
        createOnLogin,
        supportedChains: supportedChains ?? undefined,
      }),
    [env.privyClientId, env.walletConnectProjectId, accentColor, createOnLogin, supportedChains],
  );

  const wagmiConfigPrivy = useMemo(
    () => createCultureWagmiConfig({ chains: supportedChains }),
    [supportedChains],
  );

  const queryClient = useMemo(
    () => queryClientProp ?? new QueryClient(),
    [queryClientProp],
  );

  const wagmiInner = usePrivy ? (
    <WagmiProviderPrivy config={wagmiConfigPrivy}>
      <CultureAuthInner
        usePrivy
        enableMemberSync={enableMemberSync}
        enableNetworkProvider={enableNetworkProvider}
        syncApiOrigin={syncOrigin}
      >
        {children}
      </CultureAuthInner>
    </WagmiProviderPrivy>
  ) : fallbackWagmiConfig ? (
    <WagmiProvider config={fallbackWagmiConfig} reconnectOnMount>
      <CultureAuthInner
        usePrivy={false}
        enableNetworkProvider={enableNetworkProvider}
        syncApiOrigin={syncOrigin}
      >
        {children}
      </CultureAuthInner>
    </WagmiProvider>
  ) : null;

  const withQuery = includeQueryClient ? (
    <QueryClientProvider client={queryClient}>{wagmiInner}</QueryClientProvider>
  ) : (
    wagmiInner
  );

  if (!usePrivy) {
    return withQuery;
  }

  return (
    <PrivyProvider appId={env.privyAppId} config={privyConfig}>
      {withQuery}
    </PrivyProvider>
  );
}
