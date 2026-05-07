import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ThirdwebProvider } from "thirdweb/react";
import { wagmiConfig } from "@/lib/wagmi-config";
import { WagmiThirdwebSync } from "@/components/WagmiThirdwebSync";
import { FarcasterMiniAppBridge } from "@/components/FarcasterMiniAppBridge";

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
        <ThirdwebProvider>
          <WagmiThirdwebSync />
          <FarcasterMiniAppBridge />
          {children}
        </ThirdwebProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
