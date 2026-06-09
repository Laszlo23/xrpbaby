import { BCC_ADDRESS } from "@bc/bcc-kit";

/** Canonical Base mainnet addresses for BCC / WETH Aerodrome pair. */
export const BCC_AERODROME = {
  bcc: BCC_ADDRESS,
  weth: "0x4200000000000000000000000000000000000006" as const,
  chain: "base" as const,
  depositUrl: `https://aerodrome.finance/deposit?token0=${BCC_ADDRESS}&token1=0x4200000000000000000000000000000000000006&chain=base`,
  swapUrl: `https://aerodrome.finance/swap?from=eth&to=${BCC_ADDRESS}&chain=base`,
  docsUrl: "https://aerodrome.finance/liquidity",
} as const;

export function aerodromeGaugeUrl(gaugeOrPool: string): string {
  return `https://aerodrome.finance/deposit?pool=${gaugeOrPool}&chain=base`;
}

export function isAerodromeLiquidityEnabled(env: Record<string, string | undefined>): boolean {
  if (env.VITE_BCC_AERODROME_ENABLED === "1" || env.BCC_AERODROME_ENABLED === "1") {
    return true;
  }
  const pool = env.VITE_BCC_AERODROME_POOL?.trim() || env.BCC_AERODROME_POOL?.trim();
  return Boolean(pool && /^0x[a-fA-F0-9]{40}$/.test(pool));
}
