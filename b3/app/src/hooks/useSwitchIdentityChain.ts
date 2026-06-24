import { useWallets } from "@privy-io/react-auth";
import { useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { getWagmiChainById } from "@/lib/chains";
import { privyEnabled } from "@/lib/privy-env";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

async function switchViaProvider(provider: EthereumProvider, chainId: number): Promise<void> {
  const hex = `0x${chainId.toString(16)}`;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hex }],
    });
  } catch (err) {
    const chain = getWagmiChainById(chainId);
    if (!chain) throw err;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: hex,
          chainName: chain.name,
          nativeCurrency: chain.nativeCurrency,
          rpcUrls: chain.rpcUrls.default.http,
          blockExplorerUrls: chain.blockExplorers?.default?.url
            ? [chain.blockExplorers.default.url]
            : undefined,
        },
      ],
    });
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hex }],
    });
  }
}

/** Switch to an identity chain — wagmi, Privy wallet, or connector provider. */
export function useSwitchIdentityChain() {
  const { switchChainAsync } = useSwitchChain();
  const { connector } = useAccount();
  const { wallets } = useWallets();

  return useCallback(
    async (chainId: number) => {
      if (switchChainAsync) {
        try {
          await switchChainAsync({ chainId });
          return;
        } catch {
          /* fall through to Privy / connector provider */
        }
      }

      if (privyEnabled) {
        const privyWallet = wallets.find((w) => w.address);
        if (privyWallet?.switchChain) {
          await privyWallet.switchChain(chainId);
          return;
        }
      }

      const rawProvider = await connector?.getProvider?.();
      if (rawProvider && typeof rawProvider === "object" && "request" in rawProvider) {
        await switchViaProvider(rawProvider as EthereumProvider, chainId);
        return;
      }

      const injected = typeof window !== "undefined" ? window.ethereum : undefined;
      if (injected?.request) {
        await switchViaProvider(injected as EthereumProvider, chainId);
        return;
      }

      throw new Error("Connect your wallet before switching networks.");
    },
    [connector, switchChainAsync, wallets],
  );
}
