/**
 * Server / SSR canonical origin (no trailing slash). Used for manifests and OG/meta when there is no browser.
 */
export function getServerPublicOrigin(): string {
  const raw =
    process.env.VITE_APP_ORIGIN?.trim() ||
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    process.env.URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    return "https://app.buildingcultureid.space";
  }
  return "http://localhost:5173";
}

/**
 * Canonical HTTPS origin for embeds, manifests, and share verification (no trailing slash).
 */
export function getPublicAppOrigin(): string {
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return getServerPublicOrigin();
}
