import {
  BC_TOUCHPOINTS,
  formatTouchpointsForPrompt,
  type BcTouchpoint,
} from "@/lib/bc-touchpoints";
import { getEliasSupabaseAdmin } from "@/server/elias/supabase";

type TouchpointCache = { touchpoints: BcTouchpoint[]; fetchedAtMs: number };

let cache: TouchpointCache | null = null;
const TOUCHPOINT_CACHE_TTL_MS = 60_000;

async function loadTouchpoints(): Promise<BcTouchpoint[]> {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return BC_TOUCHPOINTS;

  const now = Date.now();
  if (cache && now - cache.fetchedAtMs < TOUCHPOINT_CACHE_TTL_MS) return cache.touchpoints;

  const { data, error } = await sb
    .from("elias_touchpoints")
    .select("id, label, href, absolute_url, hint")
    .order("id", { ascending: true })
    .limit(250);

  if (error || !data || data.length === 0) return BC_TOUCHPOINTS;

  const touchpoints: BcTouchpoint[] = data.map((r) => ({
    id: String((r as { id: unknown }).id),
    label: String((r as { label: unknown }).label),
    href: (r as { href?: unknown }).href ? String((r as { href: unknown }).href) : undefined,
    absoluteUrl: (r as { absolute_url?: unknown }).absolute_url
      ? String((r as { absolute_url: unknown }).absolute_url)
      : undefined,
    hint: String((r as { hint: unknown }).hint),
  }));

  cache = { touchpoints, fetchedAtMs: now };
  return touchpoints;
}

export async function getTouchpointsPromptBlock(): Promise<string> {
  const tps = await loadTouchpoints();
  // Reuse formatter to keep prompt shape stable.
  return tps
    .slice(0, 22)
    .map((t) => {
      const path = t.href ?? t.absoluteUrl ?? "";
      return `- ${t.id}: ${t.label} — ${path} — ${t.hint}`;
    })
    .join("\n")
    .trim();
}

/**
 * For call sites that want the exact existing formatting function behavior,
 * but prefer DB-backed touchpoints when available.
 */
export async function formatTouchpointsForPromptDbPreferred(max = 22): Promise<string> {
  const tps = await loadTouchpoints();
  // `formatTouchpointsForPrompt` always uses the in-memory constant; replicate its logic here.
  return tps
    .slice(0, max)
    .map((t) => {
      const path = t.href ?? t.absoluteUrl ?? "";
      return `- ${t.id}: ${t.label} — ${path} — ${t.hint}`;
    })
    .join("\n");
}
