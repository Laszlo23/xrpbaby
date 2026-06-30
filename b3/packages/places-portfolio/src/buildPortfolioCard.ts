import type { PortfolioCardProps } from "./types.js";
import {
  buildPortfolioPresentation,
  formatMonthlyRent,
  resolveMediaUrl,
} from "./presentations.js";

export function buildPortfolioCard(input: {
  propertyId: number;
  placesSiteOrigin: string;
  detailHref: string;
  sharesLabel?: string;
  fundingPercent?: number;
}): PortfolioCardProps | null {
  const presentation = buildPortfolioPresentation(input.propertyId);
  if (!presentation) return null;

  return {
    ...presentation,
    heroImageUrl: resolveMediaUrl(input.placesSiteOrigin, presentation.heroImage),
    detailHref: input.detailHref,
    monthlyRevenueLabel:
      presentation.annualRentEur > 0
        ? formatMonthlyRent(presentation.annualRentEur)
        : "Verify in data room",
    sharesLabel: input.sharesLabel ?? `${presentation.symbol} · on-chain`,
    fundingPercent: input.fundingPercent,
  };
}
