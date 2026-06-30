/** Canonical main app origin (REOC JSON, unified portfolio hub). */
export function getAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_ORIGIN?.replace(/\/$/, "") ||
    "https://app.buildingcultureid.space"
  );
}

/** Places site origin for media paths (hero images on CDN). */
export function getPlacesMediaOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://places.buildingcultureid.space"
  );
}
