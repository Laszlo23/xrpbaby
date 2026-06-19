/** Off-chain secret BCC bonus from on-chain attestation signals (not shown in UI). */

export type PanicOnchainSignals = {
  streakDays: number;
  holdSeconds: number;
  totalRuns: number;
  precisionScore: number;
};

/** Additional wei layered on base panic reward — formula intentionally opaque to players. */
export function computePanicSecretBonusWei(signals: PanicOnchainSignals): bigint {
  const holdSec = Math.min(Math.max(0, signals.holdSeconds), 5220);
  const streak = Math.min(Math.max(1, signals.streakDays), 90);
  const runs = Math.min(Math.max(1, signals.totalRuns), 120);
  const precision = Math.min(Math.max(0, signals.precisionScore), 777);

  // Endurance hold — longer visible hold, larger quiet bonus (capped).
  const holdBonus = BigInt(holdSec) * 8_000_000_000_000n;

  // Daily streak — compounding patience (secret).
  const streakBonus = BigInt(streak * streak) * 1_500_000_000_000_000n;

  // Lifetime runs — veteran drip.
  const veteranBonus = BigInt(runs) * 400_000_000_000_000n;

  // Precision tail — rewards tight timing without advertising tiers.
  const precisionBonus =
    precision >= 700 ? 19_000_000_000_000_000n : precision >= 620 ? 9_000_000_000_000_000n : 0n;

  const total = holdBonus + streakBonus + veteranBonus + precisionBonus;
  const cap = 250_000_000_000_000_000n; // 0.25 BCC max secret layer
  return total > cap ? cap : total;
}
