"use client";

import { useMemo } from "react";
import {
  FEATURED_PROPERTY_IDS,
  buildPortfolioCard,
  getCatalogEntry,
} from "@bc/places-portfolio";

import { getPlacesMediaOrigin } from "@/lib/places-origins";
import { usePropertyShareList } from "@/lib/usePropertyShareList";

export function useFeaturedPortfolioCards(detailPathPrefix = "/marketplace") {
  const mediaOrigin = getPlacesMediaOrigin();
  const { chainRows } = usePropertyShareList();

  return useMemo(() => {
    return FEATURED_PROPERTY_IDS.map((propertyId) => {
      const row = chainRows.find((r) => r.id === BigInt(propertyId));
      const sharesLabel = row
        ? `${getCatalogEntry(propertyId)?.symbol ?? row.symbol} · on-chain`
        : `${getCatalogEntry(propertyId)?.symbol ?? "OG"} · on-chain`;

      return buildPortfolioCard({
        propertyId,
        placesSiteOrigin: mediaOrigin,
        detailHref: `${detailPathPrefix}/${propertyId}`,
        sharesLabel,
      });
    }).filter(Boolean) as NonNullable<ReturnType<typeof buildPortfolioCard>>[];
  }, [chainRows, mediaOrigin, detailPathPrefix]);
}
