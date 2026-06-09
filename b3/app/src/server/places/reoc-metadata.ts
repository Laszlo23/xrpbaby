import catalogJson from "@/data/property-catalog.json";
import { getPublicAppOrigin, getServerPublicOrigin } from "@/lib/app-origin";

const EVERBUCKET = "https://buildingculture.4everbucket.com";

export type PropertyCatalogEntry = {
  propertyId: number;
  slug: string;
  externalRef: string;
  symbol: string;
  name: string;
  jurisdiction: string;
  acquisitionEur: number;
  shareToken: string | null;
  documentIds: string[];
  heroImage: string;
};

export type PropertyCatalog = {
  version: string;
  chainId: number;
  registry: string;
  shareFactory: string;
  siteOrigin: string;
  properties: PropertyCatalogEntry[];
};

export const PROPERTY_CATALOG = catalogJson as PropertyCatalog;

type DocKind = "DEED" | "DISCLOSURE" | "INSPECTION" | "OFFERING" | "APPRAISAL" | "OTHER";

type ReocDocument = {
  kind: DocKind;
  uri: string;
  label: string;
};

const PUBLIC_DOCUMENTS: Record<string, { title: string; filePath: string }> = {
  "berggasse-brochure-en": {
    title: "Berggasse 35 — brochure (EN)",
    filePath: `${EVERBUCKET}/Broschuere_BERGGASSE_35_EN.pdf`,
  },
  "bau-land-kultur-20201113": {
    title: "Bau — Land — Kultur (2020)",
    filePath: `${EVERBUCKET}/20201113-Bau-Land-Kultur.pdf`,
  },
  "teaser-biberstrasse-4-1010-wien": {
    title: "Teaser — Biberstraße 4, 1010 Vienna (broker)",
    filePath: `${EVERBUCKET}/Teaser_Biberstrasse_4_1010_Wien.pdf`,
  },
  "water-side-keutschach-20220112": {
    title: "Water Side — Keutschach am See (2022)",
    filePath: "/20220112_WATER-SIDE-Keutschach-am-See (1).pdf",
  },
  "land-mark-bernhardsthal-20210625": {
    title: "Land-Mark — Bernhardsthal (2021)",
    filePath: `${EVERBUCKET}/20210625_Land-Mark-Bernhardsthal.pdf`,
  },
  "bernhardsthal-plans": {
    title: "Plan set — Bernhardsthal (reference)",
    filePath: "/371-BERNHARDSTHAL-100-P-S-221114.pdf.pdf",
  },
  "katzelsdorf-studie-auswechslung": {
    title: "Studie Hausumbau Katzelsdorf — A3 Mappe (Auswechslung)",
    filePath: "/Studie Hausumbau Katzelsdorf_A3-Mappe_AUSWECHSLUNG.pdf",
  },
  "katzelsdorf-studie-encoded": {
    title: "Studie Hausumbau Katzelsdorf — A3 (alt. file)",
    filePath: "/Studie_20Hausumbau_20Katzelsdorf_A3-Mappe_AUSWECHSLUNG.pdf.pdf",
  },
  "altes-kaufhaus-prater": {
    title: "Altes Kaufhaus — Prater (A3 klein)",
    filePath: "/Altes_20Kaufhaus_Pra_CC_88s_20A3_20klein.pdf.pdf",
  },
};

function placesSiteOrigin(): string {
  return (
    process.env.VITE_PLACES_SITE_URL?.trim()?.replace(/\/$/, "") ||
    "https://places.buildingcultureid.space"
  );
}

function appOrigin(request?: Request): string {
  if (typeof window !== "undefined") return getPublicAppOrigin();
  const canonical = getServerPublicOrigin();
  if (process.env.NODE_ENV === "production") return canonical;
  if (request) {
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const forwardedHost =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host")?.split(",")[0]?.trim();
    if (forwardedProto && forwardedHost) {
      return `${forwardedProto}://${forwardedHost}`;
    }
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }
  return canonical;
}

function docKind(id: string): DocKind {
  if (id.includes("teaser") || id.includes("brochure") || id.includes("stix")) return "DISCLOSURE";
  if (id.includes("plan") || id.includes("studie") || id.includes("water-side")) return "APPRAISAL";
  return "OTHER";
}

function resolveDocumentUri(filePath: string, placesOrigin: string): string {
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
  const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${placesOrigin}${encodeURI(path)}`;
}

export function getCatalogProperty(id: number): PropertyCatalogEntry | undefined {
  return PROPERTY_CATALOG.properties.find((p) => p.propertyId === id);
}

export function rwaShareIconUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/places/meta/rwa-share-icon.svg`;
}

export type ReocMetadata = {
  reocVersion: "1.0.0";
  title: string;
  description: string;
  propertyId: string;
  registry: string;
  chainId: number;
  jurisdiction: string;
  token?: { address: string; symbol: string; decimals: number };
  documents: ReocDocument[];
  image: string;
  externalRefHint: string;
};

export function buildReocMetadata(propertyId: number, request?: Request): ReocMetadata | null {
  const entry = getCatalogProperty(propertyId);
  if (!entry) return null;

  let origin = appOrigin(request);
  if (origin.startsWith("http://") && process.env.NODE_ENV === "production") {
    origin = origin.replace(/^http:\/\//, "https://");
  }
  const placesOrigin = placesSiteOrigin();
  const hero = entry.heroImage.startsWith("http")
    ? entry.heroImage
    : `${placesOrigin}${entry.heroImage.startsWith("/") ? entry.heroImage : `/${entry.heroImage}`}`;

  const documents: ReocDocument[] = [];
  for (const docId of entry.documentIds) {
    const doc = PUBLIC_DOCUMENTS[docId];
    if (!doc) continue;
    documents.push({
      kind: docKind(docId),
      uri: resolveDocumentUri(doc.filePath, placesOrigin),
      label: doc.title,
    });
  }
  if (documents.length === 0) {
    documents.push({
      kind: "DISCLOSURE",
      uri: `${origin}/investors`,
      label: "Building Culture investor disclosures (reference)",
    });
  }

  documents.unshift({
    kind: "OTHER",
    uri: hero,
    label: `${entry.name} — hero imagery`,
  });

  const meta: ReocMetadata = {
    reocVersion: "1.0.0",
    title: entry.name,
    description:
      "REOC v1 reference metadata for a Building Culture property share token. Fractional economic exposure — not legal title.",
    propertyId: String(entry.propertyId),
    registry: PROPERTY_CATALOG.registry,
    chainId: PROPERTY_CATALOG.chainId,
    jurisdiction: entry.jurisdiction,
    documents,
    image: rwaShareIconUrl(origin),
    externalRefHint: entry.slug,
  };

  if (entry.shareToken) {
    meta.token = {
      address: entry.shareToken,
      symbol: entry.symbol,
      decimals: 18,
    };
  }

  return meta;
}
