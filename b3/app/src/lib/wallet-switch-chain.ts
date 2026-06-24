import { getWagmiChainById } from "@/lib/chains";

type SwitchChainAsync = ((args: { chainId: number }) => Promise<unknown>) | undefined;

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  const eth = window.ethereum as EthereumProvider | undefined;
  return eth?.request ? eth : undefined;
}

async function addChainToWallet(chainId: number): Promise<void> {
  const chain = getWagmiChainById(chainId);
  const provider = getEthereumProvider();
  if (!chain || !provider) {
    throw new Error(`Chain ${chainId} is not available in this wallet.`);
  }

  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: `0x${chainId.toString(16)}`,
        chainName: chain.name,
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: chain.rpcUrls.default.http,
        blockExplorerUrls: chain.blockExplorers?.default?.url
          ? [chain.blockExplorers.default.url]
          : undefined,
      },
    ],
  });
}

/** Switch wallet chain; adds the chain to MetaMask-style wallets when missing. */
export async function switchWalletToChain(
  switchChainAsync: SwitchChainAsync,
  chainId: number,
): Promise<void> {
  if (!switchChainAsync) {
    throw new Error("Connect your wallet before switching networks.");
  }

  try {
    await switchChainAsync({ chainId });
    return;
  } catch (firstErr) {
    try {
      await addChainToWallet(chainId);
      await switchChainAsync({ chainId });
      return;
    } catch {
      throw firstErr instanceof Error ? firstErr : new Error("Network switch rejected.");
    }
  }
}
