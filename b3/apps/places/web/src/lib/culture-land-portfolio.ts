/**
 * Building Culture Land — partner portfolio copy, editorial English.
 * Reference figures are partner-sourced; confirm details in issuer disclosures and the data room.
 */

import { ST_IMMO_HOMEPAGE, ST_IMMO_LAND_PHILOSOPHY } from "@/lib/st-immo-buildings";

/** Short narrative: settlement layer + people-aligned ownership + path to dedicated RWA infrastructure. */
export const CULTURE_LAND_CHAIN_MANIFESTO: readonly string[] = [
  "Building Culture Land is programmable real estate — transparent rules on-chain, community-first capital, and settlement that does not depend on opaque intermediaries for every step.",
  "We are live on Base with cultural assets you can explore and back. The roadmap is real-world property — owned by participants, auditable by design, and built for long-term stewardship.",
];

export const HOLZBAUER_REFERENCE_URL =
  "https://holzbauer-partner.at/haus-im-weinviertelniederoesterreich/";

export type CultureLandProject = {
  id: string;
  title: string;
  region: string;
  /** Short hero line */
  tagline: string;
  narrative: string[];
  factSheet: {
    label: string;
    value: string;
  }[];
  greenPrint: string[];
  /** Partner vision, future use, or context — optional */
  partnerNote?: string;
  imageSrc: string;
  imageAlt: string;
  /** Link to on-chain property detail when the listing aligns */
  exploreHref?: string;
};

/** Partner acquisition pipeline — Vienna, Carinthia, and other tracks; indicative figures from partner materials. */
export type BuildingCultureCityPipelineProject = {
  id: string;
  title: string;
  /** Short label for jump nav / chips when `title` has a long prefix */
  shortTitle?: string;
  region: string;
  tagline: string;
  /** Editorial — exploitation / value-add angle */
  narrative: string[];
  factSheet: { label: string; value: string }[];
  /** Optional hero image; pipeline cards use a numbered gradient when omitted */
  imageSrc?: string;
  imageAlt: string;
  /** External PDFs / plans (e.g. VENDONO, floor plans) */
  documents?: { label: string; href: string }[];
  /** Numeric aggregates for immersive / reference scale (avoid parsing factSheet strings) */
  metrics?: {
    lettableAreaM2?: number;
    indicativePurchaseEur?: number;
    indicativeRentEur?: number;
  };
};

/** Nav chip text: prefers `shortTitle`, else strips known title prefixes. */
export function pipelineNavLabel(project: Pick<BuildingCultureCityPipelineProject, "title" | "shortTitle">): string {
  if (project.shortTitle?.trim()) return project.shortTitle.trim();
  const t = project.title
    .replace(/^BuildingCultureCity — /i, "")
    .replace(/^Building Culture Water — /i, "")
    .replace(/^Building Culture — /i, "")
    .trim();
  return t || project.title;
}

/** Homepage hero lines — canonical copy lives in `st-immo-buildings.ts` (ST-IMMO briefs). */
export const BLOCKCHAIN_HOMEPAGE_LINES = ST_IMMO_HOMEPAGE;

export const BUILDING_CULTURE_LAND_PHILOSOPHY: string[] = ST_IMMO_LAND_PHILOSOPHY;

export const CULTURE_LAND_PROJECTS: CultureLandProject[] = [
  {
    id: "alter-stadl",
    title: "BuildingCultureLand – AlterStadl",
    region: "Katzelsdorf · Weinviertel · northeast of Vienna",
    tagline: "Historic masonry, carefully renovated",
    narrative: [
      "Modern enjoyment of time: the historic masonry of the AlterStadl in Katzelsdorf was carefully renovated. Existing structures are woven into the new design as a defining feature.",
    ],
    factSheet: [
      { label: "Total rental area (reference)", value: "250 m²" },
      { label: "Terrace (rental)", value: "100 m²" },
      { label: "Garden (rental)", value: "1,000 m²" },
      { label: "KP samt NK (Apr 2026 fact sheet)", value: "€600,000" },
      { label: "Gross rental income (p.a., reference)", value: "€50,000" },
    ],
    greenPrint: [
      "Air-source heat pump",
      "Large green yards that help cool the microclimate",
      "Generous terraces",
      "No unnecessary sealing of valuable land",
    ],
    partnerNote:
      "Weinviertel reference architecture (external site — imagery may differ from this project): see link in the introduction.",
    imageSrc: "/stadl01.jpg",
    imageAlt: "BuildingCultureLand – AlterStadl — Katzelsdorf",
  },
  {
    id: "whalewatching",
    title: "BuildingCultureLand – Whalewatching",
    region: "Canada · coastal lodge reference",
    tagline: "Preserved structure, orientation to the sea",
    narrative: [
      "The old cottage was extended and fully renovated. A priority was preserving the existing structure and its orientation toward the sea.",
      "This narrative is pegged to Canadian coastal reference assets — not the Carinthia Water Side / Keutschach lakeside programme (see archive card below).",
      "Partners have also explored adapting a comparable programme to the Land-Mark warehouse context in the Weinviertel — a creative reuse conversation, not a committed plan.",
    ],
    factSheet: [
      { label: "Total rental area", value: "440 m²" },
      { label: "Terrace (rental)", value: "100 m²" },
      { label: "Garden (rental)", value: "800 m²" },
      { label: "Reference acquisition", value: "€2,900,000" },
      { label: "Gross rental income (p.a., reference)", value: "€100,000" },
    ],
    greenPrint: [
      "Large green yards that help cool the microclimate",
      "Terraces",
      "No unnecessary sealing of valuable land",
    ],
    imageSrc: "/whale01.jpg",
    imageAlt: "BuildingCultureLand – Whalewatching — Canada coastal lodge reference imagery",
    exploreHref: "/properties/3",
  },
  {
    id: "old-department-store",
    title: "BuildingCultureLand – Former department store",
    region: "Bernhardsthal · village centre · Weinviertel",
    tagline: "New life for a historic retail building",
    narrative: [
      "New life for the historic department store in the village centre of Bernhardsthal, northeast of Vienna. The original fabric is being renovated and adapted for contemporary use: an all-round retreat with an apartment, a café, and a modern townhouse.",
    ],
    factSheet: [
      { label: "Total rental area", value: "400 m²" },
      { label: "Terrace (rental)", value: "100 m²" },
      { label: "Garden (rental)", value: "200 m²" },
      { label: "Reference acquisition", value: "€850,000" },
      { label: "Gross rental income (p.a., reference)", value: "€50,000" },
    ],
    greenPrint: [
      "Air-source heat pump and solar",
      "Green yards for cooling",
      "Terraces",
      "No unnecessary sealing of valuable land",
    ],
    imageSrc: "/old01.jpg",
    imageAlt: "BuildingCultureLand – Former department store — Bernhardsthal",
    exploreHref: "/properties/7",
  },
  {
    id: "altes-presshaus",
    title: "BuildingCultureLand – Altes Presshaus",
    region: "Katzelsdorf · Weinviertel",
    tagline: "Loft character, visible timber",
    narrative: [
      "Historic masonry of the old press house in Katzelsdorf, carefully renovated with existing structures integrated into the design. A loft-like plan and visible half-timbering in the open roof truss create space for creativity and a distinctive living atmosphere.",
    ],
    factSheet: [
      { label: "Total rental area", value: "300 m²" },
      { label: "Terrace (rental)", value: "100 m²" },
      { label: "Garden (rental)", value: "800 m²" },
      { label: "Reference acquisition", value: "€950,000" },
      { label: "Gross rental income (p.a., reference)", value: "€70,000" },
    ],
    greenPrint: [
      "Air-source heat pump and solar",
      "Large green yards",
      "Terraces",
      "No unnecessary sealing of valuable land",
    ],
    imageSrc: "/press0.jpg",
    imageAlt: "BuildingCultureLand – Altes Presshaus — Katzelsdorf",
    exploreHref: "/properties/6",
  },
  {
    id: "landmark-bernhardsthal",
    title: "BuildingCultureLand – LandMark",
    region: "Bernhardsthal · Weinviertel",
    tagline: "From warehouse to village quarter",
    narrative: [
      "A modern quarter is growing from a former warehouse site: a residential tower with lofts and generous terraces, and a lively ground floor that turns a dormant plot into a new village hub. A landmark in the landscape — a granary converted into modern living with historic agricultural character and authentic detail.",
      "The ensemble adds terraced houses with green roofscapes; the ground floor mixes commercial, shared, and cultural uses.",
      "Partners have discussed activating the ground floor as a hotspot for education and community around Bitcoin and digital assets — developer showcases, beginner training, and small executive gatherings — alongside classic commercial use. Any programme would follow zoning, compliance, and community consultation.",
    ],
    factSheet: [
      { label: "Programme", value: "24 apartments · 4 terraced houses · 3 commercial / office units" },
      { label: "Total rental area", value: "2,371 m²" },
      { label: "Terrace (rental)", value: "1,020 m²" },
      { label: "Garden (rental)", value: "656 m²" },
      { label: "Parking spaces", value: "23" },
      { label: "Reference acquisition", value: "€10,900,000" },
      { label: "Gross rental income (p.a., reference)", value: "€350,000" },
    ],
    greenPrint: [
      "Geothermal heating and cooling",
      "Photovoltaics",
      "Large green yards",
      "Terraces for all apartments",
      "No unnecessary sealing of valuable land",
      "Conversion of grain storage into contemporary homes — high-quality reuse",
    ],
    imageSrc: "/land0.jpg",
    imageAlt: "BuildingCultureLand – LandMark — Bernhardsthal",
    exploreHref: "/properties/5",
  },
  {
    id: "water-side-keutschach",
    title: "Water Side — Keutschach (reference archive)",
    region: "Keutschach am See · Carinthia",
    tagline: "Six houses, thirty-four homes, lake panorama",
    narrative: [
      "Archived partner narrative for the large lakeside programme (not linked to the current on-chain listing slot). On-chain property #3 now carries the Whalewatching coastal reference — confirm the live listing mapping in issuer materials.",
      "Water Side on Lake Keutschach: six buildings, thirty-four apartments (roughly 50–247 m²), with wooden façades and large glass walls that sit lightly in the landscape.",
    ],
    factSheet: [
      { label: "Total rental area", value: "802 m²" },
      { label: "Terrace (rental)", value: "230 m²" },
      { label: "Garden (rental)", value: "429 m²" },
      { label: "Parking spaces", value: "16" },
      { label: "Reference acquisition", value: "€10,500,000" },
      { label: "Gross rental income (p.a., reference)", value: "€250,000" },
    ],
    greenPrint: [
      "Geothermal heating and cooling",
      "Large green yards",
      "Terraces for all apartments",
      "Private lake access with jetty and bathhouse",
    ],
    imageSrc: "/partners/Keutschach-am-See-1b-1.jpg",
    imageAlt: "Water Side Keutschach — partner imagery",
  },
  {
    id: "jagdschlossgasse-81",
    title: "Building Culture City Jagdschlossgasse 81",
    region: "Vienna · opposite the historic Werkbundsiedlung",
    tagline: "Nine apartments, modernist clarity",
    narrative: [
      "Opposite the Werkbundsiedlung of the 1930s, a contemporary residential building with nine rental apartments is taking shape: cubist forms, clean lines, generous glazing, and open spaces. Greenery wraps the site; views are green on all sides.",
    ],
    factSheet: [
      { label: "Total rental area", value: "553 m²" },
      { label: "Terrace (rental)", value: "106 m²" },
      { label: "Garden (rental)", value: "429 m²" },
      { label: "Parking spaces", value: "6" },
      { label: "Reference acquisition", value: "€8,300,000" },
      { label: "Gross rental income (p.a., reference)", value: "€187,000" },
    ],
    greenPrint: [
      "Air-source heat pump and solar",
      "Large green yards",
      "Terraces for all apartments",
      "Prime location beside the Lainzer Tiergarten — Vienna’s large recreational forest",
    ],
    imageSrc: "/partners/Jagdschlossgasse-Projekte-Intro.jpg",
    imageAlt: "Jagdschlossgasse — partner project imagery",
    exploreHref: "/properties/2",
  },
  {
    id: "berggasse-35",
    title: "Building Culture City Berggasse",
    region: "Vienna · Servitenviertel",
    tagline: "Gründerzeit fabric, adapted with care",
    narrative: [
      "Berggasse 35 is a historic place of connections. To Franz von Neumann’s plans, the Centrale II telephone exchange was built here in 1898. More than a century later, the Gründerzeit building has been carefully updated. In a prime location at the heart of the Servitenviertel, a new chapter offers a home that already feels lived-in.",
    ],
    factSheet: [
      { label: "Total rental area", value: "730 m²" },
      { label: "Terrace (rental)", value: "340 m²" },
      { label: "Parking spaces", value: "4" },
      { label: "KP samt NK (Apr 2026 fact sheet)", value: "€15,917,000" },
      { label: "Gross rental income (p.a., reference)", value: "€25,000" },
    ],
    greenPrint: [
      "District heating and district cooling",
      "Shared green courtyard for tenants and owners",
      "Terraces for nearly all apartments",
      "Central, vibrant residential quarter",
      "Conversion of office / telegraph use into contemporary homes — high-quality reuse",
    ],
    imageSrc: "/berg01.jpg",
    imageAlt: "Building Culture City Berggasse — project photography",
    exploreHref: "/properties/1",
  },
];

/**
 * Partner acquisition pipeline (Vienna, Carinthia, other tracks).
 * Figures are indicative and subject to diligence, negotiation, and issuer approval.
 */
export const BUILDING_CULTURE_CITY_PIPELINE: BuildingCultureCityPipelineProject[] = [
  {
    id: "bcc-city-center",
    title: "BuildingCultureCity — City Center",
    region: "Vienna · central locations",
    tagline: "Scale rental footprint in the core city",
    narrative: [
      "Exploitation focus: disciplined asset management with a clear path to higher rental income across a mixed residential, office, and retail stack.",
      "Structured for institutional-style reporting — underwriting assumes lease-up discipline and indexed rent where contracts allow.",
    ],
    factSheet: [
      { label: "Exploitation strategy", value: "Asset management; increase rental income" },
      {
        label: "Total lettable area (residential, office & retail)",
        value: "2,100 m²",
      },
      { label: "KP samt NK (Apr 2026 fact sheet)", value: "€15,000,000" },
      { label: "Rental income (p.a., indicative)", value: "€300,000" },
    ],
    imageAlt: "BuildingCultureCity City Center — pipeline visualization",
    metrics: {
      lettableAreaM2: 2100,
      indicativePurchaseEur: 15_000_000,
      indicativeRentEur: 300_000,
    },
  },
  {
    id: "bcc-danube-air",
    title: "BuildingCultureCity — Danube Air",
    region: "Vienna · Danube corridor",
    tagline: "Income today, selective residential releases tomorrow",
    narrative: [
      "Combines stable rental cash flow with optional monetisation of residential inventory where market depth supports phased apartment sales.",
      "Risk framing is explicit: realised exit prices and timing depend on zoning, buyer demand, and marketing execution.",
    ],
    factSheet: [
      {
        label: "Exploitation strategy",
        value: "Asset management; increase rental income; selective sale of apartments",
      },
      { label: "Total lettable area (residential & retail)", value: "2,395 m²" },
      { label: "KP samt NK (Apr 2026 fact sheet)", value: "€5,500,000" },
      { label: "Rental income (p.a., indicative)", value: "€230,000" },
    ],
    imageAlt: "BuildingCultureCity Danube Air — pipeline visualization",
    metrics: {
      lettableAreaM2: 2395,
      indicativePurchaseEur: 5_500_000,
      indicativeRentEur: 230_000,
    },
  },
  {
    id: "bcc-north-central-rail",
    title: "BuildingCultureCity — North · central railway context",
    region: "Vienna · north · connectivity-led micro-location",
    tagline: "Permissions plus refurbish — staged yield step-up",
    narrative: [
      "Exploitation pathway: secure attic / rooftop development permission, stabilise income on the standing asset, then layer capital into attic delivery and selective refurbishment.",
      "Post-completion economics are scenario-based — compare “in-place” versus “after development” rents with conservative absorption assumptions.",
    ],
    factSheet: [
      {
        label: "Exploitation strategy",
        value: "Development permission (attic); asset management thereafter",
      },
      {
        label: "Total lettable area (reference)",
        value: "2,000 m²",
      },
      { label: "KP samt NK (Apr 2026 fact sheet)", value: "€7,800,000" },
      { label: "Rental income (p.a., indicative)", value: "€350,000" },
    ],
    imageAlt: "BuildingCultureCity north / railway context — pipeline visualization",
    metrics: {
      lettableAreaM2: 2000,
      indicativePurchaseEur: 7_800_000,
      indicativeRentEur: 350_000,
    },
  },
  {
    id: "bcw-green-lake-suites",
    title: "Building Culture Water — GREEN & LAKE · SUITES",
    shortTitle: "GREEN & LAKE · SUITES",
    region: "Reifnitz am Wörthersee · Carinthia",
    tagline: "Six apartments, lake proximity, generous outdoor living",
    narrative: [
      "Partner-sourced programme: six apartments across 2–4 bedrooms with about 450 m² lettable interior and about 300 m² further lettable deck space — courtyards set within a green park setting, roughly 200 m walking distance to the lake.",
      "Green line (partner narrative): air-source heat pump with solar support; large courtyards in a park context; substantial covered decks as extended living space.",
      "Figures are reference for diligence — verify against issuer materials, surveys, and tenancy schedule before any commitment.",
    ],
    factSheet: [
      { label: "Programme", value: "6 apartments (2, 3 & 4 bedrooms)" },
      { label: "Lettable interior + deck (fact sheet m² reference)", value: "300 m²" },
      { label: "Parking spaces", value: "20" },
      { label: "KP samt NK (Apr 2026 fact sheet)", value: "€5,300,000" },
      { label: "Rent (p.a., reference)", value: "€200,000" },
      { label: "Lake access", value: "~200 m walking" },
      { label: "Klagenfurt Airport", value: "~15 minutes" },
    ],
    imageSrc: "/culture-land/green-lake/hero-render.png",
    imageAlt: "Building Culture Water — GREEN & LAKE · SUITES — architectural visualization Reifnitz",
    documents: [
      {
        label: "VENDONO Top 10",
        href: "https://buildingculture.4everbucket.com/VENDONO_Green%26Lake_Top%2010.pdf",
      },
      {
        label: "VENDONO Top 6",
        href: "https://buildingculture.4everbucket.com/VENDONO_Green%26Lake_Top_6v1.pdf",
      },
      {
        label: "VENDONO Top 8",
        href: "https://buildingculture.4everbucket.com/VENDONO_Green%26Lake_Top_8.pdf",
      },
      {
        label: "Grundriss Top 10 · 4 Zi",
        href: "https://buildingculture.4everbucket.com/Grundriss%20Top%2010%204%20Zi.pdf",
      },
      {
        label: "Folder (overview)",
        href: "https://buildingculture.4everbucket.com/VENDONO_Green%26Lake_Folder.pdf",
      },
    ],
    metrics: {
      lettableAreaM2: 300,
      indicativePurchaseEur: 5_300_000,
      indicativeRentEur: 200_000,
    },
  },
  {
    id: "bcc-buero-labor-state",
    title: "Building Culture — Büro · Labor (state tenant)",
    shortTitle: "Büro · Labor · state tenant",
    region: "Austria · location under diligence",
    tagline: "Long-dated public-sector income · LEED Gold",
    narrative: [
      "Indicative institutional-style acquisition: office / laboratory use with a state organisation as tenant — fifteen-year lease term plus two optional five-year extensions, subject to final contract and disclosure.",
      "Certification: LEED Gold (partner-reported) as the sustainability frame; verify engineering and compliance documentation in diligence.",
      "Not an on-chain listing — pipeline visibility only. Economics are partner-sourced placeholders until a formal process and data room are available.",
    ],
    factSheet: [
      { label: "Sector", value: "Office · laboratory / life science (reference)" },
      { label: "KP samt NK (Apr 2026 fact sheet)", value: "€100,000,000" },
      { label: "Lettable area (reference)", value: "15,000 m²" },
      { label: "Rental income (p.a., indicative)", value: "€4,000,000" },
      { label: "Indicative yield", value: "4 % (reference)" },
      { label: "Tenant", value: "State organisation (diligence)" },
      { label: "Lease term", value: "15 years + 2 × 5 years extension (option)" },
      { label: "Certification", value: "LEED Gold (partner-reported)" },
    ],
    imageAlt: "Office · laboratory — pipeline placeholder",
    metrics: {
      lettableAreaM2: 15_000,
      indicativePurchaseEur: 100_000_000,
      indicativeRentEur: 4_000_000,
    },
  },
];

export type CultureLandDisplay = {
  title: string;
  tagline: string;
  region: string;
};

/** Culture Land card copy for a seeded listing id when `exploreHref` matches `/properties/{id}`. */
export function getCultureLandDisplayForDemoPropertyId(id: number): CultureLandDisplay | null {
  const href = `/properties/${id}`;
  const p = CULTURE_LAND_PROJECTS.find((x) => x.exploreHref === href);
  if (!p) return null;
  return { title: p.title, tagline: p.tagline, region: p.region };
}
