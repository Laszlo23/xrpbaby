/**
 * Server-side PostHog HogQL for admin funnel (last 24h).
 * Requires POSTHOG_PERSONAL_API_KEY + POSTHOG_PROJECT_ID (+ optional POSTHOG_HOST).
 */

const EVENTS = [
  "landing_view",
  "wallet_connected",
  "mint_clicked",
  "mint_confirmed",
  "share_clicked",
] as const;

export type FunnelEventName = (typeof EVENTS)[number];

export async function fetchPosthogFunnelCounts24h(): Promise<Record<
  FunnelEventName,
  number
> | null> {
  const host = (process.env.POSTHOG_HOST ?? "https://eu.posthog.com").replace(/\/$/, "");
  const key = process.env.POSTHOG_PERSONAL_API_KEY?.trim();
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim();
  if (!key || !projectId) return null;

  const inList = EVENTS.map((e) => `'${e}'`).join(", ");
  const query = {
    kind: "HogQLQuery",
    query: `SELECT event, count() AS c FROM events WHERE timestamp > now() - INTERVAL 1 DAY AND event IN (${inList}) GROUP BY event`,
  };

  const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) return null;

  const json = (await res.json()) as {
    results?: unknown[];
    columns?: string[];
  };

  const base: Record<FunnelEventName, number> = {
    landing_view: 0,
    wallet_connected: 0,
    mint_clicked: 0,
    mint_confirmed: 0,
    share_clicked: 0,
  };

  const rows = json.results;
  if (!Array.isArray(rows)) return base;

  // HogQL returns [event, count] tuples or column-oriented — handle tuple rows
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const ev = String(row[0]);
    const n = Number(row[1]);
    if (EVENTS.includes(ev as FunnelEventName) && Number.isFinite(n)) {
      base[ev as FunnelEventName] = n;
    }
  }

  return base;
}
