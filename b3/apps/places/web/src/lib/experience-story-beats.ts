/**
 * Per-property story arc: four photo beats (place → how → facts → partners), each with a distinct image.
 * Culture Land titles when `exploreHref` matches; partner links on the final beat only.
 */
import { getCultureLandDisplayForDemoPropertyId } from "@/lib/culture-land-portfolio";
import {
  DEMO_PROPERTY_DETAILS,
  type DemoPropertyDetail,
  formatAnnualRentEur,
  formatPropertyValueEur,
  formatSquareMeters,
  getDemoImageSlides,
  getEstimatedYieldPercent,
  REFERENCE_YIELD_BAND_LABEL,
} from "@/lib/demo-properties";
import { IMMERSIVE_STORY_FRAME_COUNT } from "@/lib/property-geo";

const INTRO_HERO_IMAGE = "/partners/Keutschach-am-See-1b-1.jpg";

export type StoryBeatRole =
  | "mission"
  | "vision"
  | "place"
  | "gallery"
  | "why"
  | "how"
  | "facts"
  | "partners"
  | "solution"
  | "portfolio";

export type StoryBeat = {
  role: StoryBeatRole;
  roleLabel: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  partnerLinks?: readonly { label: string; href: string }[];
  /** Populated for `facts` beat — rendered as a stat grid in the immersive shell. */
  factsRows?: readonly { label: string; value: string }[];
};

const ROLE_LABELS: Record<StoryBeatRole, string> = {
  mission: "Mission",
  vision: "Vision",
  place: "The place",
  gallery: "The building",
  why: "The investment",
  how: "The build",
  facts: "The numbers",
  partners: "Partners & craft",
  solution: "The protocol",
  portfolio: "Portfolio overview",
};

const PARTNERS_BLURB =
  "Craft and collaborators from vision to keys — partner narrative for context.";

const HOLZBAUER_PARTNER_URL = "https://holzbauer-partner.at/haus-im-weinviertelniederoesterreich/";

function trunc(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function buildFactsRows(d: DemoPropertyDetail): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [
    { label: "Planning yield band (portfolio)", value: `${REFERENCE_YIELD_BAND_LABEL} p.a.` },
    { label: "Reference value", value: formatPropertyValueEur(d) },
    { label: "Lettable area", value: formatSquareMeters(d.squareMeters) },
    { label: "Gross rent (p.a.)", value: formatAnnualRentEur(d.annualRentalIncomeEur) },
    { label: "Modelled gross yield", value: `${getEstimatedYieldPercent(d).toFixed(1)}%` },
  ];
  if (d.unitCountLabel?.trim()) {
    rows.push({ label: "Programme", value: d.unitCountLabel });
  }
  return rows;
}

/** First N unique image URLs (immersive never shows the same asset twice per property). */
function uniqueSlideDeck(d: DemoPropertyDetail, max: number): { src: string; alt: string }[] {
  const raw = getDemoImageSlides(d, { limit: 48 });
  const out: { src: string; alt: string }[] = [];
  const seen = new Set<string>();
  for (const s of raw) {
    if (seen.has(s.src)) continue;
    seen.add(s.src);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

/** Single beat — hook only; live pipeline + catalogue figures stay in the aside panel. */
export function getIntroPortfolioBeats(): StoryBeat[] {
  return [
    {
      role: "portfolio",
      roleLabel: ROLE_LABELS.portfolio,
      title: "City · Land · Water — culture real estate at portfolio scale.",
      subtitle: `Building Culture City, Land, and Water — swipe for building stories. Planning band ${REFERENCE_YIELD_BAND_LABEL} p.a. across the catalogue — issuer materials and Legal for terms.`,
      imageSrc: INTRO_HERO_IMAGE,
      imageAlt: "Portfolio — lake and partner programme imagery; listings cover City, Land, and Water.",
    },
  ];
}

/**
 * Four beats: place → how → facts → partners — each uses a distinct image (`src`).
 */
export function getStoryBeatsForProperty(propertyId: number): StoryBeat[] {
  const d = DEMO_PROPERTY_DETAILS[propertyId];
  if (!d) return [];

  const slides = uniqueSlideDeck(d, IMMERSIVE_STORY_FRAME_COUNT);
  if (slides.length < IMMERSIVE_STORY_FRAME_COUNT) return [];

  const hero = slides[0]!;
  const mid = slides[1]!;
  const factsBg = slides[2]!;
  const partnersBg = slides[3]!;
  const cl = getCultureLandDisplayForDemoPropertyId(propertyId);

  const howLine =
    d.architectureNarrative?.trim() ??
    (d.highlights?.length ? d.highlights.slice(0, 2).join(" · ") : trunc(d.thesis, 160));
  const protocol =
    d.ownershipModel?.trim() ??
    d.fundingRoundNote?.trim() ??
    "Tokenized fractional exposure with issuer-managed economics — see project brief.";

  const placeSubtitle = cl
    ? trunc(`${cl.tagline} — ${cl.region}. ${trunc(d.thesis, 140)}`, 200)
    : trunc(d.vision?.trim() ?? d.thesis, 200);

  const factsRows = buildFactsRows(d);

  return [
    {
      role: "place",
      roleLabel: ROLE_LABELS.place,
      title: trunc(cl?.title ?? d.headline, 90),
      subtitle: placeSubtitle,
      imageSrc: hero.src,
      imageAlt: hero.alt,
    },
    {
      role: "how",
      roleLabel: ROLE_LABELS.how,
      title: "How it came together",
      subtitle: trunc(howLine, 200),
      imageSrc: mid.src,
      imageAlt: mid.alt,
    },
    {
      role: "facts",
      roleLabel: ROLE_LABELS.facts,
      title: "Reference economics",
      subtitle: "Planning figures — issuer data room and Legal govern any commitment.",
      imageSrc: factsBg.src,
      imageAlt: factsBg.alt,
      factsRows,
    },
    {
      role: "partners",
      roleLabel: ROLE_LABELS.partners,
      title: "What we're building",
      subtitle: trunc(`${PARTNERS_BLURB} ${protocol}`, 240),
      imageSrc: partnersBg.src,
      imageAlt: partnersBg.alt,
      partnerLinks: [
        { label: "Holzbauer & Partner — Haus im Weinviertel", href: HOLZBAUER_PARTNER_URL },
        { label: "Culture Land portfolio", href: "/culture-land" },
      ],
    },
  ];
}
