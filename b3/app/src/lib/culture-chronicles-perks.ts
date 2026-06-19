import type { ChronicleTier } from "@/content/culture-chronicles";

/** Holder perks copy — review before public commitments. */
export const CHRONICLE_TIER_PERKS: Record<ChronicleTier, readonly string[]> = {
  common: ["+50 Culture Points (one-time per chapter)", "Forest quest unlock"],
  uncommon: ["+50 Culture Points", "Counts toward 3-chapter check-in boost"],
  rare: ["+50 Culture Points", "Early drop raffle bonus at 6+ chapters"],
  legendary: ["+50 Culture Points", "Required for Chronicle Founder set bonus"],
};

export const CHRONICLE_SET_PERKS = {
  anyChapter: "+50 Culture Points per chapter mint (SIWE claim)",
  threeChapters: "1.25× Forest daily check-in multiplier for 7 days",
  sixChapters: "+5 bonus entries on next home drop raffle window",
  fullSet: "+500 Culture Points, Chronicle Founder badge, 2× weekly BCC claim boost (4 weeks)",
} as const;

export const CHRONICLE_FOUNDER_THRESHOLD = 11;

export function chroniclePointsForEdition(_editionId: number): number {
  return 50;
}

export function chronicleFounderBonusPoints(): number {
  return 500;
}
