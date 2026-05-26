import { createConfig as createPrivyWagmiConfig } from "@privy-io/wagmi";
import { http, fallback, webSocket, createStorage, cookieStorage } from "wagmi";
import type { Chain } from "wagmi/chains";
import { base, bsc, getAllWagmiChains } from "@/lib/chains";

const chainList = getAllWagmiChains() as readonly Chain[];
const chains = chainList as [Chain, ...Chain[]];

function bscHttpUrl(): string {
  const custom = import.meta.env.VITE_BSC_HTTP_URL as string | undefined;
  if (custom?.trim()) return custom.trim();
  const key = import.meta.env.VITE_4EVERLAND_BSC_API_KEY as string | undefined;
  if (key?.trim()) return `https://bsc-mainnet.4everland.org/v1/${key.trim()}`;
  return "https://bsc-dataseed.binance.org";
}

function bscWssUrl(): string | undefined {
  const custom = import.meta.env.VITE_BSC_WSS_URL as string | undefined;
  if (custom?.trim()) return custom.trim();
  const key = import.meta.env.VITE_4EVERLAND_BSC_API_KEY as string | undefined;
  if (key?.trim()) return `wss://bsc-mainnet.4everland.org/ws/v1/${key.trim()}`;
  return undefined;
}

function transportFor(chain: Chain) {
  if (chain.id === base.id) {
    const rpc = import.meta.env.VITE_BASE_RPC_URL as string | undefined;
    return http(rpc?.trim() || base.rpcUrls.default.http[0]);
  }
  if (chain.id !== bsc.id) return http();
  const httpRpc = bscHttpUrl();
  const ws = bscWssUrl();
  if (ws) return fallback([webSocket(ws), http(httpRpc)]);
  return http(httpRpc);
}

/**
 * Wagmi config for `@privy-io/wagmi` — connectors sync from Privy at runtime.
 * @see https://docs.privy.io/wallets/connectors/ethereum/integrations/wagmi
 */
export const wagmiConfigPrivy = createPrivyWagmiConfig({
  chains,
  transports: Object.fromEntries(chains.map((c) => [c.id, transportFor(c)])),
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  batch: { multicall: true },
});
