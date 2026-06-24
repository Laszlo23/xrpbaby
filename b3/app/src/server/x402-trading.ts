import {
  buildTradingAgentOffer,
  isTradingInternalRequest,
  x402TradingPoolsPrice,
  x402TradingQuotePrice,
  x402TradingSwapPreviewPrice,
} from "@/lib/trading-agent-offer";
import { paidOrInternalOrStripe } from "@/server/billing/paid-access";
import { proxyTradingAgent } from "@/server/trading-agent-proxy";
import { handleX402Options, x402CorsHeadersFor } from "@/server/x402-settle";

function badRequest(message: string, request: Request): Response {
  return Response.json({ error: message }, { status: 400, headers: x402CorsHeadersFor(request) });
}

function upstreamError(message: string, request: Request, status = 503): Response {
  return Response.json({ error: message }, { status, headers: x402CorsHeadersFor(request) });
}

export { handleX402Options as handleTradingOptions };

export async function handleTradingManifestGet(request: Request): Promise<Response> {
  return Response.json(
    {
      ok: true,
      ...buildTradingAgentOffer(),
      generatedAt: new Date().toISOString(),
    },
    { headers: x402CorsHeadersFor(request) },
  );
}

export async function handleTradingHealthGet(request: Request): Promise<Response> {
  const r = await proxyTradingAgent("/health", { method: "GET", timeoutMs: 10_000 });
  if (!r.ok) {
    return Response.json(
      {
        ok: false,
        reachable: false,
        error: r.error,
        offer: buildTradingAgentOffer(),
      },
      { status: 200, headers: x402CorsHeadersFor(request) },
    );
  }
  return Response.json(
    {
      ok: true,
      reachable: true,
      worker: r.data,
      offer: buildTradingAgentOffer(),
    },
    { headers: x402CorsHeadersFor(request) },
  );
}

async function paidOrInternal(
  request: Request,
  opts: { sku: string; price: string; description: string },
  buildPaidBody: () => Promise<object>,
): Promise<Response> {
  return paidOrInternalOrStripe(
    request,
    {
      sku: opts.sku,
      price: opts.price,
      description: opts.description,
      isInternal: isTradingInternalRequest,
    },
    buildPaidBody,
  );
}

export async function handleTradingQuoteGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const fromToken = url.searchParams.get("from_token")?.trim();
  const toToken = url.searchParams.get("to_token")?.trim();
  const amount = url.searchParams.get("amount")?.trim();
  if (!fromToken || !toToken || !amount) {
    return badRequest("Query params required: from_token, to_token, amount", request);
  }
  const useDecimals = url.searchParams.get("use_decimals") !== "0";
  const wallet = url.searchParams.get("wallet")?.trim() || undefined;

  return paidOrInternal(
    request,
    {
      sku: "buildchain_trading_quote_v1",
      price: x402TradingQuotePrice(),
      description: "Aerodrome swap quote on Base (BUILDCHAIN trading agent, x402)",
    },
    async () => {
      const r = await proxyTradingAgent("/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          from_token: fromToken,
          to_token: toToken,
          amount,
          use_decimals: useDecimals,
          wallet,
        }),
      });
      if (!r.ok) throw new Error(r.error);
      return {
        ok: true,
        sku: "buildchain_trading_quote_v1",
        ...((r.data as object) ?? {}),
        rentedAt: new Date().toISOString(),
      };
    },
  );
}

export async function handleTradingPoolsGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || "10") || 10));
  const qs = new URLSearchParams({ limit: String(limit) });
  if (token) qs.set("token", token);

  return paidOrInternal(
    request,
    {
      sku: "buildchain_trading_pools_v1",
      price: x402TradingPoolsPrice(),
      description: "Aerodrome pool list for token on Base (BUILDCHAIN trading agent, x402)",
    },
    async () => {
      const r = await proxyTradingAgent(`/pools?${qs.toString()}`, { method: "GET" });
      if (!r.ok) throw new Error(r.error);
      return {
        ok: true,
        sku: "buildchain_trading_pools_v1",
        ...((r.data as object) ?? {}),
        rentedAt: new Date().toISOString(),
      };
    },
  );
}

export async function handleTradingQuoteBccGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const ethAmount = url.searchParams.get("eth_amount")?.trim() || "0.01";
  const qs = new URLSearchParams({ eth_amount: ethAmount });
  if (url.searchParams.get("use_decimals") === "0") qs.set("use_decimals", "false");

  return paidOrInternal(
    request,
    {
      sku: "buildchain_trading_quote_bcc_v1",
      price: x402TradingQuotePrice(),
      description:
        "ETH→BCC path with Aerodrome or Uniswap fallback (BUILDCHAIN trading agent, x402)",
    },
    async () => {
      const r = await proxyTradingAgent(`/quote/bcc?${qs.toString()}`, {
        method: "GET",
        timeoutMs: 180_000,
      });
      if (!r.ok) throw new Error(r.error);
      return {
        ok: true,
        sku: "buildchain_trading_quote_bcc_v1",
        ...((r.data as object) ?? {}),
        rentedAt: new Date().toISOString(),
      };
    },
  );
}

export async function handleTradingArbitrageScanGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const qs = new URLSearchParams();
  const sol = url.searchParams.get("sol_amount")?.trim() || url.searchParams.get("sol")?.trim();
  const eth = url.searchParams.get("eth_amount")?.trim();
  const minBps = url.searchParams.get("min_spread_bps")?.trim();
  if (sol) qs.set("sol_amount", sol);
  if (eth) qs.set("eth_amount", eth);
  if (minBps) qs.set("min_spread_bps", minBps);

  return paidOrInternal(
    request,
    {
      sku: "buildchain_trading_arbitrage_scan_v1",
      price: x402TradingQuotePrice(),
      description:
        "Multichain BCC arbitrage scan: Base Aerodrome/Uniswap vs Solana Jupiter (read-only, x402)",
    },
    async () => {
      const r = await proxyTradingAgent(`/arbitrage/scan?${qs.toString()}`, {
        method: "GET",
        timeoutMs: 180_000,
      });
      if (!r.ok) throw new Error(r.error);
      return {
        ok: true,
        sku: "buildchain_trading_arbitrage_scan_v1",
        ...((r.data as object) ?? {}),
        rentedAt: new Date().toISOString(),
      };
    },
  );
}

export async function handleTradingSwapPreviewGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const fromToken = url.searchParams.get("from_token")?.trim();
  const toToken = url.searchParams.get("to_token")?.trim();
  const amount = url.searchParams.get("amount")?.trim();
  const wallet = url.searchParams.get("wallet")?.trim();
  if (!fromToken || !toToken || !amount || !wallet) {
    return badRequest("Query params required: from_token, to_token, amount, wallet", request);
  }
  const useDecimals = url.searchParams.get("use_decimals") !== "0";

  return paidOrInternal(
    request,
    {
      sku: "buildchain_trading_swap_preview_v1",
      price: x402TradingSwapPreviewPrice(),
      description: "Unsigned Aerodrome swap txs on Base (BUILDCHAIN trading agent, x402)",
    },
    async () => {
      const r = await proxyTradingAgent("/swap/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          from_token: fromToken,
          to_token: toToken,
          amount,
          wallet,
          use_decimals: useDecimals,
        }),
      });
      if (!r.ok) throw new Error(r.error);
      return {
        ok: true,
        sku: "buildchain_trading_swap_preview_v1",
        ...((r.data as object) ?? {}),
        rentedAt: new Date().toISOString(),
      };
    },
  );
}
