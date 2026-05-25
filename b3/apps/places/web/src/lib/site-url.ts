/** Canonical site origin for metadata, sitemap, and JSON-LD (no trailing slash). */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://buildingculture.capital";
}

/** Origin for share/copy links in the browser; uses `window` when available (staging/dev). */
export function getPublicOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return getSiteUrl();
}
