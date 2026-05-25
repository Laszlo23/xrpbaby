/**
 * ST-IMMO / BuildingCulture editorial catalog — production-ready structured copy.
 * Source: partner email briefs. Figures are reference until verified in issuer disclosures.
 * Not financial advice. Demo on-chain listings may bundle or rename assets for testnet UX.
 *
 * Workflow: raw emails → extraction runbook → map fields → edit this file.
 * @see ../../../docs/st-immo/README.md
 * @see ../../../docs/st-immo/PROMPT_TO_TYPESCRIPT.md
 */

export const ST_IMMO_HOMEPAGE = {
  kicker: "Building Culture",
  headline: "Creating spaces that enrich everyday life",
  sublines: [
    "We make a contribution to the world of construction and life with our projects.",
    "Structures are reflections — they are intended to create positive change.",
  ],
} as const;

/** BuildingCultureLand portfolio thesis (village revitalisation, materials, sprawl). */
export const ST_IMMO_LAND_PHILOSOPHY: string[] = [
  "We care about preserving spaces that represent our future.",
  "As active players in housing and urban development, we revitalise old village centres to preserve the attractive architectural character of historic country houses and reinforce their relevance for modern life. The structural quality of old buildings is often more sustainable than that of many new builds.",
  "We revive traditional techniques before they are lost and use natural materials such as wood, brick, and plaster. That creates an elegant atmosphere indoors, while solid brickwork supports a healthy indoor climate.",
  "Our work brings new life not only to old houses and villages, but to nature as well. An attractive village helps people enjoy spending time there, turns connecting routes into lifelines, and curbs sprawl. Existing green space should not be sealed unnecessarily.",
  "Individualisation is often the start of future problems — building culture must be a shared concern. Professional revitalisation enables modern living in old walls for the long term. We seek intelligent solutions that reflect local conditions, enrich village life, and inspire architecturally. A home of one’s own need not remain a dream when old knowledge meets modern needs — opening new aesthetic territory.",
];

export type StImmoBuildingType =
  | "Residential"
  | "Mixed use"
  | "Landmark development"
  | "Adaptive reuse"
  | "Coastal reference programme";

export type StImmoBuilding = {
  slug: string;
  buildingTitle: string;
  location: string;
  buildingType: StImmoBuildingType;
  shortDescription: string;
  buildingStory: string;
  architecturalValue: string;
  investmentVision: string;
  /** Optional link to seeded demo property id when narratives align */
  demoPropertyId?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Reference metrics from emails — verify in issuer docs */
  referenceMetrics?: {
    rentalAreaM2?: number;
    terraceM2?: number;
    gardenM2?: number;
    parkingSpaces?: number;
    acquisitionEur?: number;
    grossRentEur?: number;
  };
};

export const ST_IMMO_BUILDINGS: StImmoBuilding[] = [
  {
    slug: "berggasse-35",
    buildingTitle: "Berggasse 35 — A Place to Call Home",
    location: "Vienna, Austria — Servitenviertel (central residential quarter)",
    buildingType: "Adaptive reuse",
    demoPropertyId: 1,
    shortDescription:
      "A Gründerzeit landmark carefully renewed for contemporary living, rooted in Franz von Neumann’s late-19th-century plans and today’s expectations for comfort, light, and urban quality.",
    buildingStory:
      "Designed around the 1898 Centrale II telephone exchange, the building carries a rare layer of infrastructural history expressed in masonry, proportion, and urban presence. More than a century later, the ensemble has been cautiously adapted rather than overwritten: structure and character remain legible while layouts, services, and comfort meet current standards. The result is a central Vienna address where heritage and habitability read as one narrative — domestic calm within a dense, high-amenity district.",
    architecturalValue:
      "Exemplifies ideal reuse: from communications infrastructure to refined housing, with Gründerzeit scale and detail preserved as civic texture in a quarter that defines Vienna’s residential culture.",
    investmentVision:
      "Strong location scarcity (Servitenviertel), institutional-grade reuse logic versus scrap-and-rebuild, and income orientation support a long-hold profile suitable for transparent, community-aligned capital structures — including tokenized economic exposure where disclosure and compliance allow.",
    referenceMetrics: {
      rentalAreaM2: 730,
      terraceM2: 340,
      parkingSpaces: 4,
      acquisitionEur: 15_917_000,
      grossRentEur: 250_000,
    },
  },
  {
    slug: "jagdschlossgasse-81",
    buildingTitle: "Jagdschlossgasse 81",
    location: "Vienna, Austria — opposite the historic Werkbundsiedlung; near the Lainzer Tiergarten recreational area",
    buildingType: "Residential",
    demoPropertyId: 2,
    shortDescription:
      "A contemporary rental building in dialogue with modernist heritage: cubic forms, generous glazing, and openness to greenery on all sides.",
    buildingStory:
      "Sited opposite the Werkbundsiedlung, the architecture advances clarity of plan, material honesty, and daylight rather than pastiche. Cubist massing and large glazed surfaces organize views toward greenery, turning the block outward to gardens and sky. Nine rental apartments are conceived as precision housing: efficient cores, calm interiors, and civic modesty at a sensitive urban edge.",
    architecturalValue:
      "Positions new construction as continuity with modernist values — light, proportion, landscape relationship — beside a canonical housing context.",
    investmentVision:
      "Combines Vienna residential depth with design differentiation and stable rental product for long maintenance cycles and premium rent resilience under clear issuer economics.",
    referenceMetrics: {
      rentalAreaM2: 553,
      terraceM2: 106,
      gardenM2: 429,
      parkingSpaces: 6,
      acquisitionEur: 8_300_000,
      grossRentEur: 187_000,
    },
  },
  {
    slug: "water-side-keutschach",
    buildingTitle: "Water Side — Keutschach am See",
    location: "Keutschach am See, Carinthia, Austria — lakeside; views to Lake Keutschach and the Sattnitz range",
    buildingType: "Residential",
    shortDescription:
      "Six houses and thirty-four apartments where timber façades and full-height glazing set the architecture lightly into the landscape and orient daily life to water and mountains.",
    buildingStory:
      "Water Side gathers apartments into a single landscape idea: horizontality, warmth of wood, and glass that dissolves the boundary between interior and panorama. Large window walls open living space to the lake and Sattnitz backdrop. Private lake access with jetty and bathhouse deepens the proposition from view to embodied lakeside living.",
    architecturalValue:
      "Regional modernism at landscape scale — environmental integration, material tactility, and a cultural reading of Alpine–lake living.",
    investmentVision:
      "Blends hospitality-grade amenity with residential durability: long-term leisure and primary or secondary demand in a finite natural setting, with conservative yield underwriting on chain.",
    referenceMetrics: {
      rentalAreaM2: 802,
      terraceM2: 230,
      gardenM2: 429,
      parkingSpaces: 16,
      acquisitionEur: 10_500_000,
      grossRentEur: 250_000,
    },
  },
  {
    slug: "landmark-bernhardsthal",
    buildingTitle: "LandMark — Bernhardsthal",
    location: "Bernhardsthal, Weinviertel, Lower Austria — village centre (former warehouse / granary area)",
    buildingType: "Mixed use",
    demoPropertyId: 5,
    shortDescription:
      "A rural–urban landmark converting agricultural storage into contemporary housing and a reactivated village heart — compacting the settlement inward rather than expanding its edge.",
    buildingStory:
      "The scheme reuses the open structural logic of a former warehouse: generous daylight, honest materials, and a silhouette legible in the village grain. A residential tower delivers loft-like units with substantial terraces; four terraced houses extend the programme with green roofscapes; the ground floor is conceived as commerce, shared space, and cultural use. Partners have discussed optional ground-floor activation for education, showcases, and curated community events — subject to zoning, operator agreements, and compliance. Geothermal conditioning, photovoltaics, terraces for all apartments, and restraint on sealing anchor the sustainability story; grain-storage conversion to housing is framed as circular reuse.",
    architecturalValue:
      "Turns industrial agricultural heritage into civic architecture — a landmark that strengthens the village centre and models compact growth versus peripheral sprawl.",
    investmentVision:
      "Diversified income potential (residential plus commercial and cultural ground plane), strong reuse and energy narrative for ESG-sensitive capital, and a programmable village hub where legal structure and operator economics are clearly disclosed.",
    referenceMetrics: {
      rentalAreaM2: 2371,
      terraceM2: 1020,
      gardenM2: 656,
      parkingSpaces: 23,
      acquisitionEur: 10_900_000,
      grossRentEur: 350_000,
    },
  },
  {
    slug: "department-store-bernhardsthal",
    buildingTitle: "Historic department store — Bernhardsthal",
    location: "Bernhardsthal, Weinviertel, Lower Austria — village centre",
    buildingType: "Adaptive reuse",
    demoPropertyId: 7,
    shortDescription:
      "A compact heritage retail building reborn as a curated micro-quarter: dwelling, hospitality, and townhouse living woven through one renovated substance.",
    buildingStory:
      "The project treats the old department store as urban fabric to preserve, not a tabula rasa. Renovation respects masonry and village scale while inserting contemporary programmes — an apartment, a café, and a modern townhouse — that re-animate street life. Air-source heat pump, solar, cooling yards, terraces, and restraint on sealing reinforce a light environmental footprint appropriate to historic cores.",
    architecturalValue:
      "High-street revitalisation at village scale — mixed programmes without sprawl.",
    investmentVision:
      "Suited to place-led investors: diversified micro-income streams, manageable capex envelope, and a heritage narrative compatible with fractional models under tight issuer disclosure.",
    referenceMetrics: {
      rentalAreaM2: 400,
      terraceM2: 100,
      gardenM2: 200,
      acquisitionEur: 850_000,
      grossRentEur: 50_000,
    },
  },
  {
    slug: "altes-presshaus-katzelsdorf",
    buildingTitle: "Altes Presshaus — Katzelsdorf",
    location: "Katzelsdorf, Weinviertel, Lower Austria",
    buildingType: "Adaptive reuse",
    demoPropertyId: 6,
    shortDescription:
      "A press house transformed into loft-like living where historic masonry and visible half-timber in the roof truss become the design programme.",
    buildingStory:
      "Careful renovation weaves old structure into new rooms so that texture and tectonics read as luxury rather than decoration. The loft-like plan and open truss expose material honesty rare in speculative housing, while air-source heat pump, solar, generous yards, terraces, and no unnecessary sealing align operation with a rural context.",
    architecturalValue:
      "Tectonic authenticity — half-timber and brick as spatial generators, not stylistic overlays.",
    investmentVision:
      "Design-led rental or owner-occupier asset with strong architecture-forward marketing and community-oriented fractional pools that prize narrative and low-intervention land use.",
    referenceMetrics: {
      rentalAreaM2: 300,
      terraceM2: 100,
      gardenM2: 800,
      acquisitionEur: 950_000,
      grossRentEur: 70_000,
    },
  },
  {
    slug: "alter-stadl-katzelsdorf",
    buildingTitle: "Alter Stadl — Katzelsdorf",
    location: "Katzelsdorf, Weinviertel, Lower Austria",
    buildingType: "Adaptive reuse",
    shortDescription:
      "Historic agricultural masonry carefully renewed, with old structure integrated as a defining design feature — calm rural living with generous outdoor room.",
    buildingStory:
      "The Alter Stadl follows a consistent cultural method: retain, reveal, refine. Masonry rhythms and adaptive section create contemporary comfort without erasing agricultural memory. Air-source heat pump, large cooling yards, terraces, and protection of open land reinforce sustainability as daily practice.",
    architecturalValue:
      "Agrarian typology converted to dignified housing — a repeatable Weinviertel pattern for village vitality.",
    investmentVision:
      "Compact ticket, clear reuse thesis, and regional portfolio synergy with other village assets — useful for basket-style community vehicles with transparent per-asset reporting.",
    referenceMetrics: {
      rentalAreaM2: 220,
      terraceM2: 100,
      gardenM2: 1000,
      acquisitionEur: 650_000,
      grossRentEur: 50_000,
    },
  },
  {
    slug: "whalewatching-reference",
    buildingTitle: "Whalewatching lodge",
    location: "Canada — coastal reference programme (verify province and parcel before issuance)",
    buildingType: "Coastal reference programme",
    demoPropertyId: 3,
    shortDescription:
      "A fully renovated coastal cottage where preservation of original structure and sea-ward orientation governed every design decision.",
    buildingStory:
      "Extension and renovation prioritise the existing volume and its relationship to horizon and light — a discipline transferable to sensitive adaptive reuse in other contexts. Large green yards, terraces, and restraint on sealing echo the sustainability themes of the land portfolio.",
    architecturalValue:
      "Orientation and place as primary design drivers — a teaching project for reuse that respects landscape first.",
    investmentVision:
      "Best positioned as a case study or sister narrative to Weinviertel reuse until geocoded, legally verified, and wrapped for offering.",
    referenceMetrics: {
      rentalAreaM2: 440,
      terraceM2: 100,
      gardenM2: 800,
      acquisitionEur: 2_900_000,
      grossRentEur: 100_000,
    },
  },
];

const byDemo = new Map<number, StImmoBuilding>();
for (const b of ST_IMMO_BUILDINGS) {
  if (b.demoPropertyId != null) {
    byDemo.set(b.demoPropertyId, b);
  }
}

/** Editorial overlay from ST-IMMO for a seeded demo property id, if defined. */
export function getStImmoBuildingForDemoPropertyId(id: number): StImmoBuilding | undefined {
  return byDemo.get(id);
}
