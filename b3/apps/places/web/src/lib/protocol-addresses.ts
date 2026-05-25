import { base } from "viem/chains";
import { explorerBase } from "@/lib/contracts";
import { baseAddresses, baseExplorerBase } from "@/lib/base-addresses";

/** Protocol contract bundle + explorer base URL (no trailing slash) for the active chain. */
export type ProtocolAddresses = {
  registry: `0x${string}`;
  shareFactory: `0x${string}`;
  compliance: `0x${string}`;
  weth: `0x${string}`;
  router: `0x${string}`;
  lendingPool: `0x${string}`;
  predictionMarket: `0x${string}`;
  proofNft: `0x${string}`;
  staking: `0x${string}`;
  guestbook: `0x${string}`;
  platformToken: `0x${string}`;
  purchaseEscrowErc20: `0x${string}`;
  governanceSafe: `0x${string}`;
  explorer: string;
};

function stripSlash(s: string) {
  return s.replace(/\/$/, "");
}

function bundleBase(): ProtocolAddresses {
  return {
    registry: baseAddresses.registry,
    shareFactory: baseAddresses.shareFactory,
    compliance: baseAddresses.compliance,
    weth: baseAddresses.weth,
    router: baseAddresses.router,
    lendingPool: baseAddresses.lendingPool,
    predictionMarket: baseAddresses.predictionMarket,
    proofNft: baseAddresses.proofNft,
    staking: baseAddresses.staking,
    guestbook: baseAddresses.guestbook,
    platformToken: baseAddresses.platformToken,
    purchaseEscrowErc20: baseAddresses.purchaseEscrowErc20,
    governanceSafe: baseAddresses.governanceSafe,
    explorer: stripSlash(baseExplorerBase || explorerBase),
  };
}

/** Production protocol bundle from Base env vars (`NEXT_PUBLIC_BASE_*`). */
export function getProtocolAddresses(): ProtocolAddresses {
  return bundleBase();
}

export { base as baseChain };
