/**
 * Dynamic ERC-8004 / A2A-style discovery payload for /.well-known/agent.json
 */
import { getServerPublicOrigin } from "@/lib/app-origin";
import { buildMarketOffer } from "@/lib/market-offer";
import {
  buildTradingAgentOffer,
  x402TradingPoolsPrice,
  x402TradingQuotePrice,
  x402TradingSwapPreviewPrice,
} from "@/lib/trading-agent-offer";

export type BuildchainAgentCard = {
  schema_version: string;
  name: string;
  description: string;
  kind: "a2a";
  canonical_url: string;
  capabilities: string[];
  resources: Array<{
    id: string;
    description: string;
    protocol: string;
    method: string;
    url: string;
    price_env: string;
  }>;
  deeplinks: Record<string, string>;
};

/** Public agent card JSON — safe to cache; URLs derived from PUBLIC_APP_ORIGIN / VITE_APP_ORIGIN / URL */
export function buildBuildchainAgentCard(): BuildchainAgentCard {
  const origin = getServerPublicOrigin();
  const base = origin.replace(/\/$/, "");
  const x402Url = `${base}/api/x402/premium`;
  const trading = buildTradingAgentOffer();
  const market = buildMarketOffer();

  return {
    schema_version: "1",
    name: "BUILDCHAIN",
    description:
      "Building Culture BUILDCHAIN: rentable Aerodrome trading agent (x402), paid feeds, BCC acquisition, NFT marketplace.",
    kind: "a2a",
    canonical_url: base,
    capabilities: [
      "x402-trading-agent",
      "x402-json-feed",
      "bcd-fixed-price-sale",
      "thirdweb-marketplace",
      "farcaster-miniapp",
    ],
    resources: [
      {
        id: "buildchain_premium_drop_teasers_v1",
        description:
          "Paid JSON feed of public drop teaser metadata (titles, rarity, timing). GET with x402 payment.",
        protocol: "x402",
        method: "GET",
        url: x402Url,
        price_env: "X402_PRICE",
      },
      {
        id: "buildchain_trading_quote_v1",
        description: trading.description,
        protocol: "x402",
        method: "GET",
        url: `${base}${trading.pricing.quote_bcc.path}?eth_amount=0.01`,
        price_env: trading.pricing.quote.price_env,
      },
      {
        id: "buildchain_trading_pools_v1",
        description: "Aerodrome pools for BCC on Base (sugar-sdk). GET with x402 payment.",
        protocol: "x402",
        method: "GET",
        url: `${base}${trading.pricing.pools.path}?limit=10`,
        price_env: trading.pricing.pools.price_env,
      },
      {
        id: "buildchain_trading_swap_preview_v1",
        description: trading.pricing.swap_preview.note,
        protocol: "x402",
        method: "GET",
        url: `${base}${trading.pricing.swap_preview.path}`,
        price_env: trading.pricing.swap_preview.price_env,
      },
      {
        id: "buildchain_market_listings_v1",
        description: "thirdweb Marketplace V3 listings on Base (JSON for agents).",
        protocol: "https",
        method: "GET",
        url: market.endpoints.listings,
        price_env: "",
      },
      {
        id: "buildchain_market_sample_mint_v1",
        description:
          "Sample Culture Layer identity mint — availability, metadata, unsigned mint calldata (~$1.11 ETH on Base).",
        protocol: "https",
        method: "GET",
        url: `${market.endpoints.sample_mint}?handle=buildchain-demo&tld=.culture`,
        price_env: "",
      },
    ],
    deeplinks: {
      presale: `${base}/presale`,
      campaign: `${base}/campaign`,
      marketplace: `${base}/marketplace`,
      docs: `${base}/docs`,
      agent_fleet: `${base}/agent-fleet`,
      trading_agent: `${base}/trading-agent`,
      trading_manifest: trading.free.manifest,
      market_manifest: market.endpoints.manifest,
      market_sample_mint: market.endpoints.sample_mint,
    },
  };
}

/** Expose default x402 prices for ops dashboards (not part of public card schema). */
export function tradingAgentPricingHints() {
  return {
    quote: x402TradingQuotePrice(),
    pools: x402TradingPoolsPrice(),
    swapPreview: x402TradingSwapPreviewPrice(),
  };
}
