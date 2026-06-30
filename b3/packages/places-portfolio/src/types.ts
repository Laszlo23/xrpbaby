import type { CSSProperties, ComponentType, ReactNode } from "react";

export type PropertyCatalogEntry = {
  propertyId: number;
  slug: string;
  externalRef: string;
  symbol: string;
  name: string;
  jurisdiction: string;
  acquisitionEur: number;
  shareToken: string | null;
  documentIds: string[];
  heroImage: string;
};

export type PropertyCatalog = {
  version: string;
  chainId: number;
  registry: string;
  shareFactory: string;
  siteOrigin: string;
  properties: PropertyCatalogEntry[];
};

export type PortfolioPresentation = {
  propertyId: number;
  slug: string;
  symbol: string;
  headline: string;
  location: string;
  emotionalHero?: string;
  badge: string;
  badgeAccent?: boolean;
  yieldLabel: string;
  yieldPercent: number;
  annualRentEur: number;
  acquisitionEur: number;
  unitCountLabel: string;
  propertyType: string;
  heroImage: string;
  imageGallery: { src: string; alt: string }[];
  highlights: string[];
  buildingStory?: string;
  investorRightsBullets?: string[];
  exitOptionsBullets?: string[];
  assetStructureBullets?: string[];
};

export type PortfolioCardProps = PortfolioPresentation & {
  heroImageUrl: string;
  detailHref: string;
  monthlyRevenueLabel: string;
  sharesLabel: string;
  fundingPercent?: number;
};

export type PortfolioMarqueeStat = {
  value: string;
  label: string;
};

export type AtlasMarker = {
  propertyId: number;
  label: string;
  top: string;
  left: string;
};

export type ChainlinkModule = {
  id: string;
  label: string;
  address: string;
  explorerBase: string;
};

export type PortfolioLinkProps = {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export type PortfolioGridProps = {
  cards: PortfolioCardProps[];
  LinkComponent?: ComponentType<PortfolioLinkProps>;
  onViewAllHref?: string;
};

export type PortfolioHeroProps = {
  heroImageUrl: string;
  flagshipHref: string;
  LinkComponent?: ComponentType<PortfolioLinkProps>;
};

export type PortfolioChainlinkStripProps = {
  modules: ChainlinkModule[];
  complianceHeadline: string;
  complianceBody: string;
  disclaimers: readonly string[];
  transparencyHref?: string;
  matrixHref?: string;
  appPlacesHref?: string;
  LinkComponent?: ComponentType<PortfolioLinkProps>;
};

export type PortfolioDetailHeroProps = {
  presentation: PortfolioPresentation;
  heroImageUrl: string;
  galleryUrls: { url: string; alt: string }[];
  symbol: string;
  shareToken?: string;
  explorerBase?: string;
  reocHref: string;
  investHref: string;
  tradeHref: string;
  canInvest: boolean;
  complianceHint?: string;
  LinkComponent?: ComponentType<PortfolioLinkProps>;
};
