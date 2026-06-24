/**
 * Dynamic ERC-8004 / A2A-style discovery payload for /.well-known/agent.json
 */
import { getServerPublicOrigin } from "@/lib/app-origin";
import { x402ResearchPrice } from "@/lib/agent-os-catalog";
import { LIMX_AGENT_PUBLIC_URL, x402LimxPrice } from "@/lib/limx-agent-config";
import { buildMarketOffer } from "@/lib/market-offer";
import {
  buildTradingAgentOffer,
  x402TradingPoolsPrice,
  x402TradingQuotePrice,
  x402TradingSwapPreviewPrice,
} from "@/lib/trading-agent-offer";
import {
  buildXtExchangeOffer,
  x402XtAccountPrice,
  x402XtMarketPrice,
  x402XtTradePrice,
} from "@/lib/xt-exchange-offer";

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
    stripeSku?: string;
    stripeCheckoutPath?: string;
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
  const xt = buildXtExchangeOffer();
  const stripeCheckoutPath = "/api/billing/stripe/checkout";

  function x402Resource(input: {
    id: string;
    description: string;
    method: string;
    url: string;
    price_env: string;
    stripeSku?: string;
  }) {
    return {
      ...input,
      protocol: "x402",
      stripeSku: input.stripeSku ?? input.id,
      stripeCheckoutPath,
    };
  }

  return {
    schema_version: "1",
    name: "BUILDCHAIN",
    description:
      "Building Culture BUILDCHAIN: rentable Aerodrome trading agent (x402), paid feeds, BCC acquisition, NFT marketplace.",
    kind: "a2a",
    canonical_url: base,
    capabilities: [
      "x402-trading-agent",
      "x402-xt-exchange",
      "x402-json-feed",
      "x402-research-agent",
      "x402-limx-revenue-agent",
      "bcd-fixed-price-sale",
      "thirdweb-marketplace",
      "farcaster-miniapp",
    ],
    resources: [
      x402Resource({
        id: "buildchain_premium_drop_teasers_v1",
        description:
          "Paid JSON feed of public drop teaser metadata (titles, rarity, timing). GET with x402 payment.",
        method: "GET",
        url: x402Url,
        price_env: "X402_PRICE",
      }),
      x402Resource({
        id: "buildchain_trading_quote_v1",
        description: trading.description,
        method: "GET",
        url: `${base}${trading.pricing.quote_bcc.path}?eth_amount=0.01`,
        price_env: trading.pricing.quote.price_env,
        stripeSku: "buildchain_trading_quote_bcc_v1",
      }),
      x402Resource({
        id: "buildchain_trading_pools_v1",
        description: "Aerodrome pools for BCC on Base (sugar-sdk). GET with x402 payment.",
        method: "GET",
        url: `${base}${trading.pricing.pools.path}?limit=10`,
        price_env: trading.pricing.pools.price_env,
      }),
      x402Resource({
        id: "buildchain_trading_swap_preview_v1",
        description: trading.pricing.swap_preview.note,
        method: "GET",
        url: `${base}${trading.pricing.swap_preview.path}`,
        price_env: trading.pricing.swap_preview.price_env,
      }),
      x402Resource({
        id: "buildchain_trading_arbitrage_scan_v1",
        description: trading.pricing.arbitrage_scan.note,
        method: "GET",
        url: `${base}${trading.pricing.arbitrage_scan.path}`,
        price_env: trading.pricing.arbitrage_scan.price_env,
      }),
      x402Resource({
        id: "buildchain_research_brief_v1",
        description:
          "Paid research brief — Web3, AI, ecosystem and competitor analysis. GET with q= query and x402 payment.",
        method: "GET",
        url: `${base}/api/agents/research?q=What+grants+fit+Base+AI+agents`,
        price_env: "X402_RESEARCH_PRICE",
      }),
      x402Resource({
        id: "limx_revenue_brief_v1",
        description:
          "Limx revenue brief — grants, partnerships, sponsors, and growth opportunities for Building Culture. USDC settles to Limx agent wallet on Base.",
        method: "GET",
        url: `${base}/api/agents/limx?q=Base+grants+and+partnerships+for+AI+community+identity`,
        price_env: "X402_LIMX_PRICE",
      }),
      x402Resource({
        id: "buildchain_xt_spot_ticker_v1",
        description: "XT.COM spot ticker (public market data). GET with x402 payment.",
        method: "GET",
        url: xt.paths.spotTicker,
        price_env: xt.pricing.market.price_env,
        stripeSku: "xt_spot_ticker_v1",
      }),
      x402Resource({
        id: "buildchain_xt_spot_balance_v1",
        description: "XT.COM spot account balance. GET with x402 payment.",
        method: "GET",
        url: xt.paths.spotBalance,
        price_env: xt.pricing.account.price_env,
        stripeSku: "xt_spot_balance_v1",
      }),
      x402Resource({
        id: "buildchain_xt_spot_order_v1",
        description: "XT.COM spot order placement. POST with confirm + x402 payment.",
        method: "POST",
        url: xt.paths.spotOrder,
        price_env: xt.pricing.trade.price_env,
        stripeSku: "xt_spot_order_v1",
      }),
      x402Resource({
        id: "buildchain_xt_futures_account_v1",
        description: "XT.COM USDT-M futures account equity. GET with x402 payment.",
        method: "GET",
        url: xt.paths.futuresAccount,
        price_env: xt.pricing.account.price_env,
        stripeSku: "xt_futures_account_v1",
      }),
      {
        id: "buildchain_market_bcc_solana_v1",
        description: "Solana → BCC buy routes (Jumper, deBridge) + price estimate.",
        protocol: "https",
        method: "GET",
        url: market.endpoints.bcc_solana_route,
        price_env: "",
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
      agent_os: `${base}/agent-os`,
      limx_wallet: LIMX_AGENT_PUBLIC_URL,
      limx_brief: `${base}/api/agents/limx?q=Base+grants+and+partnerships+for+AI+community+identity`,
      trading_agent: `${base}/trading-agent`,
      trading_manifest: trading.free.manifest,
      xt_manifest: xt.paths.manifest,
      xt_health: xt.paths.health,
      billing: `${base}/billing`,
      stripe_manifest: `${base}/api/billing/stripe/manifest`,
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
    research: x402ResearchPrice(),
    limx: x402LimxPrice(),
    xtMarket: x402XtMarketPrice(),
    xtAccount: x402XtAccountPrice(),
    xtTrade: x402XtTradePrice(),
  };
}
