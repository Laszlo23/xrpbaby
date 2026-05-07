import { http, webSocket, fallback, createConfig, createStorage, cookieStorage } from "wagmi";
import type { Chain } from "wagmi/chains";
import { baseAccount, coinbaseWallet, injected, metaMask, walletConnect } from "wagmi/connectors";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { bsc, getAllWagmiChains, getDefaultChain } from "@/lib/chains";

const chainList = getAllWagmiChains() as readonly Chain[];
const chains = chainList as [Chain, ...Chain[]];

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

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
  if (chain.id !== bsc.id) return http();
  const httpRpc = bscHttpUrl();
  const ws = bscWssUrl();
  if (ws) return fallback([webSocket(ws), http(httpRpc)]);
  return http(httpRpc);
}

export const wagmiConfig = createConfig({
  chains,
  multiInjectedProviderDiscovery: false,
  connectors: [
    baseAccount({ appName: BRAND_DISPLAY_NAME }),
    metaMask(),
    coinbaseWallet({ appName: BRAND_DISPLAY_NAME }),
    injected({ shimDisconnect: true }),
    ...(walletConnectProjectId ? [walletConnect({ projectId: walletConnectProjectId })] : []),
  ],
  transports: Object.fromEntries(chains.map((c) => [c.id, transportFor(c)])),
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  batch: { multicall: true },
});

export function targetChain() {
  return getDefaultChain();
}
