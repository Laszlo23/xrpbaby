import type { PublicDocumentId } from "@/lib/public-documents";
import type { PropertySlug } from "@/lib/property-assets";
import { PROPERTY_SLUGS, isPropertySlug } from "@/lib/property-assets";

export type PropertyImageSlide = { src: string; alt: string };

export type PropertyIconName = "Building2" | "Building" | "Anchor" | "Warehouse" | "Hammer" | "Store" | "Waves";

export type ProposalStatus = "open" | "passed" | "rejected";

export type PropertySampleProposal = {
  id: string;
  title: string;
  status: ProposalStatus;
  yesPct: number;
  quorumPct: number;
};

export type PropertyTimelineIconKey = "Coffee" | "Home" | "LampDesk" | "Moon" | "School" | "Users";

export type PropertyTimelineMilestone = {
  year: number;
  headline: string;
  sub: string;
  insight: string;
  icon: PropertyTimelineIconKey;
};

export type PropertyTimeline = { drift: PropertyTimelineMilestone[]; revive: PropertyTimelineMilestone[] };

export const DEFAULT_OWNERSHIP_BULLETS: readonly string[] = [
  "1 share = 1 vote on property decisions",
  "Pro-rata participation in net income (issuer waterfall)",
  "Token transfers gated by ComplianceRegistry — no permission, no transfer",
];

export const DEFAULT_LIQUIDITY = {
  enter: "Buy shares from the issuer (lock period 30 days).",
  hold: "Earn distributions when the issuer declares them.",
  exit: "Request buyback (7-day cooldown, up to 15% / cycle), or trade on the secondary venue.",
} as const;

/** Fallback timeline — mirrors global TwoFutures tone (left quiet → right regrowth). */
export const GENERIC_PROPERTY_TIMELINE: PropertyTimeline = {
  drift: [
    {
      year: 1,
      headline: "more empty homes",
      sub: "inventory piles quietly.",
      insight: "no anchor tenant — no reason to return daily.",
      icon: "Home",
    },
    {
      year: 3,
      headline: "fewer lights",
      sub: "less care · less presence.",
      insight: "light is a signal: when it goes, trust goes with it.",
      icon: "Moon",
    },
    {
      year: 5,
      headline: "café · shop gone",
      sub: "amenities die first.",
      insight: "last places to meet disappear — the square goes quiet.",
      icon: "Coffee",
    },
    {
      year: 10,
      headline: "school gone · families gone",
      sub: "collapse accelerates.",
      insight: "without kids, the village clock stops.",
      icon: "School",
    },
  ],
  revive: [
    {
      year: 1,
      headline: "coworking opens",
      sub: "first desks · first signal.",
      insight: "remote workers bring weekday rhythm + spend.",
      icon: "LampDesk",
    },
    {
      year: 3,
      headline: "café · circulation",
      sub: "money stays local.",
      insight: "every coffee is a vote for the street.",
      icon: "Coffee",
    },
    {
      year: 5,
      headline: "homes renovated",
      sub: "proof spreads.",
      insight: "one fixed façade invites the next.",
      icon: "Home",
    },
    {
      year: 10,
      headline: "families return",
      sub: "one hub rewires place.",
      insight: "schools need peers — the hub brings them back.",
      icon: "Users",
    },
  ],
};

export const LANDMARK_PROPERTY_TIMELINE: PropertyTimeline = {
  drift: [
    {
      year: 1,
      headline: "tower waits",
      sub: "structure stands quiet.",
      insight: "capital on the sidelines — the quarter holds its breath.",
      icon: "Home",
    },
    {
      year: 3,
      headline: "ground floor dark",
      sub: "no daily reasons to gather.",
      insight: "without edges, the village centre forgets its pulse.",
      icon: "Moon",
    },
    {
      year: 5,
      headline: "grain silence",
      sub: "heritage without programme.",
      insight: "the building remembers work — it needs new work to wake.",
      icon: "Coffee",
    },
    {
      year: 10,
      headline: "edge sprawl wins",
      sub: "growth skips the core.",
      insight: "when the centre sleeps, the map stretches outward.",
      icon: "School",
    },
  ],
  revive: [
    {
      year: 1,
      headline: "tower opens",
      sub: "first lofts · first rhythm.",
      insight: "weekday presence returns to the village grain.",
      icon: "LampDesk",
    },
    {
      year: 3,
      headline: "café opens",
      sub: "street life returns.",
      insight: "small spend anchors the square.",
      icon: "Coffee",
    },
    {
      year: 5,
      headline: "co-living moves in",
      sub: "shared space hums.",
      insight: "density without sprawl — inward growth.",
      icon: "Users",
    },
    {
      year: 10,
      headline: "village school grows",
      sub: "families choose centre over edge.",
      insight: "the clock runs on kids again.",
      icon: "School",
    },
  ],
};

export type PropertyRecord = {
  slug: PropertySlug;
  headline: string;
  emotionalHero?: string;
  thesis: string;
  whyItMatters?: string;
  whyItMattersTitle?: string;
  location: string;
  unitCountLabel?: string;
  highlights: string[];
  greenPrint?: string[];
  imageSrc: string;
  imageAlt: string;
  imageGallery: PropertyImageSlide[];
  creditLines?: string[];
  squareMeters: number;
  units: number;
  annualRentalIncomeEur: number;
  illustrativePropertyValueUsd?: number;
  illustrativeShareUsd?: number;
  propertyType: string;
  discoveryCategory: string;
  documentIds: PublicDocumentId[];
  brokerOrDataRoomNotice?: string;
  riskNote?: string;
  archived?: boolean;
  iconName: PropertyIconName;
  driftImage: string;
  reviveImage: string;
  driftImageAlt?: string;
  reviveImageAlt?: string;
  pricing: { sharePriceEur: number; minTicketEur: number; coOwnersTarget: number };
  ownership: { bullets: string[] };
  sampleProposals: PropertySampleProposal[];
  liquidity: { enter: string; hold: string; exit: string };
  timeline?: PropertyTimeline;
};

const B = "/assets/properties/berggasse";
const J = "/assets/properties/jagdschlossgasse-81";
const W = "/assets/properties/whalewatching";
const L = "/assets/properties/landmark-bernhardsthal";
const P = "/assets/properties/altes-presshaus-katzelsdorf";
const O = "/assets/properties/former-dept-store-bernhardsthal";
const K = "/assets/properties/water-side-keutschach";

function coOwnersFromRef(valueUsd?: number, shareEur = 1000): number {
  const v = valueUsd ?? 0;
  if (v <= 0 || shareEur <= 0) return 0;
  return Math.max(50, Math.round(v / shareEur));
}

/** Copy + economics aligned with ogchain `demo-properties.ts` + ST-IMMO editorial (Water Side). */
export const PROPERTIES: Record<PropertySlug, PropertyRecord> = {
  berggasse: {
    slug: "berggasse",
    headline: "Building Culture City Berggasse",
    emotionalHero:
      "A 19th-century Viennese ensemble in the Servitenviertel — opening stewardship of heritage to a global community.",
    thesis:
      "This on-chain listing bundles Berggasse 35 with reference satellite holdings (see facility lines). Partner narrative — Berggasse 35: A Gründerzeit landmark carefully renewed for contemporary living, rooted in Franz von Neumann’s late-19th-century plans and today’s expectations for comfort, light, and urban quality. Designed around the 1898 Centrale II telephone exchange, the building carries a rare layer of infrastructural history expressed in masonry, proportion, and urban presence. More than a century later, the ensemble has been cautiously adapted rather than overwritten: structure and character remain legible while layouts, services, and comfort meet current standards. The result is a central Vienna address where heritage and habitability read as one narrative — domestic calm within a dense, high-amenity district.",
    whyItMattersTitle: "Why Berggasse matters",
    whyItMatters:
      "Located in Vienna's historic 9th district (Servitenviertel), Berggasse represents the typology of late 19th-century European residential architecture — Gründerzeit scale, courtyard life, and continuity with the city's urban fabric.\n\nThrough Building Culture, the property becomes a shared cultural asset: heritage preservation aligned with long-term community investment.\n\nInvestors participate in yield and in the stewardship of architectural culture — transparent rules, fractional access, and a narrative grounded in place.",
    unitCountLabel: "3 apartments",
    location: "Vienna · Multi-asset bundle (incl. one house abroad)",
    imageSrc: `${B}/berggasse-cover.jpg`,
    imageAlt: "Building Culture City Berggasse — façade and tower (photography)",
    driftImage: `${B}/berggasse-ext-01.jpg`,
    reviveImage: `${B}/berggasse-cover.jpg`,
    driftImageAlt: "Berggasse — street context (before stewardship scale)",
    reviveImageAlt: "Berggasse — façade and tower (with the community)",
    imageGallery: [
      { src: `${B}/berggasse-cover.jpg`, alt: "Berggasse 35 — façade and tower (photography)" },
      { src: `${B}/berggasse-ext-03.jpg`, alt: "Berggasse 35 — Servitenviertel (partner still)" },
      { src: `${B}/berggasse-ext-01.jpg`, alt: "Berggasse 35 — street view toward tower" },
      { src: `${B}/berggasse-ext-02.jpg`, alt: "Berggasse 35 — architecture and context (photography)" },
      ...Array.from({ length: 11 }, (_, i) => {
        const n = String(i + 1).padStart(2, "0");
        return { src: `${B}/berggasse-int-${n}.jpg`, alt: `Building Culture City Berggasse — interior ${i + 1}` };
      }),
    ],
    highlights: [
      "Apr 2026 fact sheet — Berggasse line: KP samt NK €15.917M · Miete €25k p.a. · 730 m² (verify data room).",
      "Servitenviertel Gründerzeit — satellite holdings and terraces under separate diligence.",
      "Discovery and token workflow on-platform — issuer terms govern any offering.",
    ],
    creditLines: ["Fact sheet (Apr 2026): €15.917M KP · €25k p.a. gross rent — Berggasse reference"],
    illustrativePropertyValueUsd: 15_917_000,
    illustrativeShareUsd: 1000,
    squareMeters: 730,
    units: 3,
    annualRentalIncomeEur: 25_000,
    propertyType: "Mixed residential",
    discoveryCategory: "Sustainable Housing",
    documentIds: ["berggasse-brochure-en"],
    riskNote: "Currency, rate, and occupancy risk — see Legal for risk factors.",
    iconName: "Building2",
    pricing: {
      sharePriceEur: 1000,
      minTicketEur: 1000,
      coOwnersTarget: coOwnersFromRef(15_917_000),
    },
    ownership: { bullets: [...DEFAULT_OWNERSHIP_BULLETS] },
    sampleProposals: [
      { id: "bg-1", title: "Courtyard lighting upgrade (LED + timers)", status: "passed", yesPct: 78, quorumPct: 51 },
      { id: "bg-2", title: "Heritage façade maintenance reserve", status: "open", yesPct: 44, quorumPct: 50 },
      { id: "bg-3", title: "Satellite holding disclosure appendix", status: "open", yesPct: 62, quorumPct: 55 },
    ],
    liquidity: { ...DEFAULT_LIQUIDITY },
  },

  "jagdschlossgasse-81": {
    slug: "jagdschlossgasse-81",
    headline: "Building Culture City Jagdschlossgasse 81",
    emotionalHero:
      "Nine homes opposite the Werkbundsiedlung — new Viennese housing in conversation with modernist heritage.",
    thesis:
      "A contemporary rental building in dialogue with modernist heritage: cubic forms, generous glazing, and openness to greenery on all sides. Sited opposite the Werkbundsiedlung, the architecture advances clarity of plan, material honesty, and daylight rather than pastiche. Cubist massing and large glazed surfaces organize views toward greenery, turning the block outward to gardens and sky. Nine rental apartments are conceived as precision housing: efficient cores, calm interiors, and civic modesty at a sensitive urban edge.",
    whyItMatters:
      "Sited opposite the Werkbundsiedlung, the architecture advances daylight, proportion, and landscape relationship — new construction in dialogue with modernist heritage.\n\nThe asset speaks to design differentiation and stable rental product beside a canonical housing context.",
    unitCountLabel: "9 apartments",
    location: "Vienna, Austria · opposite Werkbundsiedlung; near Lainzer Tiergarten",
    imageSrc: `${J}/jagdschlossgasse-81-cover.jpg`,
    imageAlt: "Jagdschlossgasse 81 — partner project imagery",
    driftImage: `${J}/jagdschlossgasse-81-cover.jpg`,
    reviveImage: `${J}/jagdschlossgasse-81-new-01.jpg`,
    driftImageAlt: "Jagdschlossgasse — project intro (today)",
    reviveImageAlt: "Jagdschlossgasse — visualization (with capital)",
    imageGallery: [
      { src: `${J}/jagdschlossgasse-81-cover.jpg`, alt: "Jagdschlossgasse — project (partner)" },
      { src: `${J}/jagdschlossgasse-81-new-03.jpg`, alt: "Jagdschlossgasse — architecture (partner)" },
      { src: `${J}/jagdschlossgasse-81-new-04.jpg`, alt: "Jagdschlossgasse — context (partner)" },
      { src: `${J}/jagdschlossgasse-81-new-05.jpg`, alt: "Jagdschlossgasse — building (partner)" },
      { src: `${J}/jagdschlossgasse-81-int-01.jpg`, alt: "Jagdschlossgasse 81 — interior reference" },
      { src: `${J}/jagdschlossgasse-81-new-01.jpg`, alt: "Jagdschlossgasse 81 — visualization variant" },
      { src: `${J}/jagdschlossgasse-81-int-02.jpg`, alt: "Jagdschlossgasse 81 — interior 2" },
      { src: `${J}/jagdschlossgasse-81-int-03.jpg`, alt: "Jagdschlossgasse 81 — interior 3" },
      { src: `${J}/jagdschlossgasse-81-new-02.jpg`, alt: "Jagdschlossgasse 81 — visualization 2" },
    ],
    highlights: [
      "9 rental apartments — cubist forms, generous glazing, greenery on all sides",
      "Air-source heat pump and solar; terraces for all apartments",
      "Reference (verify): ca. €8.3M acquisition; ca. €187k p.a. gross rent (partner brief)",
    ],
    creditLines: ["Partner reference (verify): ca. €8.3M acquisition · ca. €187k p.a. rent"],
    illustrativePropertyValueUsd: 8_300_000,
    illustrativeShareUsd: 1000,
    squareMeters: 553,
    units: 9,
    annualRentalIncomeEur: 187_000,
    propertyType: "Multi-family residential",
    discoveryCategory: "Sustainable Housing",
    documentIds: ["bau-land-kultur-20201113"],
    riskNote: "Liquidity and interest-rate risk — see Legal for risk factors.",
    iconName: "Building",
    pricing: { sharePriceEur: 1000, minTicketEur: 1000, coOwnersTarget: coOwnersFromRef(8_300_000) },
    ownership: { bullets: [...DEFAULT_OWNERSHIP_BULLETS] },
    sampleProposals: [
      { id: "jg-1", title: "Terrace planter programme (year 1)", status: "passed", yesPct: 81, quorumPct: 50 },
      { id: "jg-2", title: "Heat-pump maintenance escrow", status: "open", yesPct: 58, quorumPct: 52 },
      { id: "jg-3", title: "Bike storage expansion", status: "open", yesPct: 36, quorumPct: 50 },
    ],
    liquidity: { ...DEFAULT_LIQUIDITY },
  },

  whalewatching: {
    slug: "whalewatching",
    headline: "BuildingCultureLand – Whalewatching",
    emotionalHero: "Coastal lodge reference — renovation and extension with sea-ward orientation preserved.",
    thesis:
      "A fully renovated coastal cottage where preservation of original structure and sea-ward orientation governed every design decision. Extension and renovation prioritise the existing volume and its relationship to horizon and light — a discipline transferable to sensitive adaptive reuse in other contexts. Large green yards, terraces, and restraint on sealing echo the sustainability themes of the land portfolio.",
    whyItMatters:
      "BuildingCultureLand – Whalewatching groups reference coastal lodge assets in Canada (renovation and extension of the original cottage, structure and sea-ward orientation preserved). This is not the Carinthia Water Side / Keutschach programme, which remains a separate partner archive in the portfolio.\n\nIssuers should reconcile geography and disclosures before any offering.",
    unitCountLabel: "Reference lodge / hospitality programme",
    location: "Canada — coastal reference (verify province and parcel with issuer)",
    imageSrc: `${W}/whalewatching-cover.jpg`,
    imageAlt: "BuildingCultureWater – Whalewatching — coastal lodge (exterior reference)",
    driftImage: `${W}/whalewatching-ext-01.jpg`,
    reviveImage: `${W}/whalewatching-cover.jpg`,
    driftImageAlt: "Whalewatching — coastal context (reference)",
    reviveImageAlt: "Whalewatching — lodge exterior (reference)",
    imageGallery: [
      { src: `${W}/whalewatching-cover.jpg`, alt: "Whalewatching — coastal lodge exterior" },
      { src: `${W}/whalewatching-ext-02.jpg`, alt: "Whalewatching — lodge and landscape" },
      { src: `${W}/whalewatching-ext-04.jpg`, alt: "Whalewatching — waterfront context" },
      { src: `${W}/whalewatching-ext-01.jpg`, alt: "Whalewatching — reference 1" },
      { src: `${W}/whalewatching-ext-03.jpg`, alt: "Whalewatching — reference 3" },
      { src: `${W}/whalewatching-ext-05.jpg`, alt: "Whalewatching — reference 5" },
      { src: `${W}/whalewatching-int-01.jpeg`, alt: "Whalewatching — coastal reference" },
      { src: `${W}/whalewatching-int-03.jpeg`, alt: "Whalewatching — coastal reference interior" },
      { src: `${W}/whalewatching-int-02.jpeg`, alt: "Whalewatching — interior 2" },
    ],
    highlights: [
      "Canadian coastal reference programme — not Water Side Keutschach (Carinthia); see archived Water Side narrative separately.",
      "Fact sheet (reference): total rental area ca. 440 m² · terrace ca. 100 m² · garden ca. 800 m²",
      "Reference acquisition ca. €2.9M · gross rental income ca. €100k p.a. (partner figures — verify FX and entity)",
      "Teaser PDF (Biberstraße, Vienna) is third-party brokerage diligence — unrelated geography to the Canadian lodge narrative.",
    ],
    creditLines: ["Partner reference (verify): ca. €2.9M acquisition · ca. €100k p.a. gross rent"],
    illustrativePropertyValueUsd: 2_900_000,
    illustrativeShareUsd: 1000,
    squareMeters: 440,
    units: 1,
    annualRentalIncomeEur: 100_000,
    propertyType: "Canada coastal lodge (reference)",
    discoveryCategory: "Rural Revitalization",
    documentIds: ["teaser-biberstrasse-4-1010-wien"],
    greenPrint: [
      "Large green yards that help cool the microclimate",
      "Terraces",
      "No unnecessary sealing of valuable land",
    ],
    brokerOrDataRoomNotice:
      "Quoted third-party brokerage correspondence (orientation alongside the teaser PDF). Dates and procedures may change — confirm with the broker and counsel.\n\nLadies and Gentlemen,\n\nWe respectfully inform you that our company has been appointed by the owner as the exclusive agent for the sale of the following property:\n\n1010 Vienna, Biberstraße 4\n\nAfter submitting the confidentiality agreement (Appendix B) to o.friedrich@friedrich.at, you will be granted access to the data room without delay.\n\nA binding purchase offer (Appendix C), including a financing confirmation or proof of capital from an Austrian bank specifically for this property, must be sent by registered mail or email to the appointed real estate agent Otto Friedrich & Partner Immobilientreuhand GmbH, Krotenthallergasse 6, 1080 Vienna, no later than Thursday, May 7, 2026.\n\nFor a personal consultation and information, please contact Mr. Otto Friedrich by telephone at 0664/340 87 66 or by email at o.friedrich@friedrich.at.\n\nIn the event of a purchase, the broker's commission is 3% of the transaction value plus statutory VAT.\n\nThe seller will bear the costs of drawing up the purchase agreement, including its registration in the land register.\n\nMr. RA Dr. Georg Braunegg, Elisabethstraße 15, 1010 Vienna, has been commissioned with the preparation of the purchase agreement, the assumption of escrow and the implementation in the land register.\n\nThe general terms and conditions apply in accordance with the brokerage regulations also attached as an attachment (Appendix D).",
    riskNote:
      "Distinct narratives: Canada lodge vs Austria brokerage PDF (Biberstraße teaser). Not Keutschach — confirm geography and mapping in disclosures.",
    iconName: "Anchor",
    pricing: { sharePriceEur: 1000, minTicketEur: 1000, coOwnersTarget: coOwnersFromRef(2_900_000) },
    ownership: { bullets: [...DEFAULT_OWNERSHIP_BULLETS] },
    sampleProposals: [
      { id: "ww-1", title: "Terrace wind-screen (seasonal)", status: "passed", yesPct: 72, quorumPct: 50 },
      { id: "ww-2", title: "Septic / utility inspection cadence", status: "open", yesPct: 41, quorumPct: 55 },
      { id: "ww-3", title: "Guest parking strip (gravel)", status: "open", yesPct: 55, quorumPct: 50 },
    ],
    liquidity: { ...DEFAULT_LIQUIDITY },
  },

  "landmark-bernhardsthal": {
    slug: "landmark-bernhardsthal",
    headline: "BuildingCultureLand – LandMark",
    emotionalHero: "Weinviertel village landmark — granary to housing, geothermal rhythm, public ground floor.",
    thesis:
      "A rural–urban landmark converting agricultural storage into contemporary housing and a reactivated village heart — compacting the settlement inward rather than expanding its edge. The scheme reuses the open structural logic of a former warehouse: generous daylight, honest materials, and a silhouette legible in the village grain. A residential tower delivers loft-like units with substantial terraces; four terraced houses extend the programme with green roofscapes; the ground floor is conceived as commerce, shared space, and cultural use.",
    whyItMatters:
      "A modern village is growing from the former warehouse area in Bernhardsthal (Weinviertel, northeast of Vienna): a residential tower will house lofts with spacious terraces, and the lively ground floor zone will turn the formerly dormant site into a new village quarter.\n\nLandMark converts a granary into modern living with historic agricultural charm and original features. The high-rise and long building will be extended by four terraced houses with apartment roofs covered in greenery, while the ground floor zone will host commercial and common areas as well as cultural utilisation.\n\nLandMark is an icon of rural–modern living: open structures of the former warehouse are reused; generous glass surfaces and natural materials support a modern, cosy atmosphere. Unlike new settlements on the outskirts, new living space is created here in the village centre — compacting the settlement inward with respect for the evolved landscape.",
    unitCountLabel: "31 units",
    location: "Bernhardsthal · Weinviertel · Austria",
    imageSrc: `${L}/landmark-bernhardsthal-cover.jpg`,
    imageAlt: "BuildingCultureLand – LandMark — Bernhardsthal",
    driftImage: `${L}/landmark-bernhardsthal-old-01.jpg`,
    reviveImage: `${L}/landmark-bernhardsthal-new-01.jpg`,
    driftImageAlt: "LandMark — granary structure (before capital)",
    reviveImageAlt: "LandMark — visualization (with the community)",
    imageGallery: [
      { src: `${L}/landmark-bernhardsthal-cover.jpg`, alt: "LandMark — village quarter aerial context" },
      { src: `${L}/landmark-bernhardsthal-ext-01.jpg`, alt: "LandMark — masterplan and grain-storage conversion" },
      { src: `${L}/landmark-bernhardsthal-ext-02.jpg`, alt: "LandMark — tower and terraces (reference)" },
      { src: `${L}/landmark-bernhardsthal-new-01.jpg`, alt: "LandMark — architectural visualization" },
      { src: `${L}/landmark-bernhardsthal-new-02.jpg`, alt: "LandMark — massing and public realm" },
      { src: `${L}/landmark-bernhardsthal-ext-03.jpg`, alt: "LandMark — context 4" },
      { src: `${L}/landmark-bernhardsthal-ext-04.jpg`, alt: "LandMark — context 5" },
      { src: `${L}/landmark-bernhardsthal-new-03.jpg`, alt: "LandMark — CAM 05" },
      { src: `${L}/landmark-bernhardsthal-new-04.jpg`, alt: "LandMark — CAM 06" },
      { src: `${L}/landmark-bernhardsthal-new-05.jpg`, alt: "LandMark — visualization variant" },
      { src: `${L}/landmark-bernhardsthal-old-02.jpg`, alt: "LandMark — heritage structure 2" },
      { src: `${L}/landmark-bernhardsthal-old-03.jpg`, alt: "LandMark — heritage structure 3" },
    ],
    highlights: [
      "24 apartments · 4 terraced houses · 3 commercial / office units (partner brief)",
      "Geothermal heat/cooling; photovoltaics; grain-storage conversion to housing",
      "Optional ground-floor activation (education/community) — subject to zoning and operators",
      "Reference (verify): ca. €10.9M acquisition; ca. €350k p.a. gross rent (partner brief)",
    ],
    creditLines: ["Partner reference (verify): ca. €10.9M acquisition · ca. €350k p.a. rent"],
    illustrativePropertyValueUsd: 10_900_000,
    illustrativeShareUsd: 1000,
    squareMeters: 2371,
    units: 31,
    annualRentalIncomeEur: 350_000,
    propertyType: "Mixed-use",
    discoveryCategory: "Coworking Hubs",
    documentIds: ["land-mark-bernhardsthal-20210625", "bernhardsthal-plans"],
    greenPrint: [
      "Geothermal heat and cooling",
      "Photovoltaics",
      "Large green yards that help cool the microclimate",
      "Terraces for all apartments",
      "No unnecessary sealing of valuable land",
      "Conversion of grain storage into contemporary apartments — high-quality reuse",
    ],
    riskNote: "More complex operations — confirm operator plans in diligence.",
    iconName: "Warehouse",
    pricing: { sharePriceEur: 1000, minTicketEur: 1000, coOwnersTarget: coOwnersFromRef(10_900_000) },
    ownership: { bullets: [...DEFAULT_OWNERSHIP_BULLETS] },
    sampleProposals: [
      { id: "lm-1", title: "Ground-floor operator shortlist", status: "open", yesPct: 48, quorumPct: 55 },
      { id: "lm-2", title: "Geothermal O&M reserve (Y1)", status: "passed", yesPct: 84, quorumPct: 50 },
      { id: "lm-3", title: "Terrace shading pilot (south face)", status: "open", yesPct: 63, quorumPct: 50 },
    ],
    liquidity: { ...DEFAULT_LIQUIDITY },
    timeline: LANDMARK_PROPERTY_TIMELINE,
  },

  "altes-presshaus-katzelsdorf": {
    slug: "altes-presshaus-katzelsdorf",
    headline: "BuildingCultureLand – Altes Presshaus",
    emotionalHero: "Half-timber and masonry as programme — loft-like living in Katzelsdorf.",
    thesis:
      "A press house transformed into loft-like living where historic masonry and visible half-timber in the roof truss become the design programme. Careful renovation weaves old structure into new rooms so that texture and tectonics read as luxury rather than decoration. The loft-like plan and open truss expose material honesty rare in speculative housing, while air-source heat pump, solar, generous yards, terraces, and no unnecessary sealing align operation with a rural context.",
    whyItMatters:
      "Historic press-house fabric converted to loft-like living — visible half-timber and masonry as the design programme, not decoration.\n\nThis is place-led revitalisation: character stock with disciplined energy retrofit and community-oriented fractional pools.",
    unitCountLabel: "4 units",
    location: "Katzelsdorf · Weinviertel · Austria",
    imageSrc: `${P}/altes-presshaus-katzelsdorf-cover.jpg`,
    imageAlt: "BuildingCultureLand – Altes Presshaus — Katzelsdorf",
    driftImage: `${P}/altes-presshaus-katzelsdorf-int-02.jpg`,
    reviveImage: `${P}/altes-presshaus-katzelsdorf-cover.jpg`,
    driftImageAlt: "Altes Presshaus — interior truss (waiting for programme)",
    reviveImageAlt: "Altes Presshaus — façade (with the community)",
    imageGallery: [
      { src: `${P}/altes-presshaus-katzelsdorf-cover.jpg`, alt: "Altes Presshaus — façade and roofline (Katzelsdorf)" },
      { src: `${P}/altes-presshaus-katzelsdorf-int-01.jpg`, alt: "Altes Presshaus — building in context" },
      { src: `${P}/altes-presshaus-katzelsdorf-int-02.jpg`, alt: "Altes Presshaus — architecture detail" },
      { src: `${P}/altes-presshaus-katzelsdorf-int-03.jpg`, alt: "Altes Presshaus — 4" },
      { src: `${P}/altes-presshaus-katzelsdorf-int-04.jpg`, alt: "Altes Presshaus — 5" },
      { src: `${P}/altes-presshaus-katzelsdorf-int-05.jpg`, alt: "Altes Presshaus — interior 5" },
    ],
    highlights: [
      "Loft-like plan; visible half-timber in roof truss — tectonic authenticity",
      "Air-source heat pump and solar; terraces; no unnecessary sealing",
      "Reference (verify): ca. €950k acquisition; ca. €70k p.a. gross rent (partner brief)",
    ],
    creditLines: ["Partner reference (verify): ca. €950k acquisition · ca. €70k p.a. rent"],
    illustrativePropertyValueUsd: 950_000,
    illustrativeShareUsd: 1000,
    squareMeters: 300,
    units: 4,
    annualRentalIncomeEur: 70_000,
    propertyType: "Adaptive reuse residential",
    discoveryCategory: "Rural Revitalization",
    documentIds: ["katzelsdorf-studie-auswechslung", "katzelsdorf-studie-encoded"],
    greenPrint: [
      "Air-source heat pump and solar",
      "Large green yards that help cool the microclimate",
      "Terraces",
      "No unnecessary sealing of valuable land",
    ],
    riskNote: "Construction and lease-up risk — verify schedules and budgets.",
    iconName: "Hammer",
    pricing: { sharePriceEur: 1000, minTicketEur: 1000, coOwnersTarget: coOwnersFromRef(950_000) },
    ownership: { bullets: [...DEFAULT_OWNERSHIP_BULLETS] },
    sampleProposals: [
      { id: "ph-1", title: "Truss inspection + fire-retardant pass", status: "passed", yesPct: 91, quorumPct: 50 },
      { id: "ph-2", title: "Yard permeability (drainage)", status: "open", yesPct: 52, quorumPct: 50 },
      { id: "ph-3", title: "Solar string inverter replacement fund", status: "open", yesPct: 47, quorumPct: 55 },
    ],
    liquidity: { ...DEFAULT_LIQUIDITY },
  },

  "former-dept-store-bernhardsthal": {
    slug: "former-dept-store-bernhardsthal",
    headline: "BuildingCultureLand – Former department store",
    emotionalHero: "Village-centre mixed use — apartment, café, townhouse in one heritage fabric.",
    thesis:
      "A compact heritage retail building reborn as a curated micro-quarter: dwelling, hospitality, and townhouse living woven through one renovated substance. The project treats the old department store as urban fabric to preserve, not a tabula rasa. Renovation respects masonry and village scale while inserting contemporary programmes — an apartment, a café, and a modern townhouse — that re-animate street life.",
    whyItMatters:
      "A compact heritage retail building reborn as dwelling, hospitality, and townhouse living — high-street revitalisation without sprawl.\n\nInvestors participate in diversified micro-income streams and a heritage narrative compatible with transparent fractional models.",
    unitCountLabel: "3 units",
    location: "Bernhardsthal · Weinviertel · Austria · village centre",
    imageSrc: `${O}/former-dept-store-bernhardsthal-cover.jpg`,
    imageAlt: "BuildingCultureLand – Former department store — Bernhardsthal",
    driftImage: `${O}/former-dept-store-bernhardsthal-ext-02.jpg`,
    reviveImage: `${O}/former-dept-store-bernhardsthal-cover.jpg`,
    driftImageAlt: "Former department store — street context (before)",
    reviveImageAlt: "Former department store — façade (with the community)",
    imageGallery: [
      { src: `${O}/former-dept-store-bernhardsthal-cover.jpg`, alt: "Former department store — village-centre façade" },
      { src: `${O}/former-dept-store-bernhardsthal-ext-01.jpg`, alt: "Former department store — street context" },
      { src: `${O}/former-dept-store-bernhardsthal-ext-02.jpg`, alt: "Former department store — building massing" },
      { src: `${O}/former-dept-store-bernhardsthal-ext-03.jpg`, alt: "Former department store — 4" },
      { src: `${O}/former-dept-store-bernhardsthal-ext-04.jpg`, alt: "Former department store — 5" },
      { src: `${O}/former-dept-store-bernhardsthal-ext-05.jpg`, alt: "Former department store — 6" },
      { src: `${O}/former-dept-store-bernhardsthal-ext-06.jpg`, alt: "Former department store — 7" },
    ],
    highlights: [
      "Apartment, café, and modern townhouse — mixed programme in one historic retail fabric",
      "Air-source heat pump and solar; cooling yards; terraces",
      "Reference (verify): ca. €850k acquisition; ca. €50k p.a. gross rent (partner brief)",
    ],
    creditLines: ["Partner reference (verify): ca. €850k acquisition · ca. €50k p.a. rent"],
    illustrativePropertyValueUsd: 850_000,
    illustrativeShareUsd: 1000,
    squareMeters: 400,
    units: 3,
    annualRentalIncomeEur: 50_000,
    propertyType: "Mixed-use adaptive reuse",
    discoveryCategory: "Rural Revitalization",
    documentIds: ["altes-kaufhaus-prater", "bernhardsthal-plans"],
    greenPrint: [
      "Air-source heat pump and solar",
      "Green yards for cooling",
      "Terraces",
      "No unnecessary sealing of valuable land",
    ],
    riskNote: "Operational and renovation risk — see Legal for risk factors.",
    iconName: "Store",
    pricing: { sharePriceEur: 1000, minTicketEur: 1000, coOwnersTarget: coOwnersFromRef(850_000) },
    ownership: { bullets: [...DEFAULT_OWNERSHIP_BULLETS] },
    sampleProposals: [
      { id: "ds-1", title: "Café operator revenue share template", status: "open", yesPct: 39, quorumPct: 60 },
      { id: "ds-2", title: "Façade colour palette (heritage office)", status: "passed", yesPct: 76, quorumPct: 50 },
      { id: "ds-3", title: "Townhouse sound insulation spec", status: "open", yesPct: 67, quorumPct: 50 },
    ],
    liquidity: { ...DEFAULT_LIQUIDITY },
  },

  "water-side-keutschach": {
    slug: "water-side-keutschach",
    headline: "BuildingCultureWater — Water Side Keutschach am See",
    emotionalHero:
      "Six houses and thirty-four apartments where timber façades and full-height glazing set the architecture lightly into the landscape and orient daily life to water and mountains.",
    thesis:
      "Water Side gathers apartments into a single landscape idea: horizontality, warmth of wood, and glass that dissolves the boundary between interior and panorama. Large window walls open living space to the lake and Sattnitz backdrop. Private lake access with jetty and bathhouse deepens the proposition from view to embodied lakeside living.",
    whyItMatters:
      "Regional modernism at landscape scale — environmental integration, material tactility, and a cultural reading of Alpine–lake living.\n\nBlends hospitality-grade amenity with residential durability: long-term leisure and primary or secondary demand in a finite natural setting, with conservative yield underwriting on chain.",
    unitCountLabel: "34 apartments · 6 houses (reference programme)",
    location: "Keutschach am See, Carinthia, Austria — lakeside; views to Lake Keutschach and the Sattnitz range",
    imageSrc: `${K}/water-side-keutschach-cover.png`,
    imageAlt: "Water Side — Keutschach am See (reference render)",
    driftImage: `${K}/water-side-keutschach-ext-01.jpg`,
    reviveImage: `${K}/water-side-keutschach-new-01.png`,
    driftImageAlt: "Keutschach — lakeside context (before programme)",
    reviveImageAlt: "Water Side — summer massing (with the community)",
    imageGallery: [
      { src: `${K}/water-side-keutschach-cover.png`, alt: "Water Side — hero render" },
      { src: `${K}/water-side-keutschach-new-01.png`, alt: "Water Side — summer massing" },
      { src: `${K}/water-side-keutschach-new-02.png`, alt: "Water Side — winter context" },
      { src: `${K}/water-side-keutschach-new-03.png`, alt: "Water Side — roof detail" },
      { src: `${K}/water-side-keutschach-ext-01.jpg`, alt: "Keutschach am See — lakeside reference" },
      { src: `${K}/water-side-keutschach-stix-01.jpg`, alt: "STIX Wohnanlage Keutschacher See — reference" },
      { src: `${K}/water-side-keutschach-stix-02.jpg`, alt: "STIX Wohnanlage — context" },
      { src: `${K}/water-side-keutschach-ext-02.jpeg`, alt: "Keutschach — partner still" },
      { src: `${K}/water-side-keutschach-ext-03.jpeg`, alt: "Keutschach — partner still 2" },
      { src: `${K}/water-side-keutschach-stix-03.jpg`, alt: "STIX — reference 3" },
      { src: `${K}/water-side-keutschach-stix-04.jpg`, alt: "STIX — reference 4" },
      { src: `${K}/water-side-keutschach-stix-05.jpg`, alt: "STIX — reference 5" },
      { src: `${K}/water-side-keutschach-ext-04.jpeg`, alt: "Keutschach — partner still 3" },
    ],
    highlights: [
      "Archive / orientation page — confirm offering status and issuer mapping before any commitment.",
      "Reference metrics (partner brief): ca. 802 m² lettable · terrace ca. 230 m² · garden ca. 429 m² · 16 parking spaces",
      "Reference (verify): ca. €10.5M acquisition; ca. €250k p.a. gross rent",
    ],
    creditLines: ["Partner reference (verify): ca. €10.5M acquisition · ca. €250k p.a. gross rent"],
    illustrativePropertyValueUsd: 10_500_000,
    illustrativeShareUsd: 1000,
    squareMeters: 802,
    units: 34,
    annualRentalIncomeEur: 250_000,
    propertyType: "Lakeside residential (reference)",
    discoveryCategory: "Sustainable Housing",
    documentIds: ["water-side-keutschach-20220112", "stix-baukultur-en-20221110"],
    archived: true,
    riskNote: "Programme may differ from active on-chain listings — reconcile with issuer disclosures.",
    iconName: "Waves",
    pricing: { sharePriceEur: 1000, minTicketEur: 1000, coOwnersTarget: coOwnersFromRef(10_500_000) },
    ownership: { bullets: [...DEFAULT_OWNERSHIP_BULLETS] },
    sampleProposals: [
      { id: "ws-1", title: "Jetty maintenance schedule", status: "passed", yesPct: 88, quorumPct: 50 },
      { id: "ws-2", title: "Timber façade inspection (5y)", status: "open", yesPct: 54, quorumPct: 55 },
      { id: "ws-3", title: "Bathhouse winterisation", status: "open", yesPct: 49, quorumPct: 50 },
    ],
    liquidity: { ...DEFAULT_LIQUIDITY },
  },
};

export function getPropertyBySlug(slug: string): PropertyRecord | undefined {
  if (!isPropertySlug(slug)) return undefined;
  return PROPERTIES[slug];
}

export function getAllPropertySlugs(): readonly PropertySlug[] {
  return PROPERTY_SLUGS;
}

export function getSiblingSlugs(current: PropertySlug): PropertySlug[] {
  return PROPERTY_SLUGS.filter((s) => s !== current);
}
