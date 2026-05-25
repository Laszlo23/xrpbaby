/**
 * Approximate map centres for demo property listings (illustrative — verify for production).
 * Used for OpenStreetMap embeds; not survey-grade coordinates.
 */
export type PropertyGeo = {
  lat: number;
  lng: number;
  /** Default zoom level for bbox math (OSM embed) */
  zoom?: number;
};

export const PROPERTY_GEO_BY_ID: Partial<Record<number, PropertyGeo>> = {
  1: { lat: 48.2186, lng: 16.3608, zoom: 16 },
  2: { lat: 48.175, lng: 16.285, zoom: 15 },
  /** Whalewatching demo — illustrative Canada coastal pin (not Keutschach / Water Side). */
  3: { lat: 48.4284, lng: -123.3656, zoom: 12 },
  /** Same asset narrative as id 2 (Jagdschlossgasse 81); duplicate demo token slot. */
  4: { lat: 48.175, lng: 16.285, zoom: 15 },
  5: { lat: 48.499, lng: 16.816, zoom: 15 },
  6: { lat: 48.467, lng: 16.283, zoom: 15 },
  7: { lat: 48.499, lng: 16.816, zoom: 15 },
};

const MAX_GALLERY_FRAMES = 10;

/** Default photo cap for listing cards and carousels (photo-first; no plan/PDF art). */
export const IMMERSIVE_PROJECT_FRAMES = 3;

/** Distinct images for `/experience` per property: place, how, facts, partners (no repeated `src`). */
export const IMMERSIVE_STORY_FRAME_COUNT = 4;

/** @internal exported for tests */
export function bboxFromCenter(geo: PropertyGeo): { minLon: number; minLat: number; maxLon: number; maxLat: number } {
  const z = geo.zoom ?? 15;
  const span = 0.045 / (z / 14);
  const lat = geo.lat;
  const lng = geo.lng;
  const latPad = span * 0.55;
  const lonPad = span * 0.7;
  return {
    minLon: lng - lonPad,
    minLat: lat - latPad,
    maxLon: lng + lonPad,
    maxLat: lat + latPad,
  };
}

/** OpenStreetMap embed URL (no API key). */
export function getOsmEmbedUrl(geo: PropertyGeo): string {
  const { minLon, minLat, maxLon, maxLat } = bboxFromCenter(geo);
  const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${geo.lat}%2C${geo.lng}`;
}

export function getOsmExternalUrl(geo: PropertyGeo): string {
  const z = Math.min(19, Math.max(3, Math.round(geo.zoom ?? 15)));
  return `https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lng}#map=${z}/${geo.lat}/${geo.lng}`;
}

export function getPropertyGeoById(propertyId: number): PropertyGeo | undefined {
  return PROPERTY_GEO_BY_ID[propertyId];
}

export { MAX_GALLERY_FRAMES };
