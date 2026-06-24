/**
 * XT.COM CEX trading SKU — advertised in agent.json and /api/trading/xt/manifest.
 */
import { getServerPublicOrigin } from "@/lib/app-origin";

export type XtExchangeOffer = {
  schema_version: "1";
  product: "buildchain_xt_exchange_v1";
  name: string;
  description: string;
  exchange: "xt.com";
  settlement: "x402";
  pricing: {
    market: { price_env: string; default_usd: string };
    account: { price_env: string; default_usd: string };
    trade: { price_env: string; default_usd: string };
  };
  paths: {
    manifest: string;
    health: string;
    spotTicker: string;
    spotBalance: string;
    spotOrder: string;
    futuresAccount: string;
    futuresOpen: string;
  };
  safety: string;
};

export function x402XtMarketPrice(): string {
  return (process.env.X402_XT_MARKET_PRICE?.trim() || "$0.03") as string;
}

export function x402XtAccountPrice(): string {
  return (process.env.X402_XT_ACCOUNT_PRICE?.trim() || "$0.05") as string;
}

export function x402XtTradePrice(): string {
  return (process.env.X402_XT_TRADE_PRICE?.trim() || "$0.15") as string;
}

export function buildXtExchangeOffer(): XtExchangeOffer {
  const base = getServerPublicOrigin().replace(/\/$/, "");
  return {
    schema_version: "1",
    product: "buildchain_xt_exchange_v1",
    name: "BUILDCHAIN XT Exchange",
    description:
      "XT.COM spot and USDT-M futures via platform proxy. Market data, balances, orders — pay per call via x402. Writes require confirm flags and XT_TRADING_ENABLED.",
    exchange: "xt.com",
    settlement: "x402",
    pricing: {
      market: { price_env: "X402_XT_MARKET_PRICE", default_usd: "0.03" },
      account: { price_env: "X402_XT_ACCOUNT_PRICE", default_usd: "0.05" },
      trade: { price_env: "X402_XT_TRADE_PRICE", default_usd: "0.15" },
    },
    paths: {
      manifest: `${base}/api/trading/xt/manifest`,
      health: `${base}/api/trading/xt/health`,
      spotTicker: `${base}/api/trading/xt/spot/ticker?symbol=bcc_usdt`,
      spotBalance: `${base}/api/trading/xt/spot/balance`,
      spotOrder: `${base}/api/trading/xt/spot/order`,
      futuresAccount: `${base}/api/trading/xt/futures/account`,
      futuresOpen: `${base}/api/trading/xt/futures/open`,
    },
    safety:
      "Server-side XT keys only. Default XT_TRADING_ENABLED=0 and XT_PAPER_MODE=1. Withdrawals require ack_irreversible. No custody by BUILDCHAIN.",
  };
}
