import { STAKING_BOOST_BPS } from "@/lib/weekly-claim-policy";

export const CULTURE_POWER_MIN_BPS = 8_000;
export const CULTURE_POWER_MAX_BPS = 20_000;
export const CULTURE_POWER_DEFAULT_SCORE = 400;
export const ACTIVATION_BASE_BPS = 10_000;
export const DECAY_BPS_PER_DAY = 500;
export const STREAK_BPS_PER_DAY = 200;
export const STREAK_CAP_DAYS = 7;
export const MS_PER_UTC_DAY = 24 * 60 * 60 * 1000;

export const LP_TIER_BPS: Record<number, number> = {
  0: 10_000,
  1: 11_000,
  2: 12_000,
};

export const BURN_TIER_BPS: Record<number, number> = {
  0: 10_000,
  1: 10_500,
  2: 11_000,
};

export const MAINTENANCE_TASK_SLUGS = [
  "daily-checkin-onchain",
  "daily-signature-attestation-bonus",
  "culture-well-daily",
  "power-daily-maintenance",
] as const;

export type CulturePowerDimension = {
  id: string;
  label: string;
  percent: number;
  detail?: string;
};

export type CulturePowerInput = {
  nowMs: number;
  lastMaintenanceMs: number | null;
  peakScore7d: number;
  streakDays: number;
  stakePoolId: number;
  lpTier: number;
  burnTier: number;
};

export type ComputedCulturePower = {
  powerScore: number;
  effectiveMultiplierBps: number;
  powerMultiplierLabel: string;
  dimensions: CulturePowerDimension[];
  maintenanceDueAt: string | null;
  streakDays: number;
  daysIdle: number;
};

export function isCulturePowerEnabledServer(): boolean {
  return (
    process.env.CULTURE_POWER_ENABLED === "1" || process.env.VITE_CULTURE_POWER_ENABLED === "1"
  );
}

export function resolveCulturePowerMaxBps(): number {
  const raw = process.env.CULTURE_POWER_MAX_BPS?.trim();
  if (raw && /^\d+$/.test(raw)) return Number(raw);
  return CULTURE_POWER_MAX_BPS;
}

export function resolveCulturePowerDecayBpsPerDay(): number {
  const raw = process.env.CULTURE_POWER_DECAY_BPS_PER_DAY?.trim();
  if (raw && /^\d+$/.test(raw)) return Number(raw);
  return DECAY_BPS_PER_DAY;
}

export function utcDayIndex(ms: number): number {
  return Math.floor(ms / MS_PER_UTC_DAY);
}

export function daysSinceMaintenance(lastMaintenanceMs: number | null, nowMs: number): number {
  if (lastMaintenanceMs == null) return 999;
  const lastDay = utcDayIndex(lastMaintenanceMs);
  const nowDay = utcDayIndex(nowMs);
  return Math.max(0, nowDay - lastDay);
}

export function baseActivationBps(
  daysIdle: number,
  peakScore7d: number,
  decayBpsPerDay = DECAY_BPS_PER_DAY,
): number {
  if (daysIdle <= 0) return ACTIVATION_BASE_BPS;
  const afterDecay = ACTIVATION_BASE_BPS - daysIdle * decayBpsPerDay;
  const floorBps = Math.max(4_000, Math.floor((peakScore7d / 1000) * 4_000));
  return Math.max(floorBps, afterDecay);
}

export function streakMultiplierBps(streakDays: number): number {
  const capped = Math.min(Math.max(0, streakDays), STREAK_CAP_DAYS);
  return ACTIVATION_BASE_BPS + capped * STREAK_BPS_PER_DAY;
}

export function lpTierFromBalanceWei(balanceWei: bigint): number {
  const min = 1_000_000_000_000_000n;
  if (balanceWei < min) return 0;
  if (balanceWei < min * 10n) return 1;
  return 2;
}

export function burnTierFromWei30d(totalWei: bigint): number {
  if (totalWei <= 0n) return 0;
  const oneBcc = 1_000_000_000_000_000_000n;
  if (totalWei < oneBcc) return 1;
  return 2;
}

export function computeEffectiveMultiplierBps(input: CulturePowerInput): number {
  const daysIdle = daysSinceMaintenance(input.lastMaintenanceMs, input.nowMs);
  const baseAct = baseActivationBps(daysIdle, input.peakScore7d);
  const stakeBps = STAKING_BOOST_BPS[input.stakePoolId] ?? 10_000;
  const lpBps = LP_TIER_BPS[input.lpTier] ?? 10_000;
  const burnBps = BURN_TIER_BPS[input.burnTier] ?? 10_000;
  const streakBps = streakMultiplierBps(input.streakDays);

  const product =
    (BigInt(baseAct) * BigInt(stakeBps) * BigInt(lpBps) * BigInt(burnBps) * BigInt(streakBps)) /
    10_000n ** 4n;

  const maxBps = resolveCulturePowerMaxBps();
  const n = Number(product);
  return Math.max(CULTURE_POWER_MIN_BPS, Math.min(maxBps, n));
}

export function powerScoreFromMultiplierBps(effectiveBps: number): number {
  const maxBps = resolveCulturePowerMaxBps();
  const clamped = Math.max(CULTURE_POWER_MIN_BPS, Math.min(maxBps, effectiveBps));
  return Math.round(((clamped - CULTURE_POWER_MIN_BPS) / (maxBps - CULTURE_POWER_MIN_BPS)) * 1000);
}

export function formatPowerMultiplierLabel(bps: number): string {
  return `${(bps / 10_000).toFixed(2)}×`;
}

export function maintenanceDueAtIso(
  lastMaintenanceMs: number | null,
  nowMs: number,
): string | null {
  if (lastMaintenanceMs == null) return new Date(nowMs).toISOString();
  const daysIdle = daysSinceMaintenance(lastMaintenanceMs, nowMs);
  if (daysIdle <= 0) {
    const nextDay = (utcDayIndex(nowMs) + 1) * MS_PER_UTC_DAY;
    return new Date(nextDay).toISOString();
  }
  return new Date(nowMs).toISOString();
}

export function computeCulturePower(input: CulturePowerInput): ComputedCulturePower {
  const daysIdle = daysSinceMaintenance(input.lastMaintenanceMs, input.nowMs);
  const baseAct = baseActivationBps(daysIdle, input.peakScore7d);
  const effectiveMultiplierBps = computeEffectiveMultiplierBps(input);
  const powerScore = powerScoreFromMultiplierBps(effectiveMultiplierBps);

  const stakePct = Math.round(
    ((STAKING_BOOST_BPS[input.stakePoolId] ?? 10_000) / 10_000 - 1) * 100 + 50,
  );
  const lpPct = Math.round(((LP_TIER_BPS[input.lpTier] ?? 10_000) / 10_000 - 1) * 100 + 50);
  const burnPct = Math.round(((BURN_TIER_BPS[input.burnTier] ?? 10_000) / 10_000 - 1) * 100 + 50);
  const activationPct = Math.round((baseAct / 10_000) * 100);
  const streakPct = Math.round((streakMultiplierBps(input.streakDays) / 10_000 - 1) * 100 + 50);

  return {
    powerScore,
    effectiveMultiplierBps,
    powerMultiplierLabel: formatPowerMultiplierLabel(effectiveMultiplierBps),
    streakDays: input.streakDays,
    daysIdle,
    maintenanceDueAt: maintenanceDueAtIso(input.lastMaintenanceMs, input.nowMs),
    dimensions: [
      {
        id: "activation",
        label: "Activation",
        percent: Math.min(100, activationPct),
        detail: daysIdle <= 0 ? "Reactor hot" : `${daysIdle}d idle`,
      },
      {
        id: "stake",
        label: "Roots stake",
        percent: Math.min(100, stakePct),
        detail: input.stakePoolId > 0 ? `Pool ${input.stakePoolId}` : "Unstaked",
      },
      {
        id: "lp",
        label: "Liquidity",
        percent: Math.min(100, lpPct),
        detail: `Tier ${input.lpTier}`,
      },
      {
        id: "burn",
        label: "Burn contrib",
        percent: Math.min(100, burnPct),
        detail: `Tier ${input.burnTier}`,
      },
      {
        id: "streak",
        label: "Streak",
        percent: Math.min(100, streakPct),
        detail: `${input.streakDays}d`,
      },
    ],
  };
}

export function applyPowerMultiplier(bccWei: bigint, effectiveMultiplierBps: number): bigint {
  return (bccWei * BigInt(effectiveMultiplierBps)) / 10_000n;
}
