/**
 * Product pillars for immersive and discovery — Building Culture City, Land, and Water.
 */
import { REFERENCE_YIELD_BAND_LABEL } from "@/lib/demo-properties";
export type BuildingCulturePillar = "city" | "land" | "water";

const CITY_IDS = new Set<number>([1, 2]);
const WATER_IDS = new Set<number>([3]);

export function getBuildingCulturePillar(propertyId: number): BuildingCulturePillar {
  if (CITY_IDS.has(propertyId)) return "city";
  if (WATER_IDS.has(propertyId)) return "water";
  return "land";
}

export function getBuildingCulturePillarLabel(pillar: BuildingCulturePillar): string {
  switch (pillar) {
    case "city":
      return "Building Culture City";
    case "land":
      return "Building Culture Land";
    case "water":
      return "Building Culture Water";
    default: {
      const _exhaustive: never = pillar;
      return _exhaustive;
    }
  }
}

/** Short tagline for chrome (intro header, etc.). */
export const BUILDING_CULTURE_PILLARS_TAGLINE = `City · Land · Water — ${REFERENCE_YIELD_BAND_LABEL} planning band · curated listings & Legal`;
