/** 77-mint tier ladder: $0.07 → $7.77 USD (paid in native ETH/BNB on-chain). */

export const IDENTITY_MINT_TIER_SIZE = 77;
export const IDENTITY_MINT_BASE_USD = 0.07;
export const IDENTITY_MINT_STEP_USD = 0.49; // $0.07 × 7
export const IDENTITY_MINT_CAP_USD = 7.77;

/** Ladder range for marketing copy. */
export const IDENTITY_MINT_LADDER_RANGE_LABEL = `$${IDENTITY_MINT_BASE_USD}–$${IDENTITY_MINT_CAP_USD}`;

export type IdentityMintLadderSummary = {
  totalMinted: number;
  tierIndex: number;
  tierUsd: number;
  mintsLeftInTier: number;
  nextTierUsd: number | null;
  atCap: boolean;
  nextMintNumber: number;
};

/** Tier index for the *next* mint given current totalMinted (0-based). */
export function tierIndexForTotalMinted(totalMinted: number): number {
  const n = Math.max(0, Math.floor(totalMinted));
  return Math.floor(n / IDENTITY_MINT_TIER_SIZE);
}

export function usdPriceForTier(tierIndex: number): number {
  const tier = Math.max(0, Math.floor(tierIndex));
  const raw = IDENTITY_MINT_BASE_USD + tier * IDENTITY_MINT_STEP_USD;
  return Math.min(IDENTITY_MINT_CAP_USD, Math.round(raw * 100) / 100);
}

export function usdPriceForTotalMinted(totalMinted: number): number {
  return usdPriceForTier(tierIndexForTotalMinted(totalMinted));
}

/** Default ETH/USD for wei estimates when spot is unavailable. */
export const IDENTITY_MINT_DEFAULT_ETH_USD = 3000;

export function weiForUsdPrice(usd: number, ethUsd = IDENTITY_MINT_DEFAULT_ETH_USD): bigint {
  if (!Number.isFinite(usd) || usd <= 0 || !Number.isFinite(ethUsd) || ethUsd <= 0) {
    return 0n;
  }
  const native = usd / ethUsd;
  return BigInt(Math.floor(native * 1e18));
}

export function ladderSummary(totalMinted: number): IdentityMintLadderSummary {
  const total = Math.max(0, Math.floor(totalMinted));
  const tierIndex = tierIndexForTotalMinted(total);
  const tierUsd = usdPriceForTier(tierIndex);
  const atCap = tierUsd >= IDENTITY_MINT_CAP_USD;
  const mintsInTier = total % IDENTITY_MINT_TIER_SIZE;
  const mintsLeftInTier = atCap ? 0 : IDENTITY_MINT_TIER_SIZE - mintsInTier;
  const nextTierUsd = atCap ? null : usdPriceForTier(tierIndex + 1);

  return {
    totalMinted: total,
    tierIndex,
    tierUsd,
    mintsLeftInTier,
    nextTierUsd,
    atCap,
    nextMintNumber: total + 1,
  };
}

export function culturePointsForMint(totalMinted: number): number {
  const summary = ladderSummary(totalMinted);
  const base = 77;
  const earlyBonus = summary.nextMintNumber <= IDENTITY_MINT_TIER_SIZE ? 7 : 0;
  return base + earlyBonus;
}

/** Culture Points for a completed mint (1-based tokenId). */
export function culturePointsForTokenId(tokenId: number): number {
  const id = Math.max(1, Math.floor(tokenId));
  const base = 77;
  const earlyBonus = id <= IDENTITY_MINT_TIER_SIZE ? 7 : 0;
  return base + earlyBonus;
}

export function formatTierUsd(usd: number): string {
  if (usd % 1 === 0) return `$${usd.toFixed(0)}`;
  return `$${usd.toFixed(2)}`;
}
