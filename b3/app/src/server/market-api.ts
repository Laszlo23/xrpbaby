import { BCC_SYMBOL, BCC_UNISWAP_URL } from "@bc/bcc-kit";

import { buildMarketOffer } from "@/lib/market-offer";
import { proxyTradingAgent } from "@/server/trading-agent-proxy";
import {
  getBccTokenAddress,
  getIdentityContractAddress,
  getIdentityV2ContractAddress,
  getMarketplaceChainId,
  getMarketplaceContractAddress,
  getMarketplaceFeeRecipient,
  getMarketplacePlatformFeeBps,
  getPitNftContractAddress,
  parseMarketplaceNetworkId,
} from "@/server/market/env";
import { fetchMarketListings } from "@/server/market/thirdweb";
import { buildSampleMintPayload } from "@/server/market/sample-mint";
import { getMarketThirdwebClient } from "@/server/market/thirdweb";

function json(data: unknown, status = 200, cacheSeconds = 60): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${cacheSeconds}`,
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function handleMarketManifestGet(): Promise<Response> {
  return json({
    ok: true,
    ...buildMarketOffer(),
    generatedAt: new Date().toISOString(),
  });
}

export async function handleMarketConfigGet(): Promise<Response> {
  const offer = buildMarketOffer();
  return json({
    ok: true,
    chainId: offer.chainId,
    marketplace: {
      network: parseMarketplaceNetworkId(),
      chainId: getMarketplaceChainId(),
      contractAddress: getMarketplaceContractAddress() ?? null,
      platformFeeBps: getMarketplacePlatformFeeBps() ?? null,
      feeRecipient: getMarketplaceFeeRecipient() ?? null,
      thirdwebConfigured: Boolean(getMarketThirdwebClient()),
    },
    bcc: {
      symbol: BCC_SYMBOL,
      tokenAddress: getBccTokenAddress() ?? null,
      uniswapUrl: process.env.VITE_BCC_UNISWAP_URL?.trim() || BCC_UNISWAP_URL,
      discountBps: Number(process.env.VITE_BCC_DISCOUNT_BPS ?? "1111"),
      oracleAddress: process.env.VITE_BCC_ORACLE_ADDRESS?.trim() || null,
      identityV2: getIdentityV2ContractAddress() ?? null,
      artHubV2: process.env.VITE_ART_HUB_V2_CONTRACT_ADDRESS?.trim() || null,
    },
    nft: {
      pitCollection: getPitNftContractAddress() ?? null,
      featuredLabel: process.env.VITE_FEATURED_COLLECTION_LABEL?.trim() || "OBC",
    },
    identity: {
      contractAddress: getIdentityContractAddress() ?? null,
      v2ContractAddress: getIdentityV2ContractAddress() ?? null,
      chainId: Number(process.env.VITE_IDENTITY_CHAIN_ID ?? "8453"),
    },
    endpoints: offer.endpoints,
    related: offer.related,
  });
}

export async function handleMarketListingsGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const collection = url.searchParams.get("collection") ?? undefined;
  const result = await fetchMarketListings({ limit, collection });
  if (!result.ok) {
    const status =
      result.error === "thirdweb_not_configured" || result.error === "marketplace_not_configured"
        ? 503
        : 502;
    return json({ ok: false, error: result.error, listings: [] }, status);
  }
  return json({
    ok: true,
    count: result.listings.length,
    marketplace: {
      chainId: getMarketplaceChainId(),
      contractAddress: getMarketplaceContractAddress() ?? null,
    },
    listings: result.listings,
  });
}

export async function handleMarketBccGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const ethAmount = url.searchParams.get("eth_amount")?.trim() || "0.01";
  const offer = buildMarketOffer();
  let tradingHealth:
    | { ok: true; data: unknown }
    | { ok: false; status: number; error: string; raw?: string } = {
    ok: false,
    status: 503,
    error: "Trading health probe failed",
  };
  try {
    tradingHealth = await proxyTradingAgent("/health", { method: "GET", timeoutMs: 15_000 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    tradingHealth = { ok: false, status: 503, error: `Trading health probe failed: ${msg}` };
  }

  const { buildBccLiquidityMarket } = await import("@/server/liquidity/bcc-pools");
  const liquidity = await buildBccLiquidityMarket({
    tradingAgentReachable: tradingHealth.ok,
    quoteBccUrl: `${offer.related.trading_quote_bcc}?eth_amount=${encodeURIComponent(ethAmount)}`,
  });

  return json({
    ok: true,
    ...liquidity,
    solanaRouteUrl: `${offer.endpoints.bcc_solana_route}?sol=1`,
    arbitrageScanUrl: offer.related.trading_arbitrage_scan,
  });
}

export async function handleMarketSampleMintGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const payload = await buildSampleMintPayload({
    handle: url.searchParams.get("handle") ?? undefined,
    tld: url.searchParams.get("tld") ?? undefined,
    wallet: url.searchParams.get("wallet") ?? undefined,
  });
  return json(payload, payload.ok ? 200 : 409);
}

export async function handleMarketHealthGet(): Promise<Response> {
  const offer = buildMarketOffer();
  let trading:
    | { ok: true; data: unknown }
    | { ok: false; status: number; error: string; raw?: string } = {
    ok: false,
    status: 503,
    error: "Trading health probe failed",
  };
  try {
    trading = await proxyTradingAgent("/health", { method: "GET", timeoutMs: 10_000 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    trading = { ok: false, status: 503, error: `Trading health probe failed: ${msg}` };
  }
  let listingsProbe: Awaited<ReturnType<typeof fetchMarketListings>> = {
    ok: false,
    error: "thirdweb_not_configured",
  };
  try {
    listingsProbe = await fetchMarketListings({ limit: 1 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    listingsProbe = {
      ok: false,
      error: `listings_probe_failed:${msg}`,
    };
  }
  const { getPrisma } = await import("@/server/db/prisma");
  const prisma = getPrisma();
  let pulseHealth: { database: boolean; latestSnapshotAt: string | null } = {
    database: Boolean(prisma),
    latestSnapshotAt: null,
  };
  if (prisma) {
    try {
      const latestSnapshot = await prisma.growthSnapshot.findFirst({
        orderBy: { capturedAt: "desc" },
        select: { capturedAt: true },
      });
      pulseHealth = {
        database: true,
        latestSnapshotAt: latestSnapshot?.capturedAt?.toISOString() ?? null,
      };
    } catch {
      pulseHealth = {
        database: false,
        latestSnapshotAt: null,
      };
    }
  }

  let groveHealth: {
    database: boolean;
    briefBuildOk: boolean;
    bccSource: string | null;
  } = {
    database: Boolean(prisma),
    briefBuildOk: false,
    bccSource: null,
  };
  if (prisma) {
    try {
      const { buildGroveBrief } = await import("@/server/marketing/grove/brief");
      const brief = await buildGroveBrief(prisma);
      groveHealth = {
        database: true,
        briefBuildOk: true,
        bccSource: brief.bcc.source,
      };
    } catch {
      groveHealth = {
        database: true,
        briefBuildOk: false,
        bccSource: null,
      };
    }
  }

  return json({
    ok: true,
    marketplace: {
      configured: Boolean(getMarketplaceContractAddress()),
      thirdweb: Boolean(getMarketThirdwebClient()),
      listingsOk: listingsProbe.ok,
      listingsError: listingsProbe.ok ? null : listingsProbe.error,
    },
    identity: {
      configured: Boolean(getIdentityContractAddress()),
    },
    bcc: {
      tokenConfigured: Boolean(getBccTokenAddress()),
    },
    trading: {
      reachable: trading.ok,
      worker: trading.ok ? trading.data : null,
    },
    pulse: pulseHealth,
    grove: groveHealth,
    offer,
  });
}

export async function handleMarketOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
