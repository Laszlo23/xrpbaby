export const FEEDBACK_AREAS = [
  "onboarding",
  "marketplace",
  "places",
  "tg",
  "identity",
  "other",
] as const;

export type FeedbackArea = (typeof FEEDBACK_AREAS)[number];

export const FEEDBACK_PASS_THRESHOLD = 55;

export const FEEDBACK_REWARDS = {
  submit: { slug: "builder-voice-submit", points: 5 },
  useful: { slug: "builder-voice-useful", points: 25 },
  gold: { slug: "builder-voice-gold", points: 75 },
} as const;

export type FeedbackStatus = "rejected" | "pending_review" | "useful" | "gold" | "implemented";

export function currentWeekBucket(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
