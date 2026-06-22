import { BCC_ADDRESS } from "@bc/bcc-kit";

/** Canonical Base mainnet addresses for BCC / WETH Balancer pair. */
export const BCC_BALANCER = {
  bcc: BCC_ADDRESS,
  weth: "0x4200000000000000000000000000000000000006" as const,
  chain: "base" as const,
  chainId: 8453,
  createPoolUrl: "https://app.balancer.fi/#/base/pools/create",
  explorePoolsUrl: "https://app.balancer.fi/#/base/pools",
  docsUrl: "https://docs.balancer.fi/",
  protocolSafe: "0x0D106D512Ac28cc29E625b22C6628989013c4C6B" as const,
} as const;

export function balancerPoolUrl(poolAddress: string): string {
  return `https://app.balancer.fi/#/base/pool/${poolAddress}`;
}

export function balancerGaugeUrl(poolOrGauge: string): string {
  return `https://app.balancer.fi/#/base/pool/${poolOrGauge}`;
}

export function balancerSwapUrl(): string {
  return `https://app.balancer.fi/#/base/swap/${BCC_ADDRESS}/0x4200000000000000000000000000000000000006`;
}

export function isBalancerLiquidityEnabled(env: Record<string, string | undefined>): boolean {
  if (env.VITE_BCC_BALANCER_ENABLED === "1" || env.BCC_BALANCER_ENABLED === "1") {
    return true;
  }
  const pool = env.VITE_BCC_BALANCER_POOL?.trim() || env.BCC_BALANCER_POOL?.trim();
  const bpt = env.VITE_BCC_BALANCER_BPT?.trim() || env.BCC_BALANCER_BPT?.trim();
  return Boolean(
    (pool && /^0x[a-fA-F0-9]{40}$/.test(pool)) || (bpt && /^0x[a-fA-F0-9]{40}$/.test(bpt)),
  );
}
