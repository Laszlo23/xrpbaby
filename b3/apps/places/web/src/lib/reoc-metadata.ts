import {
  getCatalogProperty,
  PROPERTY_CATALOG,
  rwaShareIconUrl,
  type PropertyCatalogEntry,
} from "@/lib/property-catalog";
import {
  getPublicDocumentById,
  publicDocumentHref,
  type PublicDocumentId,
} from "@/lib/public-documents";
import { getSiteUrl } from "@/lib/site-url";

export type ReocMetadataDocument = {
  kind: "DEED" | "DISCLOSURE" | "INSPECTION" | "OFFERING" | "APPRAISAL" | "OTHER";
  uri?: string;
  storageRoot?: string;
  label?: string;
};

export type ReocMetadata = {
  reocVersion: "1.0.0";
  title: string;
  description?: string;
  propertyId: string;
  registry: string;
  chainId: number;
  jurisdiction: string;
  token?: {
    address: string;
    symbol: string;
    decimals: number;
  };
  documents: ReocMetadataDocument[];
  image: string;
  externalRefHint?: string;
};

function docKindForCatalogId(id: PublicDocumentId): ReocMetadataDocument["kind"] {
  if (id.includes("teaser") || id.includes("brochure") || id.includes("stix")) return "DISCLOSURE";
  if (id.includes("plan") || id.includes("studie") || id.includes("water-side")) return "APPRAISAL";
  return "OTHER";
}

function buildDocuments(entry: PropertyCatalogEntry, origin: string): ReocMetadataDocument[] {
  const docs: ReocMetadataDocument[] = [];
  for (const docId of entry.documentIds) {
    const doc = getPublicDocumentById(docId as PublicDocumentId);
    if (!doc) continue;
    const href = doc.filePath.startsWith("http")
      ? doc.filePath
      : `${origin}${publicDocumentHref(doc.filePath)}`;
    docs.push({
      kind: docKindForCatalogId(doc.id),
      uri: href,
      label: doc.title,
    });
  }
  if (docs.length === 0) {
    docs.push({
      kind: "DISCLOSURE",
      uri: `${origin}/places/investors`,
      label: "Building Culture investor disclosures (reference)",
    });
  }
  return docs;
}

export function buildReocMetadata(propertyId: number, opts?: { origin?: string }): ReocMetadata | null {
  const entry = getCatalogProperty(propertyId);
  if (!entry) return null;

  const origin = (opts?.origin ?? getSiteUrl()).replace(/\/$/, "");
  const hero = entry.heroImage.startsWith("http") ? entry.heroImage : `${origin}/places${entry.heroImage}`;

  const meta: ReocMetadata = {
    reocVersion: "1.0.0",
    title: entry.name,
    description:
      "REOC v1 reference metadata for a Building Culture property share token. Fractional economic exposure — not legal title.",
    propertyId: String(entry.propertyId),
    registry: PROPERTY_CATALOG.registry,
    chainId: PROPERTY_CATALOG.chainId,
    jurisdiction: entry.jurisdiction,
    documents: buildDocuments(entry, origin),
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

  meta.documents.unshift({
    kind: "OTHER",
    uri: hero,
    label: `${entry.name} — hero imagery`,
  });

  return meta;
}

export function allReocMetadata(origin?: string): ReocMetadata[] {
  return PROPERTY_CATALOG.properties
    .map((p) => buildReocMetadata(p.propertyId, { origin }))
    .filter((m): m is ReocMetadata => m != null);
}
