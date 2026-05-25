import { defineChain } from "viem";

/** Opt-in legacy testnet for internal QA only (`NEXT_PUBLIC_ENABLE_LEGACY_TESTNET=1`). Not shown in default wallet config. */
export const legacyTestnetEnabled =
  typeof process.env.NEXT_PUBLIC_ENABLE_LEGACY_TESTNET === "string" &&
  process.env.NEXT_PUBLIC_ENABLE_LEGACY_TESTNET === "1";

const rpc =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_OG_RPC
    ? process.env.NEXT_PUBLIC_OG_RPC
    : "https://evmrpc-testnet.0g.ai";

/** @deprecated Prefer Base mainnet; keep only for scripts or legacy env. */
export const ogGalileo = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { decimals: 18, name: "OG", symbol: "OG" },
  rpcUrls: {
    default: { http: [rpc] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://chainscan-galileo.0g.ai" },
  },
});
