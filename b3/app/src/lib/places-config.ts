/** Places RWA site + app integration URLs. */
export const PLACES_SITE_URL =
  import.meta.env.VITE_PLACES_SITE_URL?.trim() || "https://places.buildingcultureid.space";

export const PLACES_CHAIN_ID = 8453;

export const PROPERTY_REGISTRY = "0x5aca19274B17B97e38da9eA851d91F0CC59DafBf" as const;
export const PROPERTY_SHARE_FACTORY = "0x4CA708ca735bBA49D7B2383071EA7FA1B7BDC614" as const;

export function placesInvestUrl(propertyId: number): string {
  return `${PLACES_SITE_URL.replace(/\/$/, "")}/invest?property=${propertyId}`;
}

export function placesTradeUrl(propertyId: number): string {
  return `${PLACES_SITE_URL.replace(/\/$/, "")}/trade?property=${propertyId}`;
}

export function placesTransparencyUrl(): string {
  return `${PLACES_SITE_URL.replace(/\/$/, "")}/transparency`;
}

export function placesFullPortfolioUrl(): string {
  return `${PLACES_SITE_URL.replace(/\/$/, "")}/properties`;
}

export function appPropertyDetailPath(propertyId: number): string {
  return `/places/properties/${propertyId}`;
}

export function appReocPath(propertyId: number): string {
  return `/places/api/reoc/${propertyId}`;
}
