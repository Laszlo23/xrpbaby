import { BCC_UNISWAP_URL } from "@bc/bcc-kit";

import { BCC_AERODROME, aerodromeGaugeUrl, isAerodromeLiquidityEnabled } from "@/lib/aerodrome-bcc";
import { redemptionPolicy } from "@/lib/redemption-policy";
import { getBccTokenAddress } from "@/server/market/env";

const BCC_TOKEN = "0xb890a5289f789f1346032ccc1847939e855fab07";
const DEXSCREENER_URL = `https://api.dexscreener.com/latest/dex/tokens/${BCC_TOKEN}`;

type DexPair = {
  dexId?: string;
  pairAddress?: string;
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  url?: string;
};

export type BccPoolSnapshot = {
  dex: "uniswap" | "aerodrome" | "other";
  pairAddress: string | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceUsd: number | null;
  url: string | null;
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

export type BccLiquidityMarket = {
  symbol: string;
  chainId: number;
  tokenAddress: string | null;
  uniswapUrl: string;
  discountBps: number;
  pools: BccPoolSnapshot[];
  combinedLiquidityUsd: number | null;
  aerodrome: BccAerodromeConfig;
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

function classifyDex(dexId: string | undefined): BccPoolSnapshot["dex"] {
  const d = (dexId ?? "").toLowerCase();
  if (d.includes("uniswap")) return "uniswap";
  if (d.includes("aerodrome") || d === "aero") return "aerodrome";
  return "other";
}

function pairToSnapshot(pair: DexPair): BccPoolSnapshot {
  return {
    dex: classifyDex(pair.dexId),
    pairAddress: pair.pairAddress ?? null,
    liquidityUsd: pair.liquidity?.usd ?? null,
    volume24hUsd: pair.volume?.h24 ?? null,
    priceUsd: pair.priceUsd != null ? Number(pair.priceUsd) : null,
    url: pair.url ?? null,
  };
}

async function fetchDexScreenerPools(): Promise<BccPoolSnapshot[]> {
  try {
    const res = await fetch(DEXSCREENER_URL, {
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

function aerodromeEnabledServer(): boolean {
  return isAerodromeLiquidityEnabled(process.env as Record<string, string | undefined>);
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

export async function buildBccLiquidityMarket(opts?: {
  tradingAgentReachable?: boolean;
  quoteBccUrl?: string;
}): Promise<BccLiquidityMarket> {
  const pools = await fetchDexScreenerPools();
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

  const uniswapTvl = pools
    .filter((p) => p.dex === "uniswap")
    .reduce((s, p) => s + (p.liquidityUsd ?? 0), 0);
  const aerodromeTvl = pools
    .filter((p) => p.dex === "aerodrome")
    .reduce((s, p) => s + (p.liquidityUsd ?? 0), 0);
  const combined = pools.length > 0 ? pools.reduce((s, p) => s + (p.liquidityUsd ?? 0), 0) : null;

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
  const hasAerodromeRouting = Boolean(resolvedPool) || poolLive;

  return {
    symbol: "$BCC",
    chainId: 8453,
    tokenAddress: getBccTokenAddress() ?? BCC_TOKEN,
    uniswapUrl: process.env.VITE_BCC_UNISWAP_URL?.trim() || BCC_UNISWAP_URL,
    discountBps: Number(process.env.VITE_BCC_DISCOUNT_BPS ?? "1111"),
    pools,
    combinedLiquidityUsd: combined,
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
    note: poolLive
      ? "BCC is routable on Aerodrome; Uniswap remains primary for concentrated liquidity."
      : enabled
        ? "Aerodrome BCC/WETH enabled — create or seed the pool via deposit link; Uniswap is live today."
        : "BCC primary liquidity is on Uniswap. Set VITE_BCC_AERODROME_ENABLED=1 or VITE_BCC_AERODROME_POOL after deploy.",
  };
}
