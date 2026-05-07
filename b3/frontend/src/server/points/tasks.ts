import type { PrismaClient } from "@prisma/client";

const DEFAULT_TASKS = [
  { slug: "connect-wallet", title: "Connect wallet", points: 25, active: true },
  { slug: "visit-marketplace", title: "Open Project shares", points: 15, active: true },
  {
    slug: "share-on-x",
    title: "Share on X (legacy)",
    points: 0,
    active: false,
  },
  {
    slug: "follow-farcaster",
    title: "Follow @0xleonardo on Farcaster (BuildingCulture)",
    points: 35,
    active: true,
  },
  {
    slug: "like-cast-farcaster",
    title: "Like our announcement cast",
    points: 25,
    active: true,
  },
  {
    slug: "share-app-farcaster",
    title: "Share BUILDCHAIN in a cast",
    points: 40,
    active: true,
  },
  {
    slug: "x-reply-official",
    title: "Reply to our post on X",
    points: 30,
    active: true,
  },
  {
    slug: "x-retweet-official",
    title: "Repost our post on X",
    points: 35,
    active: true,
  },
  {
    slug: "x-quote-official",
    title: "Quote-post our post on X",
    points: 40,
    active: true,
  },
  {
    slug: "daily-checkin-onchain",
    title: "Daily on-chain check-in (Base)",
    points: 20,
    active: true,
  },
  {
    slug: "raffle-referral-bonus",
    title: "Raffle ticket referral (per referred mint tx)",
    /** Base points; server may scale by ticket count in metadata. */
    points: 15,
    active: true,
  },
  {
    slug: "telegram-join-buildingculture",
    title: "Join BuildingCulture Telegram",
    points: 45,
    active: true,
  },
  {
    slug: "elias-plan-confirmed",
    title: "Elias Concierge — itinerary confirmed (staff)",
    points: 60,
    active: true,
  },
  {
    slug: "elias-ecosystem-entry",
    title: "Elias journey — chose an entry intent (SIWE)",
    points: 15,
    active: true,
  },
] as const;

/** Upsert default tasks (idempotent; adds new slugs to existing DBs). */
export async function ensureDefaultTasks(prisma: PrismaClient): Promise<void> {
  for (const t of DEFAULT_TASKS) {
    await prisma.taskDefinition.upsert({
      where: { slug: t.slug },
      create: { slug: t.slug, title: t.title, points: t.points, active: t.active },
      update: { title: t.title, points: t.points, active: t.active },
    });
  }
}
