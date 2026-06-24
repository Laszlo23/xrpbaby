import { homeDrops } from "@/content/home-drops";
import { getServerPublicOrigin } from "@/lib/app-origin";
import { loadMergedHomeDrops } from "@/lib/home-drops-merge";
import { buildSitemapEntries, escapeXml, type SitemapEntry } from "@/lib/seo";

async function resolvedDropPaths(): Promise<string[]> {
  try {
    const merged = await loadMergedHomeDrops();
    return merged.map((d) => `/drops/${d.slug}`);
  } catch {
    return homeDrops.map((d) => `/drops/${d.slug}`);
  }
}

function mergeDropEntries(entries: SitemapEntry[], dropPaths: string[]): SitemapEntry[] {
  const known = new Set(entries.map((entry) => entry.path));
  const extras = dropPaths
    .filter((path) => !known.has(path))
    .map((path) => ({
      path,
      priority: 0.7,
      changefreq: "monthly" as const,
    }));
  return [...entries, ...extras];
}

function buildSitemapXmlResponse(originSansSlash: string, entries: SitemapEntry[]): Response {
  const lastmod = new Date().toISOString().slice(0, 10);
  const deduped = new Map<string, SitemapEntry>();
  for (const entry of entries) {
    deduped.set(entry.path, entry);
  }

  const urlEntries = Array.from(deduped.values())
    .sort((a, b) => {
      if (a.path === "/") return -1;
      if (b.path === "/") return 1;
      return a.path.localeCompare(b.path);
    })
    .map((entry) => {
      const loc = entry.path === "/" ? originSansSlash : `${originSansSlash}${entry.path}`;
      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority.toFixed(2)}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

/** Shared XML sitemap body for `/sitemap.xml` (and legacy `/sitemap/xml` redirect). */
export async function sitemapXmlResponse(): Promise<Response> {
  const origin = getServerPublicOrigin().replace(/\/$/, "");
  try {
    const dropPaths = await resolvedDropPaths();
    const entries = mergeDropEntries(buildSitemapEntries(), dropPaths);
    return buildSitemapXmlResponse(origin, entries);
  } catch (err) {
    console.error("[sitemap] falling back to static entries", err);
    return buildSitemapXmlResponse(origin, buildSitemapEntries());
  }
}
