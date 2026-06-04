/**
 * BUILDCHAIN market API discovery — BCC, thirdweb marketplace, identity mint, trading cross-links.
 */
import { getServerPublicOrigin } from "@/lib/app-origin";

export const MARKET_API_SCHEMA_VERSION = "1";
export const MARKET_PRODUCT_ID = "buildchain_market_v1";

export type MarketOffer = {
  schema_version: string;
  product: string;
  name: string;
  description: string;
  chainId: number;
  endpoints: {
    manifest: string;
    config: string;
    listings: string;
    bcc: string;
    bcc_solana_route: string;
    sample_mint: string;
    health: string;
  };
  related: {
    trading_manifest: string;
    trading_quote_bcc: string;
    trading_arbitrage_scan: string;
    marketplace_ui: string;
    identity_pass_ui: string;
  };
};

export function buildMarketOffer(): MarketOffer {
  const base = getServerPublicOrigin().replace(/\/$/, "");
  return {
    schema_version: MARKET_API_SCHEMA_VERSION,
    product: MARKET_PRODUCT_ID,
    name: "BUILDCHAIN Market",
    description:
      "BCC token rails, thirdweb NFT marketplace listings, Culture Layer identity sample mint calldata, and links to the rentable trading agent.",
    chainId: 8453,
    endpoints: {
      manifest: `${base}/api/market/manifest`,
      config: `${base}/api/market/config`,
      listings: `${base}/api/market/listings`,
      bcc: `${base}/api/market/bcc`,
      bcc_solana_route: `${base}/api/market/bcc/solana-route`,
      sample_mint: `${base}/api/market/sample-mint`,
      health: `${base}/api/market/health`,
    },
    related: {
      trading_manifest: `${base}/api/trading/manifest`,
      trading_quote_bcc: `${base}/api/trading/quote-bcc?eth_amount=0.01`,
      trading_arbitrage_scan: `${base}/api/trading/arbitrage-scan?sol_amount=1&eth_amount=0.01`,
      marketplace_ui: `${base}/marketplace`,
      identity_pass_ui: `${base}/pass`,
    },
  };
}
