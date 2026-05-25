import { getStrapiUrl } from "@/lib/community-profile/strapi-url";

export type StrapiRoadmapItem = {
  id: number;
  title: string;
  slug: string;
  phase: string | null;
  quarter: string | null;
  body: string;
  sortOrder: number;
};

export type StrapiSiteNarrative = {
  heroTagline: string;
  heroSubcopy: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

function parseRoadmapPayload(json: unknown): StrapiRoadmapItem[] {
  const j = json as { data?: unknown[] };
  if (!Array.isArray(j.data)) return [];
  return j.data.map((entry: unknown, i: number) => {
    const e = entry as Record<string, unknown>;
    const attrs = (e.attributes ?? e) as Record<string, unknown>;
    const id = typeof e.id === "number" ? e.id : i;
    return {
      id,
      title: String(attrs.title ?? "Untitled"),
      slug: String(attrs.slug ?? `roadmap-${id}`),
      phase: attrs.phase != null ? String(attrs.phase) : null,
      quarter: attrs.quarter != null ? String(attrs.quarter) : null,
      body: String(attrs.body ?? ""),
      sortOrder: typeof attrs.sortOrder === "number" ? attrs.sortOrder : i,
    };
  });
}

/** Published roadmap items from Strapi (public GET). */
export async function fetchRoadmapItems(): Promise<StrapiRoadmapItem[]> {
  const base = getStrapiUrl().replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/roadmap-items?sort=sortOrder:asc`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return parseRoadmapPayload(json);
  } catch {
    return [];
  }
}

export async function fetchSiteNarrative(): Promise<StrapiSiteNarrative | null> {
  const base = getStrapiUrl().replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/site-narrative`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { attributes?: StrapiSiteNarrative } & Partial<StrapiSiteNarrative>;
    };
    const d = json.data;
    if (!d) return null;
    const attrs = (d.attributes ?? d) as Partial<StrapiSiteNarrative>;
    if (!attrs.heroTagline || !attrs.heroSubcopy) return null;
    return {
      heroTagline: attrs.heroTagline,
      heroSubcopy: attrs.heroSubcopy,
      ctaLabel: attrs.ctaLabel ?? null,
      ctaUrl: attrs.ctaUrl ?? null,
    };
  } catch {
    return null;
  }
}
