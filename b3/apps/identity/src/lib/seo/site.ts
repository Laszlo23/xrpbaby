const DEFAULT_SITE_ORIGIN = "https://buildingcultureid.space";

export const SITE_ORIGIN = (
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") || DEFAULT_SITE_ORIGIN
).trim();

export const TWITTER_SITE = "@buildingcultu3";

export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og.png`;

export const SITE_NAME = "Culture Layer";

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}

export function profileUrl(fullName: string): string {
  return absoluteUrl(`/id/${encodeURIComponent(fullName.toLowerCase())}`);
}

export function canonicalPath(path: string): string {
  return absoluteUrl(path);
}
