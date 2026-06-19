/** Weekly Culture Points → BCC claim (7-day cooldown, staking boost). */

export const weeklyClaimEnabled =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WEEKLY_CLAIM_ENABLED === "1") ||
  false;

export const WEEKLY_CLAIM_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

/** Bps multiplier applied to weekly BCC from Roots staking tier. */
export const STAKING_BOOST_BPS: Record<number, number> = {
  0: 10_000,
  1: 11_500,
  2: 12_500,
};

export function formatBoostLabel(poolId: number): string {
  const bps = STAKING_BOOST_BPS[poolId] ?? 10_000;
  return `${(bps / 10_000).toFixed(2)}×`;
}

export function isWeeklyClaimEnabledServer(): boolean {
  return process.env.VITE_WEEKLY_CLAIM_ENABLED === "1" || process.env.WEEKLY_CLAIM_ENABLED === "1";
}

export function resolveWeeklyCooldownMs(): number {
  const raw = process.env.WEEKLY_CLAIM_COOLDOWN_SEC?.trim();
  if (raw && /^\d+$/.test(raw)) {
    return Number(raw) * 1000;
  }
  return WEEKLY_CLAIM_COOLDOWN_MS;
}

export function isWeeklyClaimBypassTvl(): boolean {
  return process.env.WEEKLY_CLAIM_BYPASS_TVL === "1";
}

export function applyStakingBoost(bccWei: bigint, poolId: number): bigint {
  const bps = STAKING_BOOST_BPS[poolId] ?? 10_000;
  return (bccWei * BigInt(bps)) / 10_000n;
}

export function weekIdForNow(cooldownMs: number, now = Date.now()): string {
  const bucket = Math.floor(now / cooldownMs);
  return String(bucket);
}

/** Server-derived idempotency key — never trust client-supplied weekly keys. */
export function buildWeeklyClaimIdempotencyKey(address: string, now = Date.now()): string {
  const cooldownMs = resolveWeeklyCooldownMs();
  const weekId = weekIdForNow(cooldownMs, now);
  return `weekly:${address.toLowerCase()}:${weekId}`;
}
