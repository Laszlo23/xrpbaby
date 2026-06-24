import { isTradingInternalRequest } from "@/lib/trading-agent-offer";
import {
  buildXtExchangeOffer,
  x402XtAccountPrice,
  x402XtMarketPrice,
  x402XtTradePrice,
} from "@/lib/xt-exchange-offer";
import { paidOrInternalOrStripe } from "@/server/billing/paid-access";
import { proxyXtWorker, workerQueryFromRequest } from "@/server/xt-exchange";
import { handleX402Options, x402CorsHeadersFor } from "@/server/x402-settle";

function badRequest(message: string, request: Request): Response {
  return Response.json({ error: message }, { status: 400, headers: x402CorsHeadersFor(request) });
}

export { handleX402Options as handleXtOptions };

export async function handleXtManifestGet(request: Request): Promise<Response> {
  return Response.json(
    {
      ok: true,
      ...buildXtExchangeOffer(),
      generatedAt: new Date().toISOString(),
    },
    { headers: x402CorsHeadersFor(request) },
  );
}

export async function handleXtHealthGet(request: Request): Promise<Response> {
  const r = await proxyXtWorker("/health", { method: "GET", timeoutMs: 10_000 });
  if (!r.ok) {
    return Response.json(
      {
        ok: false,
        reachable: false,
        error: r.error,
        offer: buildXtExchangeOffer(),
      },
      { status: 200, headers: x402CorsHeadersFor(request) },
    );
  }
  const worker = r.data as Record<string, unknown>;
  return Response.json(
    {
      ok: true,
      reachable: true,
      worker,
      xt: worker.xt,
      offer: buildXtExchangeOffer(),
    },
    { headers: x402CorsHeadersFor(request) },
  );
}

async function paidMarketGet(
  request: Request,
  workerPath: string,
  sku: string,
  description: string,
): Promise<Response> {
  return paidOrInternalOrStripe(
    request,
    {
      sku,
      price: x402XtMarketPrice(),
      description,
      method: "GET",
      isInternal: isTradingInternalRequest,
    },
    async () => {
      const r = await proxyXtWorker(`${workerPath}${workerQueryFromRequest(request)}`, {
        method: "GET",
      });
      if (!r.ok) throw new Error(r.error);
      return {
        ok: true,
        sku,
        ...((r.data as object) ?? {}),
        rentedAt: new Date().toISOString(),
      };
    },
  );
}

async function paidAccountGet(
  request: Request,
  workerPath: string,
  sku: string,
  description: string,
): Promise<Response> {
  return paidOrInternalOrStripe(
    request,
    {
      sku,
      price: x402XtAccountPrice(),
      description,
      method: "GET",
      isInternal: isTradingInternalRequest,
    },
    async () => {
      const r = await proxyXtWorker(`${workerPath}${workerQueryFromRequest(request)}`, {
        method: "GET",
      });
      if (!r.ok) throw new Error(r.error);
      return {
        ok: true,
        sku,
        ...((r.data as object) ?? {}),
        rentedAt: new Date().toISOString(),
      };
    },
  );
}

async function paidTradePost(
  request: Request,
  workerPath: string,
  sku: string,
  description: string,
): Promise<Response> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("JSON body required", request);
  }

  const execute = async () => {
    const r = await proxyXtWorker(workerPath, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(r.error);
    return {
      ok: true,
      sku,
      ...((r.data as object) ?? {}),
      rentedAt: new Date().toISOString(),
    };
  };

  return paidOrInternalOrStripe(
    request,
    {
      sku,
      price: x402XtTradePrice(),
      description,
      method: "POST",
      isInternal: isTradingInternalRequest,
    },
    execute,
  );
}

async function paidTradeDelete(
  request: Request,
  workerPath: string,
  sku: string,
  description: string,
): Promise<Response> {
  const execute = async () => {
    const r = await proxyXtWorker(`${workerPath}${workerQueryFromRequest(request)}`, {
      method: "DELETE",
    });
    if (!r.ok) throw new Error(r.error);
    return {
      ok: true,
      sku,
      ...((r.data as object) ?? {}),
      rentedAt: new Date().toISOString(),
    };
  };

  return paidOrInternalOrStripe(
    request,
    {
      sku,
      price: x402XtTradePrice(),
      description,
      method: "DELETE",
      isInternal: isTradingInternalRequest,
    },
    execute,
  );
}

// Spot public
export const handleXtSpotTickerGet = (req: Request) =>
  paidMarketGet(req, "/spot/ticker", "xt_spot_ticker_v1", "XT spot ticker (x402)");
export const handleXtSpotTicker24hGet = (req: Request) =>
  paidMarketGet(req, "/spot/ticker-24h", "xt_spot_ticker_24h_v1", "XT spot 24h ticker (x402)");
export const handleXtSpotDepthGet = (req: Request) =>
  paidMarketGet(req, "/spot/depth", "xt_spot_depth_v1", "XT spot order book (x402)");
export const handleXtSpotKlinesGet = (req: Request) =>
  paidMarketGet(req, "/spot/klines", "xt_spot_klines_v1", "XT spot klines (x402)");
export const handleXtSpotSymbolGet = (req: Request) =>
  paidMarketGet(req, "/spot/symbol", "xt_spot_symbol_v1", "XT spot symbol info (x402)");

// Spot account
export const handleXtSpotBalanceGet = (req: Request) =>
  paidAccountGet(req, "/spot/balance", "xt_spot_balance_v1", "XT spot balance (x402)");
export const handleXtSpotOrdersGet = (req: Request) =>
  paidAccountGet(req, "/spot/orders", "xt_spot_orders_v1", "XT spot open orders (x402)");
export const handleXtSpotHistoryGet = (req: Request) =>
  paidAccountGet(req, "/spot/history", "xt_spot_history_v1", "XT spot order history (x402)");

// Spot writes
export const handleXtSpotOrderPost = (req: Request) =>
  paidTradePost(req, "/spot/order", "xt_spot_order_v1", "XT spot place order (x402)");
export const handleXtSpotTransferPost = (req: Request) =>
  paidTradePost(req, "/spot/transfer", "xt_spot_transfer_v1", "XT spot transfer (x402)");
export const handleXtSpotWithdrawPost = (req: Request) =>
  paidTradePost(req, "/spot/withdraw", "xt_spot_withdraw_v1", "XT spot withdraw (x402)");

export async function handleXtSpotOrderDelete(
  request: Request,
  orderId: string,
): Promise<Response> {
  const url = new URL(request.url);
  if (!url.searchParams.get("confirm")) {
    return badRequest("Query param confirm=true required", request);
  }
  return paidTradeDelete(
    request,
    `/spot/order/${encodeURIComponent(orderId)}`,
    "xt_spot_cancel_v1",
    "XT spot cancel order (x402)",
  );
}

export async function handleXtSpotOrdersDelete(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (!url.searchParams.get("confirm")) {
    return badRequest("Query param confirm=true required", request);
  }
  return paidTradeDelete(
    request,
    "/spot/orders",
    "xt_spot_cancel_all_v1",
    "XT spot cancel all orders (x402)",
  );
}

// Futures public
export const handleXtFuturesTickerGet = (req: Request) =>
  paidMarketGet(req, "/futures/ticker", "xt_futures_ticker_v1", "XT futures ticker (x402)");
export const handleXtFuturesDepthGet = (req: Request) =>
  paidMarketGet(req, "/futures/depth", "xt_futures_depth_v1", "XT futures depth (x402)");
export const handleXtFuturesFundingRateGet = (req: Request) =>
  paidMarketGet(
    req,
    "/futures/funding-rate",
    "xt_futures_funding_v1",
    "XT futures funding rate (x402)",
  );
export const handleXtFuturesKlinesGet = (req: Request) =>
  paidMarketGet(req, "/futures/klines", "xt_futures_klines_v1", "XT futures klines (x402)");

// Futures account
export const handleXtFuturesAccountGet = (req: Request) =>
  paidAccountGet(req, "/futures/account", "xt_futures_account_v1", "XT futures account (x402)");
export const handleXtFuturesPositionsGet = (req: Request) =>
  paidAccountGet(
    req,
    "/futures/positions",
    "xt_futures_positions_v1",
    "XT futures positions (x402)",
  );
export const handleXtFuturesOrdersGet = (req: Request) =>
  paidAccountGet(req, "/futures/orders", "xt_futures_orders_v1", "XT futures orders (x402)");
export const handleXtFuturesHistoryGet = (req: Request) =>
  paidAccountGet(req, "/futures/history", "xt_futures_history_v1", "XT futures history (x402)");

// Futures writes
export const handleXtFuturesOpenPost = (req: Request) =>
  paidTradePost(req, "/futures/open", "xt_futures_open_v1", "XT futures open/close (x402)");

export async function handleXtFuturesOrderDelete(
  request: Request,
  orderId: string,
): Promise<Response> {
  const url = new URL(request.url);
  if (!url.searchParams.get("confirm")) {
    return badRequest("Query param confirm=true required", request);
  }
  return paidTradeDelete(
    request,
    `/futures/order/${encodeURIComponent(orderId)}`,
    "xt_futures_cancel_v1",
    "XT futures cancel order (x402)",
  );
}
