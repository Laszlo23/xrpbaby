/** Gated points → BCC redemption (off until liquidity + ops enable). */

export const pointsRedeemEnabled =
  (typeof import.meta !== "undefined" && import.meta.env.VITE_POINTS_REDEEM_ENABLED === "1") ||
  false;

export const redemptionPolicy = {
  minPoolTvlUsd: 500_000,
  maxRedeemPointsPerDay: 100_000,
  /**
   * Wei of BCC per Culture Point when redemption is enabled.
   * Set via VITE_POINTS_PER_BCC_WEI when ops turns the gate on.
   */
  pointsPerBcdWei:
    (typeof import.meta !== "undefined" && import.meta.env.VITE_POINTS_PER_BCC_WEI?.trim()) || "0",
} as const;

export type RedemptionReadiness = {
  enabled: boolean;
  minPoolTvlUsd: number;
  combinedTvlUsd: number | null;
  percentToGate: number | null;
  ready: boolean;
  pointsPerBccWei: string;
};

export function getRedemptionReadiness(combinedTvlUsd: number | null): RedemptionReadiness {
  const min = redemptionPolicy.minPoolTvlUsd;
  const tvl = combinedTvlUsd ?? 0;
  const enabled = pointsRedeemEnabled;
  return {
    enabled,
    minPoolTvlUsd: min,
    combinedTvlUsd,
    percentToGate:
      combinedTvlUsd != null && min > 0 ? Math.min(100, Math.round((tvl / min) * 100)) : null,
    ready: enabled && tvl >= min,
    pointsPerBccWei: redemptionPolicy.pointsPerBcdWei,
  };
}

/** Server-side: reads env without import.meta. */
export function getServerRedemptionReadiness(combinedTvlUsd: number | null): RedemptionReadiness {
  const min = redemptionPolicy.minPoolTvlUsd;
  const tvl = combinedTvlUsd ?? 0;
  const enabled =
    process.env.VITE_POINTS_REDEEM_ENABLED === "1" || process.env.POINTS_REDEEM_ENABLED === "1";
  const pointsPerBccWei =
    process.env.VITE_POINTS_PER_BCC_WEI?.trim() || process.env.POINTS_PER_BCC_WEI?.trim() || "0";
  return {
    enabled,
    minPoolTvlUsd: min,
    combinedTvlUsd,
    percentToGate:
      combinedTvlUsd != null && min > 0 ? Math.min(100, Math.round((tvl / min) * 100)) : null,
    ready: enabled && tvl >= min,
    pointsPerBccWei,
  };
}
