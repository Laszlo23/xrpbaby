/**
 * Auditable facts for the landing — swap illustrative stats when sources are confirmed.
 */
export type StatDefinition = {
  id: string;
  /** Short label shown in UI */
  headline: string;
  /** Optional micro-line under stat */
  sub?: string;
  /** If true, show “illustrative” disclaimer in hero footnotes */
  illustrative: boolean;
  sourceUrl?: string;
  sourceLabel?: string;
  year?: number;
};

/** Hero corners — left = system pain, right = counterweight / hope */
export const heroStats = {
  system: {
    id: "youth-rural-exodus-eu",
    headline: "+70%",
    sub: "EU rural youth drain vs ’90 — structural, not quiet.",
    illustrative: true,
    sourceLabel: "Eurostat / OECD rural demographic trends (verify for AT)",
    year: 2026,
  } satisfies StatDefinition,
  buildings: {
    id: "empty-buildings-at",
    headline: "10k+",
    sub: "Vacant village buildings compound.",
    illustrative: true,
    sourceLabel: "Replace with national vacancy estimate when sourced",
    year: 2026,
  } satisfies StatDefinition,
} as const;

export const movementStats = {
  builders: 1247,
  countries: 14,
  visitedBernhardsthal: "312",
} as const;
