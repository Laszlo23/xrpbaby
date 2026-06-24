import { x402ResearchPrice } from "@/lib/agent-os-catalog";
import { x402LimxPrice } from "@/lib/limx-agent-config";
import {
  x402TradingPoolsPrice,
  x402TradingQuotePrice,
  x402TradingSwapPreviewPrice,
} from "@/lib/trading-agent-offer";
import { x402XtAccountPrice, x402XtMarketPrice, x402XtTradePrice } from "@/lib/xt-exchange-offer";

export type StripeApiSku = {
  sku: string;
  label: string;
  usdCents: number;
  apiPath: string;
  method: "GET" | "POST" | "DELETE";
  priceEnv?: string;
};

type StripeApiSkuDraft = Omit<StripeApiSku, "usdCents">;

export function usdPriceToCents(price: string): number {
  const cleaned = price.replace(/^\$/, "").trim();
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.round(n * 100);
}

const XT_MARKET_SKUS: StripeApiSkuDraft[] = [
  {
    sku: "xt_spot_ticker_v1",
    label: "XT spot ticker",
    apiPath: "/api/trading/xt/spot/ticker",
    method: "GET",
    priceEnv: "X402_XT_MARKET_PRICE",
  },
  {
    sku: "xt_spot_ticker_24h_v1",
    label: "XT spot 24h ticker",
    apiPath: "/api/trading/xt/spot/ticker-24h",
    method: "GET",
    priceEnv: "X402_XT_MARKET_PRICE",
  },
  {
    sku: "xt_spot_depth_v1",
    label: "XT spot order book",
    apiPath: "/api/trading/xt/spot/depth",
    method: "GET",
    priceEnv: "X402_XT_MARKET_PRICE",
  },
  {
    sku: "xt_spot_klines_v1",
    label: "XT spot klines",
    apiPath: "/api/trading/xt/spot/klines",
    method: "GET",
    priceEnv: "X402_XT_MARKET_PRICE",
  },
  {
    sku: "xt_spot_symbol_v1",
    label: "XT spot symbol info",
    apiPath: "/api/trading/xt/spot/symbol",
    method: "GET",
    priceEnv: "X402_XT_MARKET_PRICE",
  },
  {
    sku: "xt_futures_ticker_v1",
    label: "XT futures ticker",
    apiPath: "/api/trading/xt/futures/ticker",
    method: "GET",
    priceEnv: "X402_XT_MARKET_PRICE",
  },
  {
    sku: "xt_futures_depth_v1",
    label: "XT futures depth",
    apiPath: "/api/trading/xt/futures/depth",
    method: "GET",
    priceEnv: "X402_XT_MARKET_PRICE",
  },
  {
    sku: "xt_futures_funding_v1",
    label: "XT futures funding rate",
    apiPath: "/api/trading/xt/futures/funding-rate",
    method: "GET",
    priceEnv: "X402_XT_MARKET_PRICE",
  },
  {
    sku: "xt_futures_klines_v1",
    label: "XT futures klines",
    apiPath: "/api/trading/xt/futures/klines",
    method: "GET",
    priceEnv: "X402_XT_MARKET_PRICE",
  },
];

const XT_ACCOUNT_SKUS: StripeApiSkuDraft[] = [
  {
    sku: "xt_spot_balance_v1",
    label: "XT spot balance",
    apiPath: "/api/trading/xt/spot/balance",
    method: "GET",
    priceEnv: "X402_XT_ACCOUNT_PRICE",
  },
  {
    sku: "xt_spot_orders_v1",
    label: "XT spot open orders",
    apiPath: "/api/trading/xt/spot/orders",
    method: "GET",
    priceEnv: "X402_XT_ACCOUNT_PRICE",
  },
  {
    sku: "xt_spot_history_v1",
    label: "XT spot order history",
    apiPath: "/api/trading/xt/spot/history",
    method: "GET",
    priceEnv: "X402_XT_ACCOUNT_PRICE",
  },
  {
    sku: "xt_futures_account_v1",
    label: "XT futures account",
    apiPath: "/api/trading/xt/futures/account",
    method: "GET",
    priceEnv: "X402_XT_ACCOUNT_PRICE",
  },
  {
    sku: "xt_futures_positions_v1",
    label: "XT futures positions",
    apiPath: "/api/trading/xt/futures/positions",
    method: "GET",
    priceEnv: "X402_XT_ACCOUNT_PRICE",
  },
  {
    sku: "xt_futures_orders_v1",
    label: "XT futures orders",
    apiPath: "/api/trading/xt/futures/orders",
    method: "GET",
    priceEnv: "X402_XT_ACCOUNT_PRICE",
  },
  {
    sku: "xt_futures_history_v1",
    label: "XT futures history",
    apiPath: "/api/trading/xt/futures/history",
    method: "GET",
    priceEnv: "X402_XT_ACCOUNT_PRICE",
  },
];

const XT_TRADE_SKUS: StripeApiSkuDraft[] = [
  {
    sku: "xt_spot_order_v1",
    label: "XT spot place order",
    apiPath: "/api/trading/xt/spot/order",
    method: "POST",
    priceEnv: "X402_XT_TRADE_PRICE",
  },
  {
    sku: "xt_spot_transfer_v1",
    label: "XT spot transfer",
    apiPath: "/api/trading/xt/spot/transfer",
    method: "POST",
    priceEnv: "X402_XT_TRADE_PRICE",
  },
  {
    sku: "xt_spot_withdraw_v1",
    label: "XT spot withdraw",
    apiPath: "/api/trading/xt/spot/withdraw",
    method: "POST",
    priceEnv: "X402_XT_TRADE_PRICE",
  },
  {
    sku: "xt_spot_cancel_v1",
    label: "XT spot cancel order",
    apiPath: "/api/trading/xt/spot/order/:orderId",
    method: "DELETE",
    priceEnv: "X402_XT_TRADE_PRICE",
  },
  {
    sku: "xt_spot_cancel_all_v1",
    label: "XT spot cancel all orders",
    apiPath: "/api/trading/xt/spot/orders",
    method: "DELETE",
    priceEnv: "X402_XT_TRADE_PRICE",
  },
  {
    sku: "xt_futures_open_v1",
    label: "XT futures open/close",
    apiPath: "/api/trading/xt/futures/open",
    method: "POST",
    priceEnv: "X402_XT_TRADE_PRICE",
  },
  {
    sku: "xt_futures_cancel_v1",
    label: "XT futures cancel order",
    apiPath: "/api/trading/xt/futures/order/:orderId",
    method: "DELETE",
    priceEnv: "X402_XT_TRADE_PRICE",
  },
];

function withCents(skus: StripeApiSkuDraft[], priceFn: () => string): StripeApiSku[] {
  const cents = usdPriceToCents(priceFn());
  return skus.map((s) => ({ ...s, usdCents: cents }));
}

/** Central registry of pay-per-call API SKUs available via Stripe Checkout. */
export function listStripeApiSkus(): StripeApiSku[] {
  return [
    {
      sku: "buildchain_trading_quote_v1",
      label: "Aerodrome swap quote",
      usdCents: usdPriceToCents(x402TradingQuotePrice()),
      apiPath: "/api/trading/quote",
      method: "GET",
      priceEnv: "X402_TRADING_QUOTE_PRICE",
    },
    {
      sku: "buildchain_trading_quote_bcc_v1",
      label: "ETH→BCC quote",
      usdCents: usdPriceToCents(x402TradingQuotePrice()),
      apiPath: "/api/trading/quote/bcc",
      method: "GET",
      priceEnv: "X402_TRADING_QUOTE_PRICE",
    },
    {
      sku: "buildchain_trading_arbitrage_scan_v1",
      label: "Multichain BCC arbitrage scan",
      usdCents: usdPriceToCents(x402TradingQuotePrice()),
      apiPath: "/api/trading/arbitrage/scan",
      method: "GET",
      priceEnv: "X402_TRADING_QUOTE_PRICE",
    },
    {
      sku: "buildchain_trading_pools_v1",
      label: "Aerodrome pools",
      usdCents: usdPriceToCents(x402TradingPoolsPrice()),
      apiPath: "/api/trading/pools",
      method: "GET",
      priceEnv: "X402_TRADING_POOLS_PRICE",
    },
    {
      sku: "buildchain_trading_swap_preview_v1",
      label: "Unsigned swap preview",
      usdCents: usdPriceToCents(x402TradingSwapPreviewPrice()),
      apiPath: "/api/trading/swap/preview",
      method: "GET",
      priceEnv: "X402_TRADING_SWAP_PRICE",
    },
    {
      sku: "buildchain_research_brief_v1",
      label: "Research agent brief",
      usdCents: usdPriceToCents(x402ResearchPrice()),
      apiPath: "/api/agents/research",
      method: "GET",
      priceEnv: "X402_RESEARCH_PRICE",
    },
    {
      sku: "limx_revenue_brief_v1",
      label: "Limx revenue brief",
      usdCents: usdPriceToCents(x402LimxPrice()),
      apiPath: "/api/agents/limx",
      method: "GET",
      priceEnv: "X402_LIMX_PRICE",
    },
    {
      sku: "buildchain_premium_drop_teasers_v1",
      label: "Premium drop teaser feed",
      usdCents: usdPriceToCents(process.env.X402_PRICE?.trim() || "$0.01"),
      apiPath: "/api/x402/premium",
      method: "GET",
      priceEnv: "X402_PRICE",
    },
    ...withCents(XT_MARKET_SKUS, x402XtMarketPrice),
    ...withCents(XT_ACCOUNT_SKUS, x402XtAccountPrice),
    ...withCents(XT_TRADE_SKUS, x402XtTradePrice),
  ];
}

export function getStripeApiSku(sku: string): StripeApiSku | undefined {
  return listStripeApiSkus().find((entry) => entry.sku === sku);
}

export function formatUsdFromCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
