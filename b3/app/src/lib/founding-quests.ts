/** Founding Builders quests — synced with task definitions in server/points/tasks.ts */

export type FoundingQuest = {
  slug: string;
  title: string;
  description: string;
  culturePoints: number;
  /** When false, quest is shown as coming soon (no server claim path yet). */
  wired: boolean;
  /** Where to complete or claim this quest. */
  claimRoute?: string;
  /** Inline claim on quest hub (SIWE task slug). */
  inlineClaim?: boolean;
};

export const FOUNDING_DAILY_QUESTS: FoundingQuest[] = [
  {
    slug: "connect-wallet",
    title: "Connect wallet",
    description: "Sign in with your wallet on Base — your first Culture Points.",
    culturePoints: 25,
    wired: true,
    claimRoute: "/profile",
    inlineClaim: true,
  },
  {
    slug: "join-forest",
    title: "Create your pass",
    description: "Finish onboarding at /join if you have not yet.",
    culturePoints: 50,
    wired: true,
    claimRoute: "/join",
  },
  {
    slug: "visit-marketplace",
    title: "Visit marketplace",
    description: "Browse culture drops and listings.",
    culturePoints: 15,
    wired: true,
    claimRoute: "/profile",
    inlineClaim: true,
  },
  {
    slug: "visit-liquidity-hub",
    title: "Learn BCC liquidity",
    description: "Complete the lesson track at /liquidity.",
    culturePoints: 40,
    wired: true,
    claimRoute: "/liquidity",
  },
  {
    slug: "bcc-roots-stake",
    title: "Stake in Culture Roots",
    description: "Lock BCC in a Roots pool to boost weekly claims.",
    culturePoints: 50,
    wired: true,
    claimRoute: "/roots",
  },
  {
    slug: "studio-first-app",
    title: "Ship in BC Studio",
    description: "Create your first app in BC Studio.",
    culturePoints: 50,
    wired: true,
    claimRoute: "/studio",
  },
  {
    slug: "daily-studio-build",
    title: "Daily studio build",
    description: "Run one AI generation in BC Studio today.",
    culturePoints: 25,
    wired: true,
    claimRoute: "/studio",
  },
  {
    slug: "daily-checkin-onchain",
    title: "Daily on-chain check-in",
    description: "Stamp your wallet once per UTC day.",
    culturePoints: 20,
    wired: true,
    claimRoute: "/profile",
    inlineClaim: true,
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
