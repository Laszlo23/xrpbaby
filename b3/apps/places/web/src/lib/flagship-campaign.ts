import { BERGGASSE_HERO_STILL } from "@/lib/bergasse-assets";
import { DEMO_PROPERTY_DETAILS } from "@/lib/demo-properties";

/** On-chain property id used for flagship imagery (Berggasse demo listing). */
export const FLAGSHIP_PROPERTY_ID = 1n;

export const flagshipCampaign = {
  displayName: "Building Culture City Berggasse — Vienna IX",
  projectType: "Historic residential · mixed portfolio (reference)",
  /** Reference campaign metrics — not on-chain TVL. */
  targetRaiseEur: 1_200_000,
  raisedEur: 420_000,
  investors: 178,
  minInvestmentUsd: 500,
} as const;

export function getFlagshipHeroImage(): { src: string; alt: string } {
  const demo = DEMO_PROPERTY_DETAILS[Number(FLAGSHIP_PROPERTY_ID)];
  const slide = demo?.imageGallery?.[0] ?? (demo ? { src: demo.imageSrc, alt: demo.imageAlt } : null);
  return (
    slide ?? {
      src: BERGGASSE_HERO_STILL,
      alt: "Building Culture City Berggasse — façade (Culture Land preview)",
    }
  );
}
