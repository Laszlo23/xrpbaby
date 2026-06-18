export const PROOF_SCORE_THRESHOLD = 60;

export const PROOF_SCORE_WEIGHTS = {
  moodDay: 10,
  moodDayCap: 70,
  journalEntry: 15,
  journalEntryCap: 45,
  journalMinChars: 80,
  deliverable: 20,
  streakDay: 5,
  streakCap: 7,
  identity: 10,
} as const;

export const PROOF_REFLECTION_MIN_CHARS = 40;

export const PROOF_REFLECTION_SLUGS = ["day-7-week-one-proof"] as const;

export type ProofSnapshotStatus = "draft" | "eligible" | "anchored";

export function isPeriodContainingDay7(periodKey: string): boolean {
  const week = Number.parseInt(periodKey.replace("week-", ""), 10);
  return week === 1;
}

export type ProofSignals = {
  moodDays: number;
  moodScore: number;
  journalCount: number;
  journalScore: number;
  deliverableCount: number;
  deliverableScore: number;
  streakScore: number;
  identityScore: number;
  completedSlugs: string[];
  moodProgramDays: number[];
};
