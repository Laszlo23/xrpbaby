import { BCC_UNISWAP_URL } from "@bc/bcc-kit";

import { BCC_AERODROME, aerodromeGaugeUrl, isAerodromeLiquidityEnabled } from "@/lib/aerodrome-bcc";
import {
  BCC_BALANCER,
  balancerGaugeUrl,
  balancerPoolUrl,
  balancerSwapUrl,
  isBalancerLiquidityEnabled,
} from "@/lib/balancer-bcc";
import { redemptionPolicy } from "@/lib/redemption-policy";
import { getBccTokenAddress } from "@/server/market/env";

const BCC_TOKEN_BASE = "0xb890a5289f789f1346032ccc1847939e855fab07";
const BSC_CHAIN_ID = 56;

type DexPair = {
  chainId?: string | number;
  dexId?: string;
  pairAddress?: string;
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  url?: string;
};

export type BccPoolSnapshot = {
  dex: "uniswap" | "aerodrome" | "balancer" | "pancakeswap" | "other";
  chainId: number;
  pairAddress: string | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceUsd: number | null;
  url: string | null;
};

export type BccPancakeConfig = {
  enabled: boolean;
  poolConfigured: boolean;
  poolLive: boolean;
  poolAddress: string | null;
  swapUrl: string | null;
  oftAddress: string | null;
};

export type BccAerodromeConfig = {
  enabled: boolean;
  poolConfigured: boolean;
  poolLive: boolean;
  poolAddress: string | null;
  gaugeAddress: string | null;
  lpTokenAddress: string | null;
  depositUrl: string | null;
  gaugeUrl: string | null;
  swapUrl: string | null;
  routing: "aerodrome" | "uniswap_fallback";
};

export type BccBalancerConfig = {
  enabled: boolean;
  poolConfigured: boolean;
  poolLive: boolean;
  poolAddress: string | null;
  bptAddress: string | null;
  gaugeAddress: string | null;
  depositUrl: string | null;
  gaugeUrl: string | null;
  swapUrl: string | null;
  ownerSafe: string;
};

export type BccLiquidityMarket = {
  symbol: string;
  chainId: number;
  tokenAddress: string | null;
  bscTokenAddress: string | null;
  uniswapUrl: string;
  discountBps: number;
  pools: BccPoolSnapshot[];
  combinedLiquidityUsd: number | null;
  baseLiquidityUsd: number | null;
  bscLiquidityUsd: number | null;
  aerodrome: BccAerodromeConfig;
  balancer: BccBalancerConfig;
  pancakeswap: BccPancakeConfig;
  redemption: {
    enabled: boolean;
    minPoolTvlUsd: number;
    combinedTvlUsd: number | null;
    percentToGate: number | null;
    pointsPerBccWei: string;
    rateConfigured: boolean;
    maxRedeemPointsPerDay: number;
    ready: boolean;
  };
  tradingAgentReachable?: boolean;
  quoteBccUrl?: string;
  note: string;
};

function envServer(key: string): string | undefined {
  return process.env[key]?.trim() || undefined;
}

function aerodromePoolFromEnv(): string | null {
  return envServer("VITE_BCC_AERODROME_POOL") || envServer("BCC_AERODROME_POOL") || null;
}

function aerodromeGaugeFromEnv(): string | null {
  return envServer("VITE_BCC_AERODROME_GAUGE") || envServer("BCC_AERODROME_GAUGE") || null;
}

function aerodromeLpFromEnv(): string | null {
  return envServer("VITE_BCC_AERODROME_LP_TOKEN") || envServer("BCC_AERODROME_LP_TOKEN") || null;
}

function balancerPoolFromEnv(): string | null {
  return envServer("VITE_BCC_BALANCER_POOL") || envServer("BCC_BALANCER_POOL") || null;
}

function balancerBptFromEnv(): string | null {
  return envServer("VITE_BCC_BALANCER_BPT") || envServer("BCC_BALANCER_BPT") || null;
}

function balancerGaugeFromEnv(): string | null {
  return envServer("VITE_BCC_BALANCER_GAUGE") || envServer("BCC_BALANCER_GAUGE") || null;
}

function classifyDex(dexId: string | undefined): BccPoolSnapshot["dex"] {
  const d = (dexId ?? "").toLowerCase();
  if (d.includes("uniswap")) return "uniswap";
  if (d.includes("aerodrome") || d === "aero") return "aerodrome";
  if (d.includes("balancer")) return "balancer";
  if (d.includes("pancake")) return "pancakeswap";
  return "other";
}

function pairChainId(pair: DexPair): number {
  const id = pair.chainId;
  if (id === "base" || id === 8453) return 8453;
  if (id === "bsc" || id === 56) return 56;
  return Number(id) || 8453;
}

function pairToSnapshot(pair: DexPair): BccPoolSnapshot {
  return {
    dex: classifyDex(pair.dexId),
    chainId: pairChainId(pair),
    pairAddress: pair.pairAddress ?? null,
    liquidityUsd: pair.liquidity?.usd ?? null,
    volume24hUsd: pair.volume?.h24 ?? null,
    priceUsd: pair.priceUsd != null ? Number(pair.priceUsd) : null,
    url: pair.url ?? null,
  };
}

async function fetchDexScreenerPools(token: string): Promise<BccPoolSnapshot[]> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`, {
      signal: AbortSignal.timeout(12_000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { pairs?: DexPair[] };
    return (data.pairs ?? [])
      .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))
      .slice(0, 8)
      .map(pairToSnapshot);
  } catch {
    return [];
  }
}

function bscOftFromEnv(): string | null {
  return envServer("VITE_BCC_BSC_OFT_ADDRESS") || envServer("BCC_BSC_OFT_ADDRESS") || null;
}

function pancakePoolFromEnv(): string | null {
  return envServer("VITE_BCC_PANCAKE_POOL") || envServer("BCC_PANCAKE_POOL") || null;
}

function aerodromeEnabledServer(): boolean {
  return isAerodromeLiquidityEnabled(process.env as Record<string, string | undefined>);
}

function balancerEnabledServer(): boolean {
  return isBalancerLiquidityEnabled(process.env as Record<string, string | undefined>);
}

export function buildAerodromeUrls(
  pool: string | null,
  gauge: string | null,
  enabled: boolean,
): {
  depositUrl: string | null;
  gaugeUrl: string | null;
  swapUrl: string | null;
} {
  if (!enabled && !pool && !gauge) {
    return { depositUrl: null, gaugeUrl: null, swapUrl: null };
  }
  const depositUrl = BCC_AERODROME.depositUrl;
  const gaugeUrl = gauge
    ? aerodromeGaugeUrl(gauge)
    : pool
      ? aerodromeGaugeUrl(pool)
      : enabled
        ? depositUrl
        : null;
  const swapUrl = enabled || pool ? BCC_AERODROME.swapUrl : null;
  return { depositUrl, gaugeUrl, swapUrl };
}

export function buildBalancerUrls(
  pool: string | null,
  gauge: string | null,
  enabled: boolean,
): {
  depositUrl: string | null;
  gaugeUrl: string | null;
  swapUrl: string | null;
} {
  if (!enabled && !pool && !gauge) {
    return { depositUrl: null, gaugeUrl: null, swapUrl: null };
  }
  const depositUrl = pool ? balancerPoolUrl(pool) : BCC_BALANCER.createPoolUrl;
  const gaugeUrl = gauge
    ? balancerGaugeUrl(gauge)
    : pool
      ? balancerGaugeUrl(pool)
      : enabled
        ? BCC_BALANCER.explorePoolsUrl
        : null;
  const swapUrl = enabled || pool ? balancerSwapUrl() : null;
  return { depositUrl, gaugeUrl, swapUrl };
}

function buildMarketNote(opts: {
  pancakeLive: boolean;
  aerodromePoolLive: boolean;
  balancerPoolLive: boolean;
  aerodromeEnabled: boolean;
  balancerEnabled: boolean;
  bscOft: string | null;
}): string {
  const venues: string[] = ["Uniswap primary on Base"];
  if (opts.aerodromePoolLive || opts.aerodromeEnabled) venues.push("Aerodrome secondary");
  if (opts.balancerPoolLive || opts.balancerEnabled) venues.push("Balancer DAO treasury pool");
  if (opts.pancakeLive) venues.push("BSC PancakeSwap via OFT");
  if (opts.pancakeLive) {
    return `BCC liquidity: ${venues.join("; ")}.`;
  }
  if (opts.balancerPoolLive) {
    return "BCC on Uniswap (primary), Aerodrome, and Balancer on Base — DAO Safe owns Balancer pool policy.";
  }
  if (opts.aerodromePoolLive) {
    return "BCC is routable on Aerodrome; Uniswap remains primary on Base.";
  }
  if (opts.balancerEnabled) {
    return "Balancer BCC/WETH enabled — create or seed via Balancer UI (Safe owner); Uniswap is live today.";
  }
  if (opts.bscOft) {
    return "BSC OFT configured — seed PancakeSwap BCC/WBNB pool via npm run pancakeswap:seed.";
  }
  if (opts.aerodromeEnabled) {
    return "Aerodrome BCC/WETH enabled — create or seed the pool via deposit link; Uniswap is live today.";
  }
  return "BCC primary liquidity is on Uniswap. Enable Aerodrome or Balancer env after operator deploy.";
}

export async function buildBccLiquidityMarket(opts?: {
  tradingAgentReachable?: boolean;
  quoteBccUrl?: string;
}): Promise<BccLiquidityMarket> {
  const bscOft = bscOftFromEnv();
  const [basePools, bscPools] = await Promise.all([
    fetchDexScreenerPools(BCC_TOKEN_BASE),
    bscOft ? fetchDexScreenerPools(bscOft) : Promise.resolve([]),
  ]);
  const pools = [...basePools, ...bscPools].sort(
    (a, b) => (b.liquidityUsd ?? 0) - (a.liquidityUsd ?? 0),
  );
  const aerodromePool = aerodromePoolFromEnv();
  const aerodromeGauge = aerodromeGaugeFromEnv();
  const aerodromeLp = aerodromeLpFromEnv();
  const dexAerodromePair = pools.find((p) => p.dex === "aerodrome" && p.pairAddress);
  const resolvedPool = aerodromePool ?? dexAerodromePair?.pairAddress ?? null;
  const enabled = aerodromeEnabledServer();
  const { depositUrl, gaugeUrl, swapUrl } = buildAerodromeUrls(
    resolvedPool,
    aerodromeGauge,
    enabled,
  );

  const balancerPool = balancerPoolFromEnv();
  const balancerBpt = balancerBptFromEnv();
  const balancerGauge = balancerGaugeFromEnv();
  const dexBalancerPair = pools.find((p) => p.dex === "balancer" && p.pairAddress);
  const resolvedBalancerPool = balancerPool ?? dexBalancerPair?.pairAddress ?? null;
  const resolvedBalancerBpt = balancerBpt ?? resolvedBalancerPool;
  const balancerEnabled = balancerEnabledServer();
  const balancerUrls = buildBalancerUrls(resolvedBalancerPool, balancerGauge, balancerEnabled);

  const baseLiquidityUsd = basePools.reduce((s, p) => s + (p.liquidityUsd ?? 0), 0) || null;
  const bscLiquidityUsd = bscPools.reduce((s, p) => s + (p.liquidityUsd ?? 0), 0) || null;
  const combined = pools.length > 0 ? pools.reduce((s, p) => s + (p.liquidityUsd ?? 0), 0) : null;

  const pancakePool = pancakePoolFromEnv();
  const dexPancakePair = pools.find((p) => p.dex === "pancakeswap" && p.chainId === BSC_CHAIN_ID);
  const resolvedPancakePool = pancakePool ?? dexPancakePair?.pairAddress ?? null;
  const pancakeLive = pools.some(
    (p) => p.dex === "pancakeswap" && p.chainId === BSC_CHAIN_ID && (p.liquidityUsd ?? 0) > 0,
  );

  const minTvl = redemptionPolicy.minPoolTvlUsd;
  const redeemEnabled =
    process.env.VITE_POINTS_REDEEM_ENABLED === "1" || process.env.POINTS_REDEEM_ENABLED === "1";
  const pointsPerBccWei =
    process.env.POINTS_PER_BCC_WEI?.trim() || process.env.VITE_POINTS_PER_BCC_WEI?.trim() || "0";
  const rateConfigured = (() => {
    try {
      return BigInt(pointsPerBccWei) > 0n;
    } catch {
      return false;
    }
  })();
  const tvl = combined ?? 0;
  const percentToGate =
    combined != null && minTvl > 0 ? Math.min(100, Math.round((tvl / minTvl) * 100)) : null;

  const poolLive = pools.some((p) => p.dex === "aerodrome" && (p.liquidityUsd ?? 0) > 0);
  const balancerPoolLive = pools.some((p) => p.dex === "balancer" && (p.liquidityUsd ?? 0) > 0);
  const hasAerodromeRouting = Boolean(resolvedPool) || poolLive;

  return {
    symbol: "$BCC",
    chainId: 8453,
    tokenAddress: getBccTokenAddress() ?? BCC_TOKEN_BASE,
    bscTokenAddress: bscOft,
    uniswapUrl: process.env.VITE_BCC_UNISWAP_URL?.trim() || BCC_UNISWAP_URL,
    discountBps: Number(process.env.VITE_BCC_DISCOUNT_BPS ?? "1111"),
    pools,
    combinedLiquidityUsd: combined,
    baseLiquidityUsd,
    bscLiquidityUsd: bscOft ? bscLiquidityUsd : null,
    aerodrome: {
      enabled,
      poolConfigured: Boolean(resolvedPool),
      poolLive,
      poolAddress: resolvedPool,
      gaugeAddress: aerodromeGauge,
      lpTokenAddress: aerodromeLp ?? resolvedPool,
      depositUrl,
      gaugeUrl,
      swapUrl,
      routing: hasAerodromeRouting ? "aerodrome" : "uniswap_fallback",
    },
    balancer: {
      enabled: balancerEnabled,
      poolConfigured: Boolean(resolvedBalancerPool),
      poolLive: balancerPoolLive,
      poolAddress: resolvedBalancerPool,
      bptAddress: resolvedBalancerBpt,
      gaugeAddress: balancerGauge,
      depositUrl: balancerUrls.depositUrl,
      gaugeUrl: balancerUrls.gaugeUrl,
      swapUrl: balancerUrls.swapUrl,
      ownerSafe: BCC_BALANCER.protocolSafe,
    },
    pancakeswap: {
      enabled: Boolean(bscOft),
      poolConfigured: Boolean(resolvedPancakePool),
      poolLive: pancakeLive,
      poolAddress: resolvedPancakePool,
      swapUrl: bscOft ? "https://pancakeswap.finance/swap?chain=bsc" : null,
      oftAddress: bscOft,
    },
    redemption: {
      enabled: redeemEnabled,
      minPoolTvlUsd: minTvl,
      combinedTvlUsd: combined,
      percentToGate,
      pointsPerBccWei,
      rateConfigured,
      maxRedeemPointsPerDay: redemptionPolicy.maxRedeemPointsPerDay,
      ready: redeemEnabled && rateConfigured && tvl >= minTvl,
    },
    tradingAgentReachable: opts?.tradingAgentReachable,
    quoteBccUrl: opts?.quoteBccUrl,
    note: buildMarketNote({
      pancakeLive,
      aerodromePoolLive: poolLive,
      balancerPoolLive,
      aerodromeEnabled: enabled,
      balancerEnabled,
      bscOft,
    }),
  };
}
