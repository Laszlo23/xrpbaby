import { base } from "thirdweb/chains";

/**
 * Chains indexed by thirdweb Insight for wallet portfolio (tokens + NFTs).
 * Extend here when Insight adds coverage for more networks you care about.
 */
export const INSIGHT_PORTFOLIO_CHAINS = [base] as const;
