import catalogJson from "../../../data/property-catalog.json";

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

/** Whole-token supply cap: (acquisitionEur × 110%) / €1000 per whole token, 18 decimals. */
export function supplyCapWei(acquisitionEur: number): bigint {
  const wholeTokens = Math.floor((acquisitionEur * 110) / 100 / 1000);
  return BigInt(wholeTokens) * 10n ** 18n;
}

export function getCatalogProperty(id: number): PropertyCatalogEntry | undefined {
  return PROPERTY_CATALOG.properties.find((p) => p.propertyId === id);
}

export function reocMetadataUrl(propertyId: number, origin?: string): string {
  const base = (origin ?? PROPERTY_CATALOG.siteOrigin).replace(/\/$/, "");
  return `${base}/places/api/reoc/${propertyId}`;
}

export function rwaShareIconUrl(origin?: string): string {
  const base = (origin ?? PROPERTY_CATALOG.siteOrigin).replace(/\/$/, "");
  return `${base}/places/meta/rwa-share-icon.svg`;
}
