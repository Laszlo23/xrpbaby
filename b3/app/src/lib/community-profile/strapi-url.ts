/** Base URL for Strapi REST (no trailing slash). */
export function getStrapiUrl(): string {
  const raw = import.meta.env.VITE_STRAPI_URL as string | undefined;
  return (raw?.replace(/\/$/, "") || "http://127.0.0.1:1337").trim();
}

export function strapiMediaUrl(entry: { url?: string } | null | undefined): string | null {
  if (!entry?.url) return null;
  if (entry.url.startsWith("http")) return entry.url;
  return `${getStrapiUrl()}${entry.url}`;
}
