"use client";

import {
  FEATURED_PROPERTY_IDS,
  PortfolioDetailHero,
  buildPortfolioPresentation,
  getCatalogEntry,
  resolveMediaUrl,
  reocMetadataUrl,
} from "@bc/places-portfolio";

import { NextPortfolioLink } from "@/components/portfolio/NextPortfolioLink";
import {
  complianceInvestHint,
  useComplianceEligibility,
} from "@/lib/useComplianceEligibility";
import { getAppOrigin, getPlacesMediaOrigin } from "@/lib/places-origins";
import { useAccount } from "wagmi";

type Props = {
  propertyId: number;
};

export function PropertyEditorialHeroBand({ propertyId }: Props) {
  const { address } = useAccount();
  const eligibility = useComplianceEligibility();

  if (!FEATURED_PROPERTY_IDS.includes(propertyId as (typeof FEATURED_PROPERTY_IDS)[number])) {
    return null;
  }

  const presentation = buildPortfolioPresentation(propertyId);
  const catalog = getCatalogEntry(propertyId);
  if (!presentation || !catalog) return null;

  const mediaOrigin = getPlacesMediaOrigin();
  const appOrigin = getAppOrigin();
  const galleryUrls = presentation.imageGallery.map((g) => ({
    url: resolveMediaUrl(mediaOrigin, g.src),
    alt: g.alt,
  }));

  const canInvest = Boolean(eligibility?.canHoldRestrictedShares);
  const hint = complianceInvestHint(eligibility, Boolean(address));

  return (
    <div className="places-portfolio -mx-4 mb-8 overflow-hidden rounded-none border-y border-[hsl(0_0%_100%/0.1)] sm:mx-0 sm:rounded-2xl sm:border">
      <PortfolioDetailHero
        presentation={presentation}
        heroImageUrl={resolveMediaUrl(mediaOrigin, presentation.heroImage)}
        galleryUrls={galleryUrls}
        symbol={catalog.symbol}
        shareToken={catalog.shareToken ?? undefined}
        reocHref={reocMetadataUrl(appOrigin, propertyId)}
        investHref={`/invest?property=${propertyId}`}
        tradeHref={`/trade?property=${propertyId}`}
        canInvest={canInvest}
        complianceHint={hint}
        LinkComponent={NextPortfolioLink}
      />
    </div>
  );
}
