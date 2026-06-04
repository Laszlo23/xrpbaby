/**
 * Rentable trading agent SKU — advertised in agent.json and /api/trading/manifest.
 */
import { getServerPublicOrigin } from "@/lib/app-origin";

export type TradingAgentOffer = {
  schema_version: "1";
  product: "buildchain_trading_agent_v1";
  name: string;
  description: string;
  chainId: number;
  dex: "aerodrome";
  sdk: "velodrome-sugar-sdk@0.4.2";
  settlement: "x402";
  pricing: {
    quote: { price_env: string; default_usd: string; method: string; path: string };
    quote_bcc: { price_env: string; default_usd: string; method: string; path: string };
    pools: { price_env: string; default_usd: string; method: string; path: string };
    swap_preview: {
      price_env: string;
      default_usd: string;
      method: string;
      path: string;
      note: string;
    };
  };
  free: { health: string; manifest: string };
  safety: string;
};

export function x402TradingQuotePrice(): string {
  return (process.env.X402_TRADING_QUOTE_PRICE?.trim() || "$0.05") as string;
}

export function x402TradingPoolsPrice(): string {
  return (process.env.X402_TRADING_POOLS_PRICE?.trim() || "$0.03") as string;
}

export function x402TradingSwapPreviewPrice(): string {
  return (process.env.X402_TRADING_SWAP_PRICE?.trim() || "$0.15") as string;
}

export function tradingInternalSecret(): string | undefined {
  return process.env.TRADING_AGENT_INTERNAL_SECRET?.trim() || undefined;
}

export function isTradingInternalRequest(request: Request): boolean {
  const secret = tradingInternalSecret();
  if (!secret) return false;
  const hdr = request.headers.get("x-trading-internal-secret");
  return hdr === secret;
}

export function buildTradingAgentOffer(): TradingAgentOffer {
  const base = getServerPublicOrigin().replace(/\/$/, "");
  return {
    schema_version: "1",
    product: "buildchain_trading_agent_v1",
    name: "BUILDCHAIN Trading Agent",
    description:
      "Rentable Aerodrome quotes and pool intelligence on Base (sugar-sdk). Pay per call via x402; unsigned swap previews for your wallet to sign.",
    chainId: 8453,
    dex: "aerodrome",
    sdk: "velodrome-sugar-sdk@0.4.2",
    settlement: "x402",
    pricing: {
      quote: {
        price_env: "X402_TRADING_QUOTE_PRICE",
        default_usd: "0.05",
        method: "GET",
        path: "/api/trading/quote",
      },
      quote_bcc: {
        price_env: "X402_TRADING_QUOTE_PRICE",
        default_usd: "0.05",
        method: "GET",
        path: "/api/trading/quote-bcc",
      },
      pools: {
        price_env: "X402_TRADING_POOLS_PRICE",
        default_usd: "0.03",
        method: "GET",
        path: "/api/trading/pools",
      },
      swap_preview: {
        price_env: "X402_TRADING_SWAP_PRICE",
        default_usd: "0.15",
        method: "GET",
        path: "/api/trading/swap-preview",
        note: "Returns unsigned txs only — caller signs. Disabled when Python TRADING_AGENT_PAPER_MODE=1.",
      },
    },
    free: {
      health: `${base}/api/trading/health`,
      manifest: `${base}/api/trading/manifest`,
    },
    safety:
      "No custody. Quotes are read-only. Swap previews are unsigned calldata — integrate with Privy, Safe, or cast.",
  };
}
