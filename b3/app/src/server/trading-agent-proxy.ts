/**
 * Proxies to the Python sugar-sdk service (`packages/trading-agent`).
 */

const DEFAULT_TIMEOUT_MS = 120_000;

export function tradingAgentBaseUrl(): string {
  return (process.env.TRADING_AGENT_URL?.trim() || "http://127.0.0.1:8765").replace(/\/$/, "");
}

export async function proxyTradingAgent(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<
  { ok: true; data: unknown } | { ok: false; status: number; error: string; raw?: string }
> {
  const base = tradingAgentBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text.slice(0, 800) };
    }
    if (!res.ok) {
      const errMsg =
        typeof data === "object" && data !== null && "detail" in data
          ? String((data as { detail: unknown }).detail)
          : `Trading agent HTTP ${res.status}`;
      return { ok: false, status: res.status, error: errMsg, raw: text.slice(0, 500) };
    }
    return { ok: true, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      status: 503,
      error: `Trading agent unreachable at ${url}: ${msg}`,
    };
  }
}

export async function tradingAgentHealth(): Promise<{
  reachable: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  const r = await proxyTradingAgent("/health", { method: "GET", timeoutMs: 8_000 });
  if (!r.ok) return { reachable: false, error: r.error };
  return { reachable: true, data: r.data as Record<string, unknown> };
}
