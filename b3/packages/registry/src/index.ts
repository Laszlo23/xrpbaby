/** Ordered property landing slugs (eco RWA story routes). */
export const PROPERTY_SLUGS = [
  "berggasse",
  "jagdschlossgasse-81",
  "whalewatching",
  "landmark-bernhardsthal",
  "altes-presshaus-katzelsdorf",
  "former-dept-store-bernhardsthal",
  "water-side-keutschach",
] as const;

export type PropertySlug = (typeof PROPERTY_SLUGS)[number];

export function isPropertySlug(s: string): s is PropertySlug {
  return (PROPERTY_SLUGS as readonly string[]).includes(s);
}

/** In-app path on the eco hub (`/property/:slug`). */
export function propertyStoryPath(slug: PropertySlug): string {
  return `/property/${slug}`;
}

/**
 * Absolute or relative URL for a property story.
 * @param baseUrl — e.g. `https://eco.buildingculture.capital` (no trailing slash required).
 */
export function propertyUrl(slug: PropertySlug, baseUrl?: string): string {
  const path = propertyStoryPath(slug);
  const base = baseUrl?.trim();
  if (!base) return path;
  return `${base.replace(/\/$/, "")}${path}`;
}
