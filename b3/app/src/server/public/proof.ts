import { BCC_ADDRESS } from "@bc/bcc-kit";
import type { PrismaClient } from "@prisma/client";

import { getInvestorTraction } from "@/server/investors/traction";

const BCC_TOKEN = BCC_ADDRESS.toLowerCase();
const BLOCKSCOUT_COUNTERS = `https://base.blockscout.com/api/v2/tokens/${BCC_TOKEN}/counters`;
const DEXSCREENER_URL = `https://api.dexscreener.com/latest/dex/tokens/${BCC_TOKEN}`;

type DexPair = {
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  marketCap?: number;
  url?: string;
};

export type PublicProofStats = {
  capturedAt: string;
  community: {
    members: number;
    waitlist: number;
    membersWithWallet: number;
    membersWithFarcaster: number;
  };
  bcc: {
    tokenAddress: string;
    priceUsd: number | null;
    marketCapUsd: number | null;
    liquidityUsd: number | null;
    volume24hUsd: number | null;
    holders: number | null;
    holdersSource: "blockscout" | "none";
  };
  game: {
    raffleTicketsMinted: number | null;
    agentShareTokensMinted: number | null;
    culturePointsNet: number;
    activity24h: number;
  };
  market: {
    activeListings: number | null;
  };
  social: {
    verifiedLinkedAccounts: number;
  };
  commerce: {
    packPurchases: number;
  };
  proofUrls: {
    traction: string;
    grantProof: string;
    dexScreener: string;
    basescanToken: string;
    blockscoutToken: string;
  };
};

function pickBestPair(pairs: DexPair[]): DexPair | null {
  if (pairs.length === 0) return null;
  return [...pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0] ?? null;
}

async function fetchBccHolders(): Promise<{ count: number | null; source: "blockscout" | "none" }> {
  try {
    const res = await fetch(BLOCKSCOUT_COUNTERS, {
      signal: AbortSignal.timeout(10_000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return { count: null, source: "none" };
    const data = (await res.json()) as { token_holders_count?: string };
    const n = Number(data.token_holders_count);
    if (!Number.isFinite(n) || n < 0) return { count: null, source: "none" };
    return { count: n, source: "blockscout" };
  } catch {
    return { count: null, source: "none" };
  }
}

async function fetchBccMarket(): Promise<{
  priceUsd: number | null;
  marketCapUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  dexScreenerUrl: string;
}> {
  try {
    const res = await fetch(DEXSCREENER_URL, {
      signal: AbortSignal.timeout(12_000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return {
        priceUsd: null,
        marketCapUsd: null,
        liquidityUsd: null,
        volume24hUsd: null,
        dexScreenerUrl: `https://dexscreener.com/base/${BCC_TOKEN}`,
      };
    }
    const data = (await res.json()) as { pairs?: DexPair[] };
    const pair = pickBestPair(data.pairs ?? []);
    if (!pair) {
      return {
        priceUsd: null,
        marketCapUsd: null,
        liquidityUsd: null,
        volume24hUsd: null,
        dexScreenerUrl: `https://dexscreener.com/base/${BCC_TOKEN}`,
      };
    }
    return {
      priceUsd: pair.priceUsd != null ? Number(pair.priceUsd) : null,
      marketCapUsd: pair.marketCap ?? null,
      liquidityUsd: pair.liquidity?.usd ?? null,
      volume24hUsd: pair.volume?.h24 ?? null,
      dexScreenerUrl: pair.url ?? `https://dexscreener.com/base/${BCC_TOKEN}`,
    };
  } catch {
    return {
      priceUsd: null,
      marketCapUsd: null,
      liquidityUsd: null,
      volume24hUsd: null,
      dexScreenerUrl: `https://dexscreener.com/base/${BCC_TOKEN}`,
    };
  }
}

/** Marketing-safe, verifiable snapshot for landing pages and game UI. */
export async function getPublicProofStats(prisma: PrismaClient): Promise<PublicProofStats> {
  const [traction, holders, market] = await Promise.all([
    getInvestorTraction(prisma),
    fetchBccHolders(),
    fetchBccMarket(),
  ]);

  const product = traction.product;
  const social = traction.social;
  const verifiedSocial = Object.values(social.verifiedLinkedAccounts).reduce((a, b) => a + b, 0);

  return {
    capturedAt: new Date().toISOString(),
    community: {
      members: product.members,
      waitlist: product.waitlist,
      membersWithWallet: product.membersWithWallet,
      membersWithFarcaster: product.membersWithFarcaster,
    },
    bcc: {
      tokenAddress: BCC_TOKEN,
      priceUsd: market.priceUsd,
      marketCapUsd: market.marketCapUsd,
      liquidityUsd: market.liquidityUsd,
      volume24hUsd: market.volume24hUsd,
      holders: holders.count,
      holdersSource: holders.source,
    },
    game: {
      raffleTicketsMinted: traction.mints.onChain.raffleTicketsMinted,
      agentShareTokensMinted: traction.mints.onChain.agentShareTokensMinted,
      culturePointsNet: product.culturePointsNet,
      activity24h: product.activity24h,
    },
    market: {
      activeListings: traction.market.activeListings,
    },
    social: {
      verifiedLinkedAccounts: verifiedSocial,
    },
    commerce: {
      packPurchases: product.packPurchases,
    },
    proofUrls: {
      traction: "/api/investors/traction?view=proof",
      grantProof: "/grant-proof",
      dexScreener: market.dexScreenerUrl,
      basescanToken: `https://basescan.org/token/${BCC_TOKEN}`,
      blockscoutToken: `https://base.blockscout.com/token/${BCC_TOKEN}`,
    },
  };
}
