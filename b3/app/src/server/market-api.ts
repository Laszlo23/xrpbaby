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
  const tokenAddress = getBccTokenAddress();
  const offer = buildMarketOffer();

  const tradingHealth = await proxyTradingAgent("/health", { method: "GET", timeoutMs: 15_000 });

  return json({
    ok: true,
    symbol: BCC_SYMBOL,
    chainId: 8453,
    tokenAddress: tokenAddress ?? null,
    uniswapUrl: process.env.VITE_BCC_UNISWAP_URL?.trim() || BCC_UNISWAP_URL,
    discountBps: Number(process.env.VITE_BCC_DISCOUNT_BPS ?? "1111"),
    tradingAgentReachable: tradingHealth.ok,
    quoteBccUrl: `${offer.related.trading_quote_bcc}${url.searchParams.has("eth_amount") ? "" : `?eth_amount=${ethAmount}`}`,
    note: "BCC is acquired on Uniswap or via ETH→USDC Aerodrome proxy quote; BCC is not routed on Aerodrome.",
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
  const trading = await proxyTradingAgent("/health", { method: "GET", timeoutMs: 10_000 });
  const listingsProbe = await fetchMarketListings({ limit: 1 });

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
