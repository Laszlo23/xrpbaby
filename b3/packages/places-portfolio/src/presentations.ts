import type { PortfolioPresentation, PropertyCatalog, PropertyCatalogEntry } from "./types.js";
import catalogJson from "./data/property-catalog.json";

export const FEATURED_PROPERTY_IDS = [1, 2, 4, 5] as const;

export const REFERENCE_YIELD_BAND = "7–10%";

export const PROPERTY_CATALOG = catalogJson as PropertyCatalog;

/** Minimal presentation layer — sourced from apps/places demo-properties (featured set). */
export const PORTFOLIO_PRESENTATIONS: Partial<Record<number, PortfolioPresentation>> = {
  1: {
    propertyId: 1,
    slug: "berggasse-35",
    symbol: "OG1",
    headline: "Building Culture City Berggasse",
    location: "Vienna · Servitenviertel",
    emotionalHero:
      "A 19th-century Viennese ensemble in the Servitenviertel — opening stewardship of heritage to a global community.",
    badge: "Flagship",
    badgeAccent: true,
    yieldLabel: REFERENCE_YIELD_BAND,
    yieldPercent: 7.5,
    annualRentEur: 250_000,
    acquisitionEur: 15_917_000,
    unitCountLabel: "3 apartments",
    propertyType: "Historic residential",
    heroImage: "/t1a1366-bergasse.jpg",
    imageGallery: [
      { src: "/t1a1366-bergasse.jpg", alt: "Berggasse 35 — street view" },
      { src: "/foto-annablau-dsc0788.jpg", alt: "Berggasse architecture" },
      { src: "/berg01.jpg", alt: "Berggasse context" },
    ],
    highlights: [
      "Servitenviertel Gründerzeit — heritage stewardship on Base",
      "Primary USDC round live — verify economics in issuer data room",
      "REOC v1 metadata + permissioned share token OG1",
    ],
    buildingStory:
      "Berggasse sits where Gründerzeit fabric meets everyday Vienna: courtyards, rooflines, and rental homes woven into the 9th district.",
    investorRightsBullets: [
      "Economic participation per issuer waterfall when distributions are declared.",
      "Transfers may be restricted — ComplianceRegistry gates on-chain.",
      "Secondary liquidity when permitted venues and pools exist.",
    ],
    exitOptionsBullets: [
      "Secondary trading when compliance and liquidity allow.",
      "Issuer-led refinance or portfolio sale — disclosure-specific timelines.",
    ],
    assetStructureBullets: [
      "Legal title in issuer SPVs off-chain; token is programmed economic exposure.",
      "Issuance follows offering documents and on-chain compliance rules.",
    ],
  },
  2: {
    propertyId: 2,
    slug: "jagdschlossgasse-81",
    symbol: "OG2",
    headline: "Building Culture City Jagdschlossgasse 81",
    location: "Vienna · opposite Werkbundsiedlung",
    emotionalHero:
      "Nine homes opposite the Werkbundsiedlung — new Viennese housing in conversation with modernist heritage.",
    badge: "Stable Income",
    yieldLabel: REFERENCE_YIELD_BAND,
    yieldPercent: 6.8,
    annualRentEur: 187_000,
    acquisitionEur: 8_300_000,
    unitCountLabel: "9 apartments",
    propertyType: "Multi-family residential",
    heroImage: "/partners/Jagdschlossgasse-Projekte-Intro.jpg",
    imageGallery: [
      { src: "/partners/Jagdschlossgasse-Projekte-Intro.jpg", alt: "Jagdschlossgasse project" },
      { src: "/partners/jagdschloss123.jpg", alt: "Jagdschlossgasse architecture" },
    ],
    highlights: [
      "Cubist forms, generous glazing, terraces for all units",
      "Heat pump + solar — operating cost discipline",
      "Partner reference €8.3M acquisition · €187k p.a. rent",
    ],
    buildingStory:
      "Sited opposite the Werkbundsiedlung, the architecture advances daylight, proportion, and landscape relationship.",
    investorRightsBullets: [
      "Cash-flow participation when declared by the issuer.",
      "Governance follows issuer articles and token-side hooks in documents.",
    ],
    exitOptionsBullets: [
      "Secondary when pools exist and rules allow.",
      "Potential asset sale or refinance — issuer-dependent.",
    ],
    assetStructureBullets: [
      "Title and debt live in issuer SPVs off-chain.",
      "Share token transfers may be restricted on-chain.",
    ],
  },
  4: {
    propertyId: 4,
    slug: "water-side-keutschach",
    symbol: "OG4",
    headline: "Water Side — Keutschach am See",
    location: "Keutschach am See, Carinthia",
    emotionalHero:
      "Timber façades and full-height glazing set the architecture lightly into the Carinthian lakeside landscape.",
    badge: "High Yield",
    badgeAccent: true,
    yieldLabel: REFERENCE_YIELD_BAND,
    yieldPercent: 8.4,
    annualRentEur: 250_000,
    acquisitionEur: 10_500_000,
    unitCountLabel: "34 apartments · 6 buildings",
    propertyType: "Lakeside residential",
    heroImage: "/partners/Keutschach-am-See-1b-1.jpg",
    imageGallery: [
      { src: "/partners/Keutschach-am-See-1b-1.jpg", alt: "Water Side lakeside" },
      { src: "/partners/keutschach-am-see.jpeg", alt: "Water Side architecture" },
    ],
    highlights: [
      "Private lake access with jetty and bathhouse",
      "Six buildings · thirty-four apartments",
      "Partner reference €10.5M acquisition · €250k p.a. rent",
    ],
    buildingStory:
      "Water Side gathers apartments into a single landscape idea: horizontality, warmth of wood, and glass that dissolves the boundary between interior and panorama.",
    investorRightsBullets: [
      "Economic participation per issuer waterfall when distributions are declared.",
      "Liquidity via permitted secondary venues — pool depth varies.",
    ],
    exitOptionsBullets: [
      "Secondary trading when pools exist and rules allow.",
      "No mandatory redemption — align horizon with offering documents.",
    ],
    assetStructureBullets: [
      "SPV holds title; tokens represent economic interests.",
      "Rent and capex flow through issuer-controlled accounts.",
    ],
  },
  5: {
    propertyId: 5,
    slug: "landmark-bernhardsthal",
    symbol: "OG5",
    headline: "BuildingCultureLand – LandMark",
    location: "Bernhardsthal · Weinviertel",
    emotionalHero:
      "A granary converted into a village landmark — rural–modern living compacting inward with respect for the evolved landscape.",
    badge: "Adaptive Reuse",
    yieldLabel: REFERENCE_YIELD_BAND,
    yieldPercent: 7.2,
    annualRentEur: 350_000,
    acquisitionEur: 10_900_000,
    unitCountLabel: "31 units",
    propertyType: "Mixed-use",
    heroImage: "/land0.jpg",
    imageGallery: [
      { src: "/land0.jpg", alt: "LandMark aerial context" },
      { src: "/land01.jpg", alt: "LandMark masterplan" },
      { src: "/cam02-2.jpg", alt: "LandMark visualization" },
    ],
    highlights: [
      "Grain-storage conversion · geothermal + PV",
      "24 apartments · 4 terraced houses · 3 commercial units",
      "Partner reference €10.9M acquisition · €350k p.a. rent",
    ],
    buildingStory:
      "LandMark converts a granary into modern living with historic agricultural charm — open warehouse structures reused with generous glass and natural materials.",
    investorRightsBullets: [
      "Tokenized fractional ownership with issuer-managed SPV.",
      "Revenue split by lease type per disclosure.",
    ],
    exitOptionsBullets: [
      "Secondary when compliance and liquidity allow.",
      "Complex operations — confirm operator plans in diligence.",
    ],
    assetStructureBullets: [
      "Mixed-use programme with ground-floor activation potential.",
      "Issuer SPV structure — verify offering documents.",
    ],
  },
};

export function getCatalogEntry(propertyId: number): PropertyCatalogEntry | undefined {
  return PROPERTY_CATALOG.properties.find((p) => p.propertyId === propertyId);
}

export function formatEurCompact(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1e6).toFixed(1)}M`;
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatMonthlyRent(annualEur: number): string {
  const monthly = Math.round(annualEur / 12);
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(monthly);
}

export function resolveMediaUrl(placesSiteOrigin: string, path: string): string {
  const base = placesSiteOrigin.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function buildPortfolioPresentation(propertyId: number): PortfolioPresentation | null {
  const preset = PORTFOLIO_PRESENTATIONS[propertyId];
  const catalog = getCatalogEntry(propertyId);
  if (!preset && !catalog) return null;
  if (preset) return preset;
  if (!catalog) return null;
  return {
    propertyId: catalog.propertyId,
    slug: catalog.slug,
    symbol: catalog.symbol,
    headline: catalog.name,
    location: catalog.jurisdiction,
    badge: catalog.symbol,
    yieldLabel: REFERENCE_YIELD_BAND,
    yieldPercent: 7,
    annualRentEur: 0,
    acquisitionEur: catalog.acquisitionEur,
    unitCountLabel: "—",
    propertyType: "Registered property",
    heroImage: catalog.heroImage,
    imageGallery: [{ src: catalog.heroImage, alt: catalog.name }],
    highlights: [`On-chain share token ${catalog.symbol}`, "Verify economics in issuer data room"],
  };
}

export function buildPortfolioMarqueeStats(): { value: string; label: string }[] {
  const featured = FEATURED_PROPERTY_IDS.map((id) => getCatalogEntry(id)).filter(Boolean);
  const totalEur = featured.reduce((sum, p) => sum + (p?.acquisitionEur ?? 0), 0);
  return [
    { value: String(featured.length), label: "Featured assets" },
    { value: formatEurCompact(totalEur), label: "Reference portfolio" },
    { value: "8453", label: "Base mainnet" },
    { value: "REOC v1", label: "Token metadata" },
    { value: "ACE", label: "Chainlink profile D" },
  ];
}

export const ATLAS_MARKERS = [
  { propertyId: 1, label: "Vienna Berggasse", top: "42%", left: "54%" },
  { propertyId: 2, label: "Vienna Hietzing", top: "44%", left: "52%" },
  { propertyId: 4, label: "Keutschach", top: "48%", left: "56%" },
  { propertyId: 5, label: "Bernhardsthal", top: "40%", left: "58%" },
] as const;
