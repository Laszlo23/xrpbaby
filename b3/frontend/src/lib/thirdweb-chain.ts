import { defineChain } from "thirdweb";
import { base as twBase, baseSepolia as twBaseSepolia, bsc as twBsc } from "thirdweb/chains";
import type { Chain as WagmiChain } from "wagmi/chains";
import { base, baseSepolia, b3Mainnet, b3Testnet, bsc } from "@/lib/chains";

/** Build a thirdweb chain from wagmi metadata (avoids viem Chain type incompatibility across packages). */
function wagmiToThirdwebChain(wagmiChain: WagmiChain) {
  const rpc = wagmiChain.rpcUrls.default.http[0];
  const be = wagmiChain.blockExplorers?.default;
  return defineChain({
    id: wagmiChain.id,
    name: wagmiChain.name,
    rpc,
    nativeCurrency: wagmiChain.nativeCurrency,
    blockExplorers: be ? [{ name: be.name, url: be.url }] : undefined,
    testnet: wagmiChain.testnet === true ? true : undefined,
  });
}

/** Map connected wagmi chain to thirdweb `Chain` for `getContract` and extensions. */
export function toThirdwebChain(wagmiChain: WagmiChain) {
  if (wagmiChain.id === base.id) return twBase;
  if (wagmiChain.id === baseSepolia.id) return twBaseSepolia;
  if (wagmiChain.id === bsc.id) return twBsc;
  if (wagmiChain.id === b3Mainnet.id || wagmiChain.id === b3Testnet.id) {
    return wagmiToThirdwebChain(wagmiChain);
  }
  return twBase;
}

/** Resolve thirdweb chain from a numeric chain id (falls back to Base mainnet). */
export function thirdwebChainFromId(chainId: number) {
  const map = new Map<
    number,
    ReturnType<typeof wagmiToThirdwebChain> | typeof twBase | typeof twBaseSepolia | typeof twBsc
  >([
    [base.id, twBase],
    [baseSepolia.id, twBaseSepolia],
    [bsc.id, twBsc],
    [b3Mainnet.id, wagmiToThirdwebChain(b3Mainnet)],
    [b3Testnet.id, wagmiToThirdwebChain(b3Testnet)],
  ]);
  return map.get(chainId) ?? twBase;
}
