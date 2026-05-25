import {
  getDemoImageSlides,
  type DemoImageSlide,
  type DemoPropertyDetail,
} from "@/lib/demo-properties";

/**
 * Canonical hero path under `public/properties/{id}/hero.jpg`.
 */
export function getPropertyDedicatedHeroPath(propertyId: bigint | number): string {
  const id = typeof propertyId === "bigint" ? propertyId.toString() : String(propertyId);
  return `/properties/${id}/hero.jpg`;
}

/**
 * Slides for carousels: dedicated hero first, then demo gallery (deduped).
 */
export function getPropertyHeroSlides(
  propertyId: bigint,
  demo: DemoPropertyDetail,
  opts?: { limit?: number },
): DemoImageSlide[] {
  const limit = opts?.limit ?? 48;
  const heroSrc = getPropertyDedicatedHeroPath(propertyId);
  const hero: DemoImageSlide = { src: heroSrc, alt: demo.imageAlt };
  const rest = getDemoImageSlides(demo, { limit }).filter((s) => s.src !== heroSrc);
  return [hero, ...rest].slice(0, limit);
}
