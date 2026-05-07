import { Fragment, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Config } from "wagmi";
import { WagmiProvider } from "wagmi";
import { ThirdwebProvider } from "thirdweb/react";
import { WagmiThirdwebSync } from "./WagmiThirdwebSync.js";

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: true,
    },
  },
});

export type Web3ProviderProps = {
  children: ReactNode;
  /** Wagmi config from `createWagmiConfig`. */
  wagmiConfig: Config;
  /** Optional slot rendered inside Thirdweb (e.g. Farcaster mini-app bridge). */
  topSlot?: ReactNode;
  /** When false, skips `QueryClientProvider` so the host app can own TanStack Query (e.g. ecorwa). */
  includeQueryClient?: boolean;
  /** Override TanStack Query client (defaults to a sensible client for web3 reads). */
  queryClient?: QueryClient;
};

export function Web3Provider({
  children,
  wagmiConfig,
  topSlot,
  queryClient,
  includeQueryClient = true,
}: Web3ProviderProps) {
  const stack = (
    <WagmiProvider config={wagmiConfig}>
      <ThirdwebProvider>
        <Fragment>
          <WagmiThirdwebSync />
          {topSlot}
          {children}
        </Fragment>
      </ThirdwebProvider>
    </WagmiProvider>
  );

  if (!includeQueryClient) {
    return stack;
  }

  const qc = queryClient ?? defaultQueryClient;
  return <QueryClientProvider client={qc}>{stack}</QueryClientProvider>;
}
