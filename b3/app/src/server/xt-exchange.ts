/**
 * Proxy helpers for XT.COM endpoints on the Python trading sidecar.
 */
import { proxyTradingAgent } from "@/server/trading-agent-proxy";

const XT_PREFIX = "/cex/xt";

export async function proxyXtWorker(path: string, init?: RequestInit & { timeoutMs?: number }) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const workerPath = normalized.startsWith(XT_PREFIX) ? normalized : `${XT_PREFIX}${normalized}`;
  return proxyTradingAgent(workerPath, init);
}

export function workerQueryFromRequest(request: Request, omit: string[] = []): string {
  const url = new URL(request.url);
  const qs = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (!omit.includes(key)) qs.set(key, value);
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}
