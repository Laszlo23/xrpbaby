import { propertyUrl, type PropertySlug } from "@bc/registry";

/**
 * Eco / revival landing (physical lane). Set in production so the main app can link to the hub story.
 * Example: https://eco.buildingculture.capital
 */
export function getEcoHubLandingUrl(): string | undefined {
  const v = import.meta.env.VITE_ECO_HUB_LANDING_URL as string | undefined;
  const t = v?.trim();
  return t || undefined;
}

/** Deep link into an ecorwa property story on the configured eco hub. */
export function getEcoHubPropertyUrl(slug: PropertySlug): string | undefined {
  const base = getEcoHubLandingUrl();
  if (!base) return undefined;
  return propertyUrl(slug, base);
}
