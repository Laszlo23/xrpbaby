/**
 * Resolves the canonical `resourceUrl` for x402 `settlePayment` (must match what the client pays for).
 * When behind a reverse proxy, set `X402_PUBLIC_ORIGIN` (e.g. https://app.example.com).
 */
export function resolveX402ResourceUrl(request: Request): string {
  const url = new URL(request.url);
  const origin = process.env.X402_PUBLIC_ORIGIN?.trim();
  if (origin) {
    const base = origin.replace(/\/$/, "");
    return `${base}${url.pathname}${url.search}`;
  }
  return url.href;
}
