/** Founding Builders quests — synced with task definitions in server/points/tasks.ts */

export type FoundingQuest = {
  slug: string;
  title: string;
  description: string;
  culturePoints: number;
  /** When false, quest is shown as coming soon (no server claim path yet). */
  wired: boolean;
};

export const FOUNDING_DAILY_QUESTS: FoundingQuest[] = [
  {
    slug: "join-forest",
    title: "Create your pass",
    description: "Finish onboarding at /join if you have not yet.",
    culturePoints: 50,
    wired: true,
  },
  {
    slug: "visit-liquidity-hub",
    title: "Learn BCC liquidity",
    description: "Complete the lesson track at /liquidity.",
    culturePoints: 40,
    wired: true,
  },
  {
    slug: "studio-first-app",
    title: "Ship in BC Studio",
    description: "Create your first app in BC Studio.",
    culturePoints: 50,
    wired: true,
  },
  {
    slug: "daily-studio-build",
    title: "Daily studio build",
    description: "Run one AI generation in BC Studio today.",
    culturePoints: 25,
    wired: true,
  },
  {
    slug: "daily-visit-ecosystem",
    title: "Visit an ecosystem door",
    description: "Open any lane in the forest today.",
    culturePoints: 200,
    wired: false,
  },
  {
    slug: "daily-invite-friend",
    title: "Invite a friend",
    description: "Share the forest with one new builder.",
    culturePoints: 200,
    wired: false,
  },
  {
    slug: "daily-share-post",
    title: "Share the story",
    description: "Post about Building Culture on X or Farcaster.",
    culturePoints: 200,
    wired: false,
  },
  {
    slug: "daily-ask-mayor",
    title: "Talk to Mayor Culture",
    description: "Ask the AI Mayor for guidance (founding mini app).",
    culturePoints: 200,
    wired: false,
  },
];

/** Quests with a working server claim path — shown first on /forest/quests. */
export const FOUNDING_WIRED_QUESTS = FOUNDING_DAILY_QUESTS.filter((q) => q.wired);
