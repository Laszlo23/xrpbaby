/** Founding Builders daily quests — synced with apps/founding backend pool. */
export type FoundingQuest = {
  slug: string;
  title: string;
  description: string;
  culturePoints: number;
};

export const FOUNDING_DAILY_QUESTS: FoundingQuest[] = [
  {
    slug: "daily-visit-ecosystem",
    title: "Visit an ecosystem door",
    description: "Open any lane in the forest today.",
    culturePoints: 200,
  },
  {
    slug: "daily-invite-friend",
    title: "Invite a friend",
    description: "Share the forest with one new builder.",
    culturePoints: 200,
  },
  {
    slug: "daily-share-post",
    title: "Share the story",
    description: "Post about Building Culture on X or Farcaster.",
    culturePoints: 200,
  },
  {
    slug: "daily-ask-mayor",
    title: "Talk to Mayor Culture",
    description: "Ask the AI Mayor for guidance (founding mini app).",
    culturePoints: 200,
  },
  {
    slug: "join-forest",
    title: "Create your pass",
    description: "Finish onboarding at /join if you have not yet.",
    culturePoints: 50,
  },
];
