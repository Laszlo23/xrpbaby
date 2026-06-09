import type { PrismaClient } from "@prisma/client";
import {
  BASE_MAINNET_CHAIN_ID,
  resolveRaffleCampaignAddress,
  resolveAgentShareCampaignAddress,
  type EnvLike,
} from "@bc/contracts-sdk";
import { createPublicClient, erc20Abi, http, type Address } from "viem";
import { base } from "viem/chains";

import { pulseStreamFlags } from "@/server/pulse/config";
import { getPulseMetrics } from "@/server/pulse/metrics";
import { buildBccLiquidityMarket } from "@/server/liquidity/bcc-pools";
import { fetchMarketListings } from "@/server/market/thirdweb";
import { getBccTokenAddress } from "@/server/market/env";
import {
  groveFarcasterConfigured,
} from "@/server/marketing/grove/farcaster-post";
import { groveTelegramConfigured } from "@/server/marketing/grove/telegram-post";
import { groveXConfigured } from "@/server/marketing/grove/x-client";

const erc721TotalSupplyAbi = [
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

function env(): EnvLike {
  return process.env as EnvLike;
}

function baseRpc(): string {
  return (
    process.env.BASE_RPC_URL?.trim() ||
    process.env.VITE_BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org"
  );
}

async function readErc20TotalSupply(token: Address): Promise<string | null> {
  try {
    const client = createPublicClient({ chain: base, transport: http(baseRpc()) });
    const raw = await client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "totalSupply",
    });
    return raw.toString();
  } catch {
    return null;
  }
}

async function readErc721TotalSupply(contract: Address): Promise<number | null> {
  try {
    const client = createPublicClient({ chain: base, transport: http(baseRpc()) });
    const raw = await client.readContract({
      address: contract,
      abi: erc721TotalSupplyAbi,
      functionName: "totalSupply",
    });
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export type InvestorTraction = {
  capturedAt: string;
  product: {
    members: number;
    membersWithWallet: number;
    membersWithFarcaster: number;
    membersWithTelegram: number;
    waitlist: number;
    culturePointsNet: number;
    activity24h: number;
    packPurchases: number;
    packRevenueUsd: number;
    panicVoucherClaims: number;
    panicVouchersMinted: number;
    bccSettlementsPending: number;
    bccSettlementsCredited: number;
    pointRedemptions: number;
  };
  social: {
    streams: ReturnType<typeof pulseStreamFlags>;
    outbound: {
      xConfigured: boolean;
      farcasterConfigured: boolean;
      telegramConfigured: boolean;
    };
    ingestedPosts: {
      farcaster: number;
      x: number;
      facebook: number;
      tiktok: number;
      instagram: number;
      nativeComments: number;
    };
    linkedAccounts: {
      farcaster: number;
      x: number;
      tiktok: number;
      github: number;
      telegram: number;
    };
    verifiedLinkedAccounts: {
      farcaster: number;
      x: number;
      tiktok: number;
      github: number;
      telegram: number;
    };
  };
  mints: {
    onChain: {
      bccTotalSupplyWei: string | null;
      raffleTicketsMinted: number | null;
      agentShareTokensMinted: number | null;
      contracts: {
        bcc: string | null;
        raffle: string | null;
        agentShare: string | null;
      };
    };
    inApp: {
      packPurchases: number;
      panicVoucherMinted: number;
      panicVoucherPending: number;
    };
  };
  market: {
    combinedLiquidityUsd: number | null;
    volume24hUsd: number | null;
    discountBps: number;
    activeListings: number | null;
  };
};

export async function getInvestorTraction(prisma: PrismaClient): Promise<InvestorTraction> {
  const e = env();

  const [
    pulse,
    memberWithWallet,
    memberWithFarcaster,
    membersWithTelegram,
    packAgg,
    packCount,
    panicTotal,
    panicMinted,
    panicPending,
    bccPending,
    bccCredited,
    pointRedemptions,
    socialByPlatform,
    verifiedByPlatform,
    feedFarcaster,
    feedX,
    feedFacebook,
    feedTiktok,
    feedInstagram,
    nativeComments,
    listings,
    liquidity,
    bccSupply,
    raffleSupply,
    agentShareSupply,
  ] = await Promise.all([
    getPulseMetrics(prisma),
    prisma.member.count({ where: { walletAddress: { not: null } } }),
    prisma.member.count({ where: { farcasterFid: { not: null } } }),
    prisma.socialAccount.count({ where: { platform: "telegram" } }),
    prisma.packPurchase.aggregate({ _sum: { usdCents: true } }),
    prisma.packPurchase.count(),
    prisma.panicVoucherClaim.count(),
    prisma.panicVoucherClaim.count({ where: { status: "minted" } }),
    prisma.panicVoucherClaim.count({ where: { status: { not: "minted" } } }),
    prisma.bccSettlement.count({ where: { status: "pending" } }),
    prisma.bccSettlement.count({ where: { status: "credited" } }),
    prisma.pointRedemption.count(),
    prisma.socialAccount.groupBy({ by: ["platform"], _count: { _all: true } }),
    prisma.socialAccount.groupBy({
      by: ["platform"],
      where: { verified: true },
      _count: { _all: true },
    }),
    prisma.socialFeedItem.count({ where: { platform: "farcaster" } }),
    prisma.socialFeedItem.count({ where: { platform: "x" } }),
    prisma.socialFeedItem.count({ where: { platform: "facebook" } }),
    prisma.socialFeedItem.count({ where: { platform: "tiktok" } }),
    prisma.socialFeedItem.count({ where: { platform: "instagram" } }),
    prisma.socialComment.count(),
    fetchMarketListings({ limit: 100 }),
    buildBccLiquidityMarket({ tradingAgentReachable: false }),
    (async () => {
      const token = getBccTokenAddress();
      return token ? readErc20TotalSupply(token) : null;
    })(),
    (async () => {
      const addr = resolveRaffleCampaignAddress(BASE_MAINNET_CHAIN_ID, e);
      return addr ? readErc721TotalSupply(addr) : null;
    })(),
    (async () => {
      const addr = resolveAgentShareCampaignAddress(BASE_MAINNET_CHAIN_ID, e);
      return addr ? readErc721TotalSupply(addr) : null;
    })(),
  ]);

  const volume24h = liquidity.pools.reduce((sum, p) => sum + (p.volume24hUsd ?? 0), 0);

  const linkedMap = Object.fromEntries(
    socialByPlatform.map((row) => [row.platform, row._count._all]),
  ) as Record<string, number>;
  const verifiedMap = Object.fromEntries(
    verifiedByPlatform.map((row) => [row.platform, row._count._all]),
  ) as Record<string, number>;

  const packRevenueUsd = (packAgg._sum.usdCents ?? 0) / 100;

  return {
    capturedAt: new Date().toISOString(),
    product: {
      members: pulse.memberCount,
      membersWithWallet: memberWithWallet,
      membersWithFarcaster: memberWithFarcaster,
      membersWithTelegram: membersWithTelegram,
      waitlist: pulse.waitlistCount,
      culturePointsNet: pulse.culturePoints,
      activity24h: pulse.activity24h,
      packPurchases: packCount,
      packRevenueUsd: packRevenueUsd,
      panicVoucherClaims: panicTotal,
      panicVouchersMinted: panicMinted,
      bccSettlementsPending: bccPending,
      bccSettlementsCredited: bccCredited,
      pointRedemptions,
    },
    social: {
      streams: pulseStreamFlags(),
      outbound: {
        xConfigured: groveXConfigured(),
        farcasterConfigured: groveFarcasterConfigured(),
        telegramConfigured: groveTelegramConfigured(),
      },
      ingestedPosts: {
        farcaster: feedFarcaster,
        x: feedX,
        facebook: feedFacebook,
        tiktok: feedTiktok,
        instagram: feedInstagram,
        nativeComments,
      },
      linkedAccounts: {
        farcaster: linkedMap.farcaster ?? 0,
        x: linkedMap.x ?? 0,
        tiktok: linkedMap.tiktok ?? 0,
        github: linkedMap.github ?? 0,
        telegram: linkedMap.telegram ?? 0,
      },
      verifiedLinkedAccounts: {
        farcaster: verifiedMap.farcaster ?? 0,
        x: verifiedMap.x ?? 0,
        tiktok: verifiedMap.tiktok ?? 0,
        github: verifiedMap.github ?? 0,
        telegram: verifiedMap.telegram ?? 0,
      },
    },
    mints: {
      onChain: {
        bccTotalSupplyWei: bccSupply,
        raffleTicketsMinted: raffleSupply,
        agentShareTokensMinted: agentShareSupply,
        contracts: {
          bcc: getBccTokenAddress() ?? null,
          raffle: resolveRaffleCampaignAddress(BASE_MAINNET_CHAIN_ID, e) ?? null,
          agentShare: resolveAgentShareCampaignAddress(BASE_MAINNET_CHAIN_ID, e) ?? null,
        },
      },
      inApp: {
        packPurchases: packCount,
        panicVoucherMinted: panicMinted,
        panicVoucherPending: panicPending,
      },
    },
    market: {
      combinedLiquidityUsd: liquidity.combinedLiquidityUsd,
      volume24hUsd: volume24h || null,
      discountBps: liquidity.discountBps,
      activeListings: listings.ok ? listings.listings.length : null,
    },
  };
}
