/** Gated points → BCD redemption (off until liquidity + ops enable). */

export const pointsRedeemEnabled =
  (typeof import.meta !== "undefined" &&
    import.meta.env.VITE_POINTS_REDEEM_ENABLED === "1") ||
  false;

export const redemptionPolicy = {
  minPoolTvlUsd: 500_000,
  maxRedeemPointsPerDay: 100_000,
  /** Placeholder — set when BCD pool is live */
  pointsPerBcdWei: "0",
} as const;
