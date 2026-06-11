import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";

const DEFAULT_BCC = "0xb890a5289f789f1346032ccc1847939e855fab07";

function platformTradingBase(): string {
  return (
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    process.env.VITE_APP_ORIGIN?.trim() ||
    process.env.TRADING_AGENT_PUBLIC_ORIGIN?.trim() ||
    "http://127.0.0.1:5173"
  ).replace(/\/$/, "");
}

function quoteEthAmount(): string {
  return process.env.TRADING_AGENT_QUOTE_ETH_AMOUNT?.trim() || "0.01";
}

function toToken(): string {
  return (
    process.env.TRADING_AGENT_TO_TOKEN?.trim() ||
    process.env.BCC_TOKEN_ADDRESS?.trim() ||
    process.env.VITE_BCC_TOKEN_ADDRESS?.trim() ||
    DEFAULT_BCC
  );
}

/**
 * Fleet tick: always calls BUILDCHAIN platform `/api/trading/*` so x402 + attribution stay on-app.
 * Python `:8765` is ops-only — set TRADING_AGENT_VIA_PLATFORM=0 to bypass (local worker debug).
 */
export async function runTradingSugarTick(agent: OpsAgentRecord): Promise<LedgerInsert> {
  const fromToken = process.env.TRADING_AGENT_FROM_TOKEN?.trim() || "eth";
  const amount = quoteEthAmount();
  const to = toToken();
  const usePlatform = process.env.TRADING_AGENT_VIA_PLATFORM?.trim() !== "0";

  if (usePlatform) {
    const base = platformTradingBase();
    const qs = new URLSearchParams({
      from_token: fromToken,
      to_token: to,
      amount,
    });
    const url = `${base}/api/trading/quote?${qs.toString()}`;
    const secret = process.env.TRADING_AGENT_INTERNAL_SECRET?.trim();
    const headers: Record<string, string> = {};
    if (secret) headers["x-trading-internal-secret"] = secret;

    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(60_000) });
      const text = await res.text();
      let body: unknown = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = { raw: text.slice(0, 500) };
      }
      return {
        agentId: agent.id,
        action: "trading.sugar_quote",
        params: { url, fromToken, to, amount, status: res.status, body, via: "platform" },
        dryRun: true,
        status: res.ok ? "ok" : "error",
        txHash: null,
        errorMsg: res.ok ? null : `Platform trading API HTTP ${res.status}`,
        costUsd: null,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        agentId: agent.id,
        action: "trading.sugar_quote",
        params: { url, error: msg, via: "platform" },
        dryRun: true,
        status: "error",
        txHash: null,
        errorMsg: msg,
        costUsd: null,
      };
    }
  }

  const base = (process.env.TRADING_AGENT_URL?.trim() || "http://127.0.0.1:8765").replace(/\/$/, "");
  const url = `${base}/quote`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        from_token: fromToken,
        to_token: to,
        amount,
        use_decimals: true,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text.slice(0, 500) };
    }
    return {
      agentId: agent.id,
      action: "trading.sugar_quote",
      params: { url, fromToken, to, amount, status: res.status, body, via: "python" },
      dryRun: true,
      status: res.ok ? "ok" : "error",
      txHash: null,
      errorMsg: res.ok ? null : `Trading worker HTTP ${res.status}`,
      costUsd: null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      agentId: agent.id,
      action: "trading.sugar_quote",
      params: { url, fromToken, to, amount, error: msg, via: "python" },
      dryRun: true,
      status: "error",
      txHash: null,
      errorMsg: `Trading worker unreachable: ${msg}`,
      costUsd: null,
    };
  }
}
