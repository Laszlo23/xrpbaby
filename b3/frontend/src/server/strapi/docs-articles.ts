/**
 * Server-only Strapi reads for /docs — uses API token (not public article permissions).
 */
export type DocsArticleSummary = {
  slug: string;
  title: string;
  description: string | null;
  documentId?: string;
};

function strapiBase(): string | null {
  const b = process.env.STRAPI_URL?.trim() || process.env.VITE_STRAPI_URL?.trim();
  return b ? b.replace(/\/$/, "") : null;
}

function readToken(): string | null {
  return (
    process.env.STRAPI_API_TOKEN?.trim() ||
    process.env.STRAPI_API_READ_TOKEN?.trim() ||
    process.env.AGENT_STRAPI_API_TOKEN?.trim() ||
    null
  );
}

export async function fetchDocsSummaries(): Promise<DocsArticleSummary[] | null> {
  const base = strapiBase();
  const token = readToken();
  if (!base || !token) return null;

  const u = new URL(`${base}/api/articles`);
  u.searchParams.set("filters[category][slug][$eq]", "docs");
  u.searchParams.set("publicationState", "live");
  u.searchParams.set("sort", "title:asc");

  const res = await fetch(u.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: unknown[] };
  const rows = Array.isArray(json.data) ? json.data : [];
  const out: DocsArticleSummary[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const slug = typeof r.slug === "string" ? r.slug : null;
    const title = typeof r.title === "string" ? r.title : null;
    if (!slug || !title) continue;
    out.push({
      slug,
      title,
      description: typeof r.description === "string" ? r.description : null,
      documentId: typeof r.documentId === "string" ? r.documentId : undefined,
    });
  }
  return out;
}

export async function fetchDocsArticleBySlug(
  slug: string,
): Promise<Record<string, unknown> | null> {
  const base = strapiBase();
  const token = readToken();
  if (!base || !token) return null;

  const u = new URL(`${base}/api/articles`);
  u.searchParams.set("filters[slug][$eq]", slug);
  u.searchParams.set("filters[category][slug][$eq]", "docs");
  u.searchParams.append("populate", "cover");
  u.searchParams.append("populate", "category");
  u.searchParams.append("populate", "blocks");
  u.searchParams.set("publicationState", "live");

  const res = await fetch(u.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: unknown };
  const first = Array.isArray(json.data) ? json.data[0] : json.data;
  if (!first || typeof first !== "object") return null;
  return first as Record<string, unknown>;
}
