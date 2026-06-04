import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";

function platformTradingBase(): string {
  return (
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    process.env.VITE_APP_ORIGIN?.trim() ||
    process.env.TRADING_AGENT_PUBLIC_ORIGIN?.trim() ||
    "http://127.0.0.1:5173"
  ).replace(/\/$/, "");
}

/**
 * Fleet tick: multichain BCC arbitrage scan (Base Aerodrome/Uniswap vs Solana Jupiter).
 */
export async function runTradingArbitrageTick(agent: OpsAgentRecord): Promise<LedgerInsert> {
  const solAmount = process.env.TRADING_ARB_SOL_AMOUNT?.trim() || "1";
  const ethAmount = process.env.TRADING_ARB_ETH_AMOUNT?.trim() || "0.01";
  const minBps = process.env.TRADING_ARB_MIN_SPREAD_BPS?.trim() || "50";
  const base = platformTradingBase();
  const qs = new URLSearchParams({
    sol_amount: solAmount,
    eth_amount: ethAmount,
    min_spread_bps: minBps,
  });
  const url = `${base}/api/trading/arbitrage-scan?${qs.toString()}`;
  const secret = process.env.TRADING_AGENT_INTERNAL_SECRET?.trim();
  const headers: Record<string, string> = {};
  if (secret) headers["x-trading-internal-secret"] = secret;

  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(180_000) });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text.slice(0, 800) };
    }
    const actionable =
      typeof body === "object" &&
      body !== null &&
      "actionableCount" in body &&
      Number((body as { actionableCount?: number }).actionableCount) > 0;

    return {
      agentId: agent.id,
      action: "trading.arbitrage_scan",
      params: { url, solAmount, ethAmount, minBps, status: res.status, body, via: "platform" },
      dryRun: true,
      status: res.ok ? (actionable ? "ok" : "ok") : "error",
      txHash: null,
      errorMsg: res.ok ? null : `Arbitrage scan HTTP ${res.status}`,
      costUsd: null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      agentId: agent.id,
      action: "trading.arbitrage_scan",
      params: { url, error: msg },
      dryRun: true,
      status: "error",
      txHash: null,
      errorMsg: msg,
      costUsd: null,
    };
  }
}
