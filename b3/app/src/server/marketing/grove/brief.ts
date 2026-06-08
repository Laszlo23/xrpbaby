import type { PrismaClient } from "@prisma/client";

import { BCC_UNISWAP_URL } from "@bc/bcc-kit";

import { getServerPublicOrigin } from "@/lib/app-origin";
import { getBccTokenAddress } from "@/server/market/env";
import { getPulseMetrics } from "@/server/pulse/metrics";

const BCC_TOKEN = "0xb890a5289f789f1346032ccc1847939e855fab07";
const PULSE_ANCHOR = "0x503f8ad17c0fcdd84fbdbf7f51b41b39b02ebbae";
const DEXSCREENER_URL = `https://api.dexscreener.com/latest/dex/tokens/${BCC_TOKEN}`;

export type GroveBccMarket = {
  priceUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  change24hPct: number | null;
  buys24h: number | null;
  sells24h: number | null;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  source: "dexscreener" | "none";
};

export type GrovePulseSnapshot = {
  memberCount: number | null;
  activity24h: number | null;
  culturePoints: number | null;
  farcasterItems: number | null;
  xItems: number | null;
  capturedAt: string | null;
};

export type GroveBrief = {
  asOf: string;
  dayId: string;
  agentRef: string;
  bcc: GroveBccMarket & { token: string; uniswapUrl: string };
  pulse: GrovePulseSnapshot;
  chain: {
    pulseAnchor: string;
    digestUrl: string;
    agentIdUrl: string;
  };
  links: {
    join: string;
    signal: string;
    pass: string;
    agentCard: string;
  };
};

type DexPair = {
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
  marketCap?: number;
  fdv?: number;
};

function pickBestPair(pairs: DexPair[]): DexPair | null {
  if (pairs.length === 0) return null;
  return [...pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0] ?? null;
}

async function fetchDexScreenerBcc(): Promise<GroveBccMarket> {
  try {
    const res = await fetch(DEXSCREENER_URL, {
      signal: AbortSignal.timeout(12_000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return emptyBccMarket();
    }
    const data = (await res.json()) as { pairs?: DexPair[] };
    const pair = pickBestPair(data.pairs ?? []);
    if (!pair) return emptyBccMarket();
    return {
      priceUsd: pair.priceUsd != null ? Number(pair.priceUsd) : null,
      liquidityUsd: pair.liquidity?.usd ?? null,
      volume24hUsd: pair.volume?.h24 ?? null,
      change24hPct: pair.priceChange?.h24 ?? null,
      buys24h: pair.txns?.h24?.buys ?? null,
      sells24h: pair.txns?.h24?.sells ?? null,
      marketCapUsd: pair.marketCap ?? null,
      fdvUsd: pair.fdv ?? null,
      source: "dexscreener",
    };
  } catch {
    return emptyBccMarket();
  }
}

function emptyBccMarket(): GroveBccMarket {
  return {
    priceUsd: null,
    liquidityUsd: null,
    volume24hUsd: null,
    change24hPct: null,
    buys24h: null,
    sells24h: null,
    marketCapUsd: null,
    fdvUsd: null,
    source: "none",
  };
}

async function fetchPulseSnapshot(prisma: PrismaClient | null): Promise<GrovePulseSnapshot> {
  if (!prisma) {
    return {
      memberCount: null,
      activity24h: null,
      culturePoints: null,
      farcasterItems: null,
      xItems: null,
      capturedAt: null,
    };
  }
  try {
    const m = await getPulseMetrics(prisma);
    return {
      memberCount: m.memberCount,
      activity24h: m.activity24h,
      culturePoints: m.culturePoints,
      farcasterItems: m.farcasterItems,
      xItems: m.xItems,
      capturedAt: m.capturedAt.toISOString(),
    };
  } catch {
    return {
      memberCount: null,
      activity24h: null,
      culturePoints: null,
      farcasterItems: null,
      xItems: null,
      capturedAt: null,
    };
  }
}

export async function buildGroveBrief(
  prisma: PrismaClient | null,
  opts?: { agentRef?: string; origin?: string },
): Promise<GroveBrief> {
  const origin = (opts?.origin || getServerPublicOrigin()).replace(/\/$/, "");
  const agentRef = opts?.agentRef?.trim() || "grove";
  const dayId = new Date().toISOString().slice(0, 10);
  const ref = `agent_ref=${encodeURIComponent(agentRef)}`;

  const [bccMarket, pulse] = await Promise.all([fetchDexScreenerBcc(), fetchPulseSnapshot(prisma)]);

  const token = getBccTokenAddress()?.toLowerCase() || BCC_TOKEN;
  const uniswapUrl = process.env.VITE_BCC_UNISWAP_URL?.trim() || BCC_UNISWAP_URL;

  return {
    asOf: new Date().toISOString(),
    dayId,
    agentRef,
    bcc: { ...bccMarket, token, uniswapUrl },
    pulse,
    chain: {
      pulseAnchor: process.env.PULSE_ANCHOR_ADDRESS?.trim() || PULSE_ANCHOR,
      digestUrl: `${origin}/api/pulse/digest/${dayId}`,
      agentIdUrl: `${origin}/0g/agentid`,
    },
    links: {
      join: `${origin}/join?${ref}`,
      signal: `${origin}/signal?${ref}`,
      pass: `${origin}/pass?${ref}`,
      agentCard: `${origin}/.well-known/agent.json`,
    },
  };
}
