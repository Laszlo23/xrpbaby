import { createConfig as createPrivyWagmiConfig } from "@privy-io/wagmi";
import { http, fallback, webSocket } from "wagmi";
import type { Config } from "wagmi";
import type { Chain } from "viem/chains";
import { base, bsc, cultureChains, getBaseRpcUrl, getBscRpcUrl } from "./chains.js";

const viteEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : ({} as ImportMetaEnv);

function bscWssUrl(): string | undefined {
  const custom = viteEnv.VITE_BSC_WSS_URL;
  if (custom?.trim()) return custom.trim();
  const key = viteEnv.VITE_4EVERLAND_BSC_API_KEY;
  if (key?.trim()) return `wss://bsc-mainnet.4everland.org/ws/v1/${key.trim()}`;
  return undefined;
}

function transportFor(chain: Chain) {
  if (chain.id === base.id) {
    return http(getBaseRpcUrl());
  }
  if (chain.id !== bsc.id) return http();
  const httpRpc = getBscRpcUrl();
  const ws = bscWssUrl();
  if (ws) return fallback([webSocket(ws), http(httpRpc)]);
  return http(httpRpc);
}

export type CreateCultureWagmiConfigOptions = {
  chains?: readonly Chain[];
  ssr?: boolean;
};

/** Wagmi config for `@privy-io/wagmi` — connectors sync from Privy at runtime. */
export function createCultureWagmiConfig(options: CreateCultureWagmiConfigOptions = {}): Config {
  const chainList = (options.chains ?? cultureChains) as readonly Chain[];
  const chains = chainList as [Chain, ...Chain[]];
  return createPrivyWagmiConfig({
    chains: chains as never,
    transports: Object.fromEntries(chains.map((c) => [c.id, transportFor(c)])) as never,
    ssr: options.ssr ?? true,
    batch: { multicall: true },
  });
}
