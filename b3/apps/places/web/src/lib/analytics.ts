/**
 * Client-side analytics hooks — **disabled by default**.
 *
 * Enable only after aligning with [`/legal/privacy`](/legal/privacy): set `NEXT_PUBLIC_ANALYTICS_ENABLED=1`
 * and wire your vendor (dataLayer, Plausible, etc.) in `trackPageView` / `track`.
 */

export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "1") return;
  window.dispatchEvent(new CustomEvent("bc:pageview", { detail: { path, ts: Date.now() } }));
}

/** Named product events — extend detail keys as needed; never send PII without consent. */
export function track(event: string, detail?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "1") return;
  window.dispatchEvent(new CustomEvent("bc:analytics", { detail: { event, ...detail, ts: Date.now() } }));
}
