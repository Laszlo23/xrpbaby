const STORAGE_KEY = "buildchain_marketing_attribution";

export type MarketingAttribution = {
  agent_ref?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

function clampMarketingValue(raw: string | null, maxLen: number): string | undefined {
  if (!raw) return undefined;
  const t = raw.trim();
  if (!t) return undefined;
  if (t.length > maxLen) return t.slice(0, maxLen);
  return t;
}

/** Matches short handles / FIDs-as-string / slug-style refs */
export function sanitizeAgentRef(raw: string | null): string | undefined {
  const v = clampMarketingValue(raw, 64);
  if (!v) return undefined;
  if (!/^[a-zA-Z0-9_.-]+$/.test(v)) return undefined;
  return v;
}

function sanitizeUtm(raw: string | null): string | undefined {
  const v = clampMarketingValue(raw, 128);
  if (!v) return undefined;
  if (!/^[a-zA-Z0-9_\-.\s%+]+$/.test(v)) return undefined;
  return v;
}

export function parseMarketingAttributionFromSearch(search: string): MarketingAttribution {
  const q = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(q);
  const agent_ref = sanitizeAgentRef(params.get("agent_ref"));
  const utm_source = sanitizeUtm(params.get("utm_source"));
  const utm_medium = sanitizeUtm(params.get("utm_medium"));
  const utm_campaign = sanitizeUtm(params.get("utm_campaign"));
  const out: MarketingAttribution = {};
  if (agent_ref) out.agent_ref = agent_ref;
  if (utm_source) out.utm_source = utm_source;
  if (utm_medium) out.utm_medium = utm_medium;
  if (utm_campaign) out.utm_campaign = utm_campaign;
  return out;
}

export function getPersistedMarketingAttribution(): MarketingAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as MarketingAttribution;
    if (!parsed || typeof parsed !== "object") return {};
    return {
      agent_ref: typeof parsed.agent_ref === "string" ? parsed.agent_ref : undefined,
      utm_source: typeof parsed.utm_source === "string" ? parsed.utm_source : undefined,
      utm_medium: typeof parsed.utm_medium === "string" ? parsed.utm_medium : undefined,
      utm_campaign: typeof parsed.utm_campaign === "string" ? parsed.utm_campaign : undefined,
    };
  } catch {
    return {};
  }
}

function persistAttribution(patch: MarketingAttribution): MarketingAttribution {
  if (typeof window === "undefined") return {};
  const prev = getPersistedMarketingAttribution();
  const next: MarketingAttribution = { ...prev };
  for (const k of Object.keys(patch) as (keyof MarketingAttribution)[]) {
    const v = patch[k];
    if (v !== undefined && v !== "") {
      next[k] = v;
    }
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

/**
 * Reads attribution from the current URL, merges into session (last non-empty wins per key).
 * Call on each navigation alongside analytics.
 */
export function mergeMarketingAttributionFromUrl(search: string): MarketingAttribution {
  const fromUrl = parseMarketingAttributionFromSearch(search);
  if (!fromUrl.agent_ref && !fromUrl.utm_source && !fromUrl.utm_medium && !fromUrl.utm_campaign) {
    return getPersistedMarketingAttribution();
  }
  return persistAttribution(fromUrl);
}
