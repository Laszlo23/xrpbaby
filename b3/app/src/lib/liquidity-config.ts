import { BCC_ADDRESS, BCC_UNISWAP_URL } from "@bc/bcc-kit";
import { BCC_AERODROME, aerodromeGaugeUrl, isAerodromeLiquidityEnabled } from "@/lib/aerodrome-bcc";

const BCC = BCC_ADDRESS;

function env(key: string): string | undefined {
  const v =
    (typeof import.meta !== "undefined" &&
      (import.meta.env as Record<string, string | undefined>)[key]) ||
    undefined;
  return v?.trim() || undefined;
}

export type LiquidityDexLinks = {
  uniswapSwap: string;
  uniswapPool: string;
  aerodromeDeposit: string | null;
  aerodromeGauge: string | null;
  aerodromeSwap: string | null;
};

/** Aerodrome pool LP token (set after operator creates BCC/WETH pool). */
export function getBccAerodromePoolAddress(): `0x${string}` | undefined {
  const raw = env("VITE_BCC_AERODROME_POOL");
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw as `0x${string}`;
}

export function getBccAerodromeGaugeAddress(): `0x${string}` | undefined {
  const raw = env("VITE_BCC_AERODROME_GAUGE");
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw as `0x${string}`;
}

export function getBccAerodromeLpTokenAddress(): `0x${string}` | undefined {
  const raw = env("VITE_BCC_AERODROME_LP_TOKEN");
  if (!raw || !/^0x[a-fA-F0-9]{40}$/.test(raw)) return undefined;
  return raw as `0x${string}`;
}

function aerodromeEnabled(): boolean {
  return isAerodromeLiquidityEnabled(
    typeof import.meta !== "undefined"
      ? (import.meta.env as Record<string, string | undefined>)
      : {},
  );
}

export function buildLiquidityDexLinks(): LiquidityDexLinks {
  const pool = getBccAerodromePoolAddress();
  const gauge = getBccAerodromeGaugeAddress();
  const enabled = aerodromeEnabled();
  return {
    uniswapSwap: env("VITE_BCC_UNISWAP_URL") ?? BCC_UNISWAP_URL,
    uniswapPool: env("VITE_BCC_UNISWAP_POOL")?.trim()
      ? `https://app.uniswap.org/explore/pools/base/${env("VITE_BCC_UNISWAP_POOL")}`
      : `https://app.uniswap.org/explore/pools/base/${BCC.toLowerCase()}`,
    aerodromeDeposit: enabled || pool ? BCC_AERODROME.depositUrl : null,
    aerodromeGauge: gauge
      ? aerodromeGaugeUrl(gauge)
      : pool
        ? aerodromeGaugeUrl(pool)
        : enabled
          ? BCC_AERODROME.depositUrl
          : null,
    aerodromeSwap: enabled || pool ? BCC_AERODROME.swapUrl : null,
  };
}

export const LIQUIDITY_LESSON_STEPS = [
  {
    id: "pool-basics",
    title: "What is a liquidity pool?",
    body: "A pool pairs two tokens so traders can swap. LPs deposit both sides and earn a share of trading fees — you are providing infrastructure, not betting on a single price tick.",
  },
  {
    id: "impermanent-loss",
    title: "Impermanent loss (plain language)",
    body: "If one token in the pair moves a lot vs the other, your pool share can be worth less than holding the tokens separately. Fees can offset that over time — learn the tradeoff before sizing a position.",
  },
  {
    id: "uniswap-primary",
    title: "Uniswap — primary BCC liquidity",
    body: "BCC's main Base pool today is on Uniswap V3. Use it to buy BCC or add concentrated liquidity when you are ready.",
  },
  {
    id: "aerodrome-secondary",
    title: "Aerodrome — secondary pool & gauges",
    body: "Aerodrome on Base can host a BCC/WETH pool. Deposit LP, then stake in a gauge to earn AERO emissions when the pool is incentivized — protocol participation, not a guaranteed return.",
  },
  {
    id: "bcc-utility",
    title: "BCC in the culture economy",
    body: "BCC unlocks an 11.11% discount on priced features (pass, tickets, studio publish). Liquidity depth helps the community transact; Culture Points reward learning and showing up early.",
  },
] as const;
