export {
  FEATURED_PROPERTY_IDS,
  type FeaturedPropertyId,
} from "./featured.js";

export {
  REFERENCE_YIELD_BAND,
  PROPERTY_CATALOG,
  PORTFOLIO_PRESENTATIONS,
  ATLAS_MARKERS,
  getCatalogEntry,
  buildPortfolioPresentation,
  buildPortfolioMarqueeStats,
  formatEurCompact,
  formatMonthlyRent,
  resolveMediaUrl,
} from "./presentations.js";

export { buildPortfolioCard } from "./buildPortfolioCard.js";

export {
  CHAINLINK_MODULES,
  reocMetadataUrl,
  basescanAddress,
} from "./chainlink-modules.js";

export type {
  PropertyCatalog,
  PropertyCatalogEntry,
  PortfolioPresentation,
  PortfolioCardProps,
  PortfolioMarqueeStat,
  AtlasMarker,
  ChainlinkModule,
  PortfolioLinkProps,
  PortfolioGridProps,
  PortfolioHeroProps,
  PortfolioChainlinkStripProps,
  PortfolioDetailHeroProps,
} from "./types.js";

export { PortfolioHero } from "./components/PortfolioHero.js";
export { PortfolioMarquee } from "./components/PortfolioMarquee.js";
export { PortfolioGrid } from "./components/PortfolioGrid.js";
export { PortfolioAtlas } from "./components/PortfolioAtlas.js";
export { PortfolioChainlinkStrip } from "./components/PortfolioChainlinkStrip.js";
export { PortfolioDetailHero } from "./components/PortfolioDetailHero.js";
export { PortfolioImage } from "./components/PortfolioImage.js";
export { DefaultPortfolioLink, resolveLink } from "./components/link.js";
