import { FOUNDING_DAILY_QUESTS } from "@/lib/founding-quests";

export type ForestDashboardTaskKind = "inline" | "route" | "profile" | "coming_soon";

export type ForestDashboardTask = {
  slug: string;
  title: string;
  description: string;
  /** Number or label like "Variable" for daily share. */
  culturePoints: number | string;
  kind: ForestDashboardTaskKind;
  claimRoute?: string;
};

const SOCIAL_PROFILE_TASKS: ForestDashboardTask[] = [
  {
    slug: "follow-farcaster",
    title: "Follow on Farcaster",
    description: "Follow @0xleonardo — verified via Warpcast.",
    culturePoints: 35,
    kind: "profile",
  },
  {
    slug: "x-reply-official",
    title: "Reply on X",
    description: "Reply to our official post — paste proof in profile.",
    culturePoints: 30,
    kind: "profile",
  },
  {
    slug: "telegram-join-buildingculture",
    title: "Join Telegram",
    description: "Join the Building Culture community channel.",
    culturePoints: 45,
    kind: "profile",
  },
  {
    slug: "daily-share-post",
    title: "Share the story",
    description: "Post about Building Culture — variable Culture Value daily.",
    culturePoints: "Variable",
    kind: "profile",
  },
];

function foundingToDashboardTask(q: (typeof FOUNDING_DAILY_QUESTS)[number]): ForestDashboardTask {
  if (!q.wired) {
    return {
      slug: q.slug,
      title: q.title,
      description: q.description,
      culturePoints: q.culturePoints,
      kind: "coming_soon",
    };
  }
  if (q.inlineClaim) {
    return {
      slug: q.slug,
      title: q.title,
      description: q.description,
      culturePoints: q.culturePoints,
      kind: "inline",
      claimRoute: q.claimRoute,
    };
  }
  return {
    slug: q.slug,
    title: q.title,
    description: q.description,
    culturePoints: q.culturePoints,
    kind: "route",
    claimRoute: q.claimRoute,
  };
}

const SOCIAL_SLUGS = new Set(SOCIAL_PROFILE_TASKS.map((t) => t.slug));

/** Display catalog for /forest dashboard grid (no DB). */
export const FOREST_DASHBOARD_TASKS: ForestDashboardTask[] = [
  ...FOUNDING_DAILY_QUESTS.filter(
    (q) => q.slug !== "daily-checkin-onchain" && !SOCIAL_SLUGS.has(q.slug),
  ).map(foundingToDashboardTask),
  ...SOCIAL_PROFILE_TASKS,
];

export function formatForestTaskPoints(pts: number | string): string {
  if (typeof pts === "string") return pts;
  return `+${pts} pts`;
}
