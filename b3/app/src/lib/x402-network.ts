/**
 * x402 settlement chain for `settlePayment` — must match the network clients pay on.
 * @see https://portal.thirdweb.com/x402
 */
import type { Chain } from "thirdweb/chains";
import { arbitrumSepolia, base, baseSepolia } from "thirdweb/chains";

export function getX402SettlementChain(): Chain {
  const raw = process.env.X402_NETWORK?.trim().toLowerCase() ?? "";
  switch (raw) {
    case "arbitrum-sepolia":
    case "arbitrum_sepolia":
      return arbitrumSepolia;
    case "base-sepolia":
    case "base_sepolia":
      return baseSepolia;
    case "base":
    case "":
      return base;
    default:
      console.warn(
        `[x402] X402_NETWORK="${process.env.X402_NETWORK}" not recognized; using Base mainnet`,
      );
      return base;
  }
}
