import { getFundingStats } from "@/lib/funding-stats";

/** Matches seed script: whole-token cap from illustrative property value (USD). */
export function demoWholeTokenSupply(goalUsd: number): number {
  return Math.max(0, Math.floor((goalUsd * 110) / 100 / 1000));
}

/** Illustrative shares not yet “filled” in the demo funding model. */
export function demoAvailableShares(propertyId: bigint, goalUsd: number): number {
  const cap = demoWholeTokenSupply(goalUsd);
  if (cap === 0) return 0;
  const f = getFundingStats(propertyId, goalUsd);
  return Math.max(0, Math.round(cap * (1 - f.progress)));
}
