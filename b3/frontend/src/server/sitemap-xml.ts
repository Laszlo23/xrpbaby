import { homeDrops } from "@/content/home-drops";
import { getServerPublicOrigin } from "@/lib/app-origin";
import { loadMergedHomeDrops } from "@/lib/home-drops-merge";
import { SITEMAP_PATHS } from "@/lib/seo";

async function resolvedDropPaths(): Promise<string[]> {
  try {
    const merged = await loadMergedHomeDrops();
    return merged.map((d) => `/drops/${d.slug}`);
  } catch {
    return homeDrops.map((d) => `/drops/${d.slug}`);
  }
}

function buildSitemapXmlResponse(originSansSlash: string, pathList: string[]): Response {
  const lastmod = new Date().toISOString().slice(0, 10);
  const paths = Array.from(new Set(pathList));
  const urlEntries = paths
    .map((path) => {
      const loc = path === "/" ? originSansSlash : `${originSansSlash}${path}`;
      const priority = path === "/" ? "1.0" : "0.85";
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function staticFallbackPaths(): string[] {
  return [...SITEMAP_PATHS, ...homeDrops.map((d) => `/drops/${d.slug}`)];
}

/** Shared XML sitemap body for `/sitemap.xml` (and legacy `/sitemap/xml` if kept). */
export async function sitemapXmlResponse(): Promise<Response> {
  const origin = getServerPublicOrigin().replace(/\/$/, "");
  try {
    const dropPaths = await resolvedDropPaths();
    return buildSitemapXmlResponse(origin, [...SITEMAP_PATHS, ...dropPaths]);
  } catch (err) {
    console.error("[sitemap] falling back to static paths", err);
    return buildSitemapXmlResponse(origin, staticFallbackPaths());
  }
}
