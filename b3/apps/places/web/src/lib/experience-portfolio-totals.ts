/**
 * Aggregates reference economics for demo properties included in `/experience`.
 * Field `illustrativePropertyValueUsd` is EUR-scale reference value per demo catalogue naming.
 */

import { BUILDING_CULTURE_CITY_PIPELINE } from "@/lib/culture-land-portfolio";
import { DEMO_PROPERTY_DETAILS } from "@/lib/demo-properties";

/** Demo ids excluded from the immersive carousel (same scope as experience slides). */
export const EXPERIENCE_EXCLUDED_DEMO_IDS = new Set<number>([4]);

/** Illustrative EUR→USD multiplier for teaser copy only — not a live FX rate. */
export const EUR_USD_TEASER = 1.09;

export type ExperiencePortfolioTotals = {
  propertyCount: number;
  sumReferenceValueEur: number;
  sumAnnualRentEur: number;
  sumReferenceValueUsdApprox: number;
  sumAnnualRentUsdApprox: number;
  /** Sum of `squareMeters` for on-chain demo catalogue rows in the carousel */
  catalogueLettableM2: number;
  /** Partner pipeline lettable area (where `metrics.lettableAreaM2` is set) */
  pipelineLettableM2: number;
  /** Indicative purchase sums from pipeline metrics — not on-chain TVL */
  pipelineIndicativePurchaseEur: number;
  /** Indicative gross rent p.a. sums from pipeline metrics */
  pipelineIndicativeRentEur: number;
  /** Catalogue + pipeline lettable — headline “reference scale” */
  combinedLettableM2: number;
};

/** Sorted demo ids included in `/experience`, matching [`getProjectExperienceSlides`](experience-slides.ts). */
export function getExperienceCarouselPropertyIds(): number[] {
  return Object.keys(DEMO_PROPERTY_DETAILS)
    .map(Number)
    .filter((id) => Number.isFinite(id) && !EXPERIENCE_EXCLUDED_DEMO_IDS.has(id))
    .sort((a, b) => a - b);
}

function aggregatePipelineMetrics(): {
  pipelineLettableM2: number;
  pipelineIndicativePurchaseEur: number;
  pipelineIndicativeRentEur: number;
} {
  let pipelineLettableM2 = 0;
  let pipelineIndicativePurchaseEur = 0;
  let pipelineIndicativeRentEur = 0;
  for (const p of BUILDING_CULTURE_CITY_PIPELINE) {
    const m = p.metrics;
    if (!m) continue;
    if (m.lettableAreaM2 != null && Number.isFinite(m.lettableAreaM2)) {
      pipelineLettableM2 += m.lettableAreaM2;
    }
    if (m.indicativePurchaseEur != null && Number.isFinite(m.indicativePurchaseEur)) {
      pipelineIndicativePurchaseEur += m.indicativePurchaseEur;
    }
    if (m.indicativeRentEur != null && Number.isFinite(m.indicativeRentEur)) {
      pipelineIndicativeRentEur += m.indicativeRentEur;
    }
  }
  return { pipelineLettableM2, pipelineIndicativePurchaseEur, pipelineIndicativeRentEur };
}

export function getExperiencePortfolioTotals(): ExperiencePortfolioTotals {
  const ids = getExperienceCarouselPropertyIds();
  let sumReferenceValueEur = 0;
  let sumAnnualRentEur = 0;
  let catalogueLettableM2 = 0;

  for (const id of ids) {
    const d = DEMO_PROPERTY_DETAILS[id];
    if (!d) continue;
    sumReferenceValueEur += d.illustrativePropertyValueUsd ?? 0;
    sumAnnualRentEur += d.annualRentalIncomeEur ?? 0;
    catalogueLettableM2 += d.squareMeters ?? 0;
  }

  const pipe = aggregatePipelineMetrics();
  const combinedLettableM2 = catalogueLettableM2 + pipe.pipelineLettableM2;

  return {
    propertyCount: ids.length,
    sumReferenceValueEur,
    sumAnnualRentEur,
    sumReferenceValueUsdApprox: sumReferenceValueEur * EUR_USD_TEASER,
    sumAnnualRentUsdApprox: sumAnnualRentEur * EUR_USD_TEASER,
    catalogueLettableM2,
    pipelineLettableM2: pipe.pipelineLettableM2,
    pipelineIndicativePurchaseEur: pipe.pipelineIndicativePurchaseEur,
    pipelineIndicativeRentEur: pipe.pipelineIndicativeRentEur,
    combinedLettableM2,
  };
}

/** Compact USD for hero lines, e.g. ~$45M, ~$1.2M */
export function formatUsdTeaserApprox(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) return "—";
  if (usd >= 1_000_000_000) return `~$${(usd / 1_000_000_000).toFixed(1)}B`;
  if (usd >= 1_000_000) return `~$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `~$${Math.round(usd / 1_000)}k`;
  return `~$${Math.round(usd).toLocaleString("en-US")}`;
}

/** EUR reference for subtitles / secondary line */
export function formatEurReferenceCompact(eur: number): string {
  if (!Number.isFinite(eur) || eur <= 0) return "—";
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(eur);
}

/** Compact m² for hero lines, e.g. 7.245 m² */
export function formatLettableM2Compact(m2: number): string {
  if (!Number.isFinite(m2) || m2 <= 0) return "—";
  return `${new Intl.NumberFormat("de-AT", { maximumFractionDigits: 0 }).format(Math.round(m2))} m²`;
}
