/**
 * Fullscreen funnel slides — intro portfolio teaser + one panel per demo property.
 * Titles align with Culture Land when `exploreHref` matches (`culture-land-portfolio`).
 */
import { getCultureLandDisplayForDemoPropertyId } from "@/lib/culture-land-portfolio";
import { DEMO_PROPERTY_DETAILS, getDemoImageSlides } from "@/lib/demo-properties";
import {
  EXPERIENCE_EXCLUDED_DEMO_IDS,
  getExperienceCarouselPropertyIds,
  getExperiencePortfolioTotals,
  type ExperiencePortfolioTotals,
} from "@/lib/experience-portfolio-totals";

export type ExperienceIntroSlide = {
  kind: "intro";
  totals: ExperiencePortfolioTotals;
};

export type ExperiencePropertySlide = {
  kind: "property";
  kicker?: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  propertyId: number;
};

export type ExperienceSlide = ExperienceIntroSlide | ExperiencePropertySlide;

function truncateThesis(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

/** Property-only slides (same order as catalogue ids, excluding interim ids). */
export function getProjectExperienceSlides(): ExperiencePropertySlide[] {
  const ids = getExperienceCarouselPropertyIds();
  return ids.map((propertyId) => {
    const d = DEMO_PROPERTY_DETAILS[propertyId]!;
    const img = getDemoImageSlides(d)[0]!;
    const cl = getCultureLandDisplayForDemoPropertyId(propertyId);
    const title = cl?.title ?? d.headline;
    const subtitle = cl
      ? truncateThesis(`${cl.tagline} — ${cl.region}`, 220)
      : truncateThesis(d.thesis, 220);
    return {
      kind: "property" as const,
      propertyId,
      kicker: d.discoveryCategory,
      title,
      subtitle,
      imageSrc: img.src,
      imageAlt: img.alt,
    };
  });
}

/** Intro + property slides for `/experience` carousel. */
export function getExperienceSlides(): ExperienceSlide[] {
  const totals = getExperiencePortfolioTotals();
  const intro: ExperienceIntroSlide = { kind: "intro", totals };
  return [intro, ...getProjectExperienceSlides()];
}

/** Re-export exclusion set for tests / tooling. */
export { EXPERIENCE_EXCLUDED_DEMO_IDS };
