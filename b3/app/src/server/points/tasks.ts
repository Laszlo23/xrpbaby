import type { Prisma, PrismaClient } from "@prisma/client";

type PrismaDb = PrismaClient | Prisma.TransactionClient;

const DEFAULT_TASKS = [
  { slug: "join-forest", title: "Create your pass", points: 50, active: true },
  {
    slug: "mint-culture-id",
    title: "Mint your .culture ID",
    points: 84,
    active: true,
  },
  {
    slug: "identity-referral-mint",
    title: "Mint with a referral code",
    points: 25,
    active: true,
  },
  {
    slug: "identity-referral-share",
    title: "Share your Culture ID referral code",
    points: 15,
    active: true,
  },
  {
    slug: "identity-referral-batch-complete",
    title: "All 7 referral codes used in a batch",
    points: 77,
    active: true,
  },
  {
    slug: "power-daily-maintenance",
    title: "Culture Power — daily reactor maintenance",
    points: 5,
    active: true,
  },
  {
    slug: "power-streak-7",
    title: "Culture Power — 7-day maintenance streak",
    points: 35,
    active: true,
  },
  {
    slug: "power-reactor-max",
    title: "Culture Power — max reactor output",
    points: 50,
    active: true,
  },
  { slug: "connect-wallet", title: "Connect wallet", points: 25, active: true },
  { slug: "visit-marketplace", title: "Open Project shares", points: 15, active: true },
  {
    slug: "visit-liquidity-hub",
    title: "Visit BCC liquidity learn hub",
    points: 20,
    active: true,
  },
  {
    slug: "complete-bcc-liquidity-lesson",
    title: "Complete BCC liquidity lesson track",
    points: 40,
    active: true,
  },
  {
    slug: "bcc-lp-proof",
    title: "Prove Aerodrome BCC LP position",
    points: 75,
    active: true,
  },
  {
    slug: "bcc-roots-stake",
    title: "Culture Roots — first BCC stake",
    points: 50,
    active: true,
  },
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
    slug: "daily-signature-attestation-bonus",
    title: "Daily SIWE signature attestation bonus",
    points: 7,
    active: true,
  },
  {
    slug: "culture-well-daily",
    title: "Culture Spinning Well (daily)",
    /** Dynamic delta in well-spin-credit — digit × 3 capped at 33. */
    points: 0,
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
    slug: "grove-seed-welcome",
    title: "Culture Grove — joined via friend link",
    points: 25,
    active: true,
  },
  {
    slug: "grove-twin-bloom",
    title: "Culture Grove — Twin Bloom (2 friends)",
    points: 100,
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
  {
    slug: "panic-switch-bcc-daily",
    title: "Panic Switch — daily attested completion",
    points: 12,
    active: true,
  },
  {
    slug: "panic-switch-voucher-nft-claim",
    title: "Panic Switch — hidden track voucher NFT claimed",
    points: 77,
    active: true,
  },
  {
    slug: "studio-first-app",
    title: "BC Studio — create your first app",
    points: 50,
    active: true,
  },
  {
    slug: "daily-studio-build",
    title: "BC Studio — daily build session",
    points: 25,
    active: true,
  },
  {
    slug: "daily-share-post",
    title: "Share the story (daily)",
    points: 0,
    active: true,
  },
  {
    slug: "builder-voice-submit",
    title: "Builder Voice — valid product feedback",
    points: 5,
    active: true,
  },
  {
    slug: "builder-voice-useful",
    title: "Builder Voice — useful feedback (team review)",
    points: 25,
    active: true,
  },
  {
    slug: "builder-voice-gold",
    title: "Builder Voice — gold feedback (team review)",
    points: 75,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-1",
    title: "Culture Chronicles — mint chapter 1",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-2",
    title: "Culture Chronicles — mint chapter 2",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-3",
    title: "Culture Chronicles — mint chapter 3",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-4",
    title: "Culture Chronicles — mint chapter 4",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-5",
    title: "Culture Chronicles — mint chapter 5",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-6",
    title: "Culture Chronicles — mint chapter 6",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-7",
    title: "Culture Chronicles — mint chapter 7",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-8",
    title: "Culture Chronicles — mint chapter 8",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-9",
    title: "Culture Chronicles — mint chapter 9",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-10",
    title: "Culture Chronicles — mint chapter 10",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-mint-edition-11",
    title: "Culture Chronicles — mint chapter 11",
    points: 50,
    active: true,
  },
  {
    slug: "chronicle-founder-complete",
    title: "Culture Chronicles — full set (11/11)",
    points: 500,
    active: true,
  },
  {
    slug: "chronicle-share-chapter",
    title: "Culture Chronicles — share a chapter",
    points: 25,
    active: true,
  },
  {
    slug: "builder-tape-listen-dial-up-whispers",
    title: "Builder Tapes — Dial-Up Whispers",
    points: 20,
    active: true,
  },
  {
    slug: "builder-tape-listen-screen-glow-hope",
    title: "Builder Tapes — Screen-Glow Hope",
    points: 20,
    active: true,
  },
  {
    slug: "builder-tape-listen-bitcoin-whitepaper",
    title: "Builder Tapes — Bitcoin Whitepaper",
    points: 20,
    active: true,
  },
  {
    slug: "builder-tape-listen-cathedral-builders",
    title: "Builder Tapes — Cathedral Builders",
    points: 20,
    active: true,
  },
  {
    slug: "builder-tape-listen-builders-inherit",
    title: "Builder Tapes — Builders Inherit",
    points: 20,
    active: true,
  },
  {
    slug: "builder-tapes-complete-all",
    title: "Builder Tapes — complete all 5",
    points: 50,
    active: true,
  },
  {
    slug: "daily-invite-friend",
    title: "Invite a friend",
    points: 200,
    active: true,
  },
  {
    slug: "merch-holder-claim",
    title: "Claim limited merch credential",
    points: 15,
    active: true,
  },
  {
    slug: "merch-edition-complete",
    title: "Merch edition batch funded (buyer bonus)",
    points: 7,
    active: true,
  },
] as const;

/** Upsert default tasks (idempotent; adds new slugs to existing DBs). */
export async function ensureDefaultTasks(prisma: PrismaDb): Promise<void> {
  for (const t of DEFAULT_TASKS) {
    await prisma.taskDefinition.upsert({
      where: { slug: t.slug },
      create: { slug: t.slug, title: t.title, points: t.points, active: t.active },
      update: { title: t.title, points: t.points, active: t.active },
    });
  }
}
