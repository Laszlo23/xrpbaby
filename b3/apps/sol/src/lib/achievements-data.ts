export type AchievementDef = {
  slug: string;
  title: string;
  description: string;
};

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    slug: "showed-up",
    title: "Showed Up",
    description: "You joined RESET. The line in the sand is drawn.",
  },
  {
    slug: "identity-signed",
    title: "Identity Signed",
    description: "Your declaration is saved. Present tense, no apologies.",
  },
  {
    slug: "day-one-done",
    title: "Day One Done",
    description: "Track protocol complete. The first 24 hours count double.",
  },
  {
    slug: "week-one-proof",
    title: "Week One Proof",
    description: "Seven days of evidence captured. Future you has ammo.",
  },
  {
    slug: "streak-3",
    title: "3-Day Streak",
    description: "Three days in a row showing up. Momentum is real.",
  },
  {
    slug: "streak-7",
    title: "7-Day Streak",
    description: "A full week of daily action. You're building something.",
  },
  {
    slug: "first-partner",
    title: "First Partner",
    description: "Someone joined through your link. Income follows service.",
  },
  {
    slug: "builder-mind",
    title: "Mind Builder",
    description: "You're actively shaping how you think and see.",
  },
  {
    slug: "builder-life",
    title: "Life Builder",
    description: "Real-world habits and environment — under construction.",
  },
  {
    slug: "builder-digital",
    title: "Digital Builder",
    description: "Shipping, posting, coding — your digital self is live.",
  },
  {
    slug: "mood-week",
    title: "Mood Week",
    description: "Seven days of morning and evening mood logged. Your timeline tells a story.",
  },
];

export const JOURNAL_PROMPTS: Record<number, string> = {
  0: "What made me join today — and what am I unwilling to tolerate anymore?",
  1: "What did I protect today? What almost pulled me back?",
  2: "What did I remove from my environment? How did it feel?",
  3: "Who did I tell — and what do I want them to ask me tomorrow?",
  4: "Which habit in my build stack felt most natural today?",
  5: "What got scheduled that used to get stolen by chaos?",
  6: "Read my declaration aloud — what line hit hardest?",
  7: "Three proofs from this week. What would I tell someone starting tomorrow?",
};
