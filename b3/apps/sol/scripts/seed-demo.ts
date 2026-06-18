import "dotenv/config";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";
import { PrismaClient } from "../src/generated/prisma/client";
import { computeCommunityStake, paidCentsForPlan } from "../src/lib/community-stake-data";
import { computeProofSnapshot } from "../src/lib/proof-score.server";
import { unlockMemberDeliverables } from "../src/lib/referral.server";

const DEMO_EMAIL = "demo@reset.app";

const adapter = new PrismaBunSqlite({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const programStart = new Date();
  programStart.setDate(programStart.getDate() - 5);

  const demo = await prisma.member.upsert({
    where: { email: DEMO_EMAIL },
    create: {
      email: DEMO_EMAIL,
      name: "Alex Rivera",
      referralCode: "ALEX7K2M",
      trackSlug: "sober-reset",
      plan: "LIFETIME",
      buildFocus: "all",
      programStartDate: programStart,
      streak: 5,
      lastActiveDate: new Date(),
      identityJson: JSON.stringify({
        q1: "shows up even when motivation is gone",
        q2: "using alcohol to numb hard conversations",
        q3: "one honest check-in and one walk before noon",
        q4: "text my accountability person and leave the room",
        q5: "finally became someone who keeps promises to himself",
      }),
    },
    update: {
      name: "Alex Rivera",
      trackSlug: "sober-reset",
      plan: "LIFETIME",
      buildFocus: "all",
      programStartDate: programStart,
      streak: 5,
      lastActiveDate: new Date(),
      identityJson: JSON.stringify({
        q1: "shows up even when motivation is gone",
        q2: "using alcohol to numb hard conversations",
        q3: "one honest check-in and one walk before noon",
        q4: "text my accountability person and leave the room",
        q5: "finally became someone who keeps promises to himself",
      }),
    },
  });

  await unlockMemberDeliverables(demo.id, demo.trackSlug, 5);

  const lifetimePaid = paidCentsForPlan("LIFETIME");
  const lifetimeStake = computeCommunityStake(lifetimePaid);
  await prisma.memberCommunityStake.deleteMany({ where: { memberId: demo.id } });
  await prisma.memberCommunityStake.create({
    data: {
      memberId: demo.id,
      plan: "LIFETIME",
      paidCents: lifetimePaid,
      lockCents: lifetimeStake.lockCents,
      bccAmount: lifetimeStake.bccAmount,
      status: "locked_staking",
      stakedAt: new Date(),
    },
  });

  const completedSlugs = [
    "welcome-your-reset",
    "identity-declaration",
    "morning-evening-ritual",
    "sober-day-1",
    "day-2-environment-audit",
    "day-3-accountability",
  ];

  for (const slug of completedSlugs) {
    const deliverable = await prisma.deliverable.findUnique({ where: { slug } });
    if (!deliverable) continue;
    await prisma.memberDeliverable.updateMany({
      where: { memberId: demo.id, deliverableId: deliverable.id },
      data: {
        completedAt: new Date(),
        reflectionNote:
          slug === "day-3-accountability"
            ? "Told Jordan. We check in Sundays at 9am."
            : undefined,
        checklistJson:
          slug === "sober-day-1" ? JSON.stringify([0, 1, 2, 3, 4]) : undefined,
      },
    });
  }

  await prisma.journalEntry.deleteMany({ where: { memberId: demo.id } });
  const journalSeeds = [
    {
      dayNumber: 3,
      prompt: "Who did I tell — and what do I want them to ask me tomorrow?",
      body: "Told Jordan I'm doing the sober reset. Asked them to text me if I go quiet for 48 hours. Felt scary and right.",
      mood: 8,
    },
    {
      dayNumber: 4,
      prompt: "Which habit in my build stack felt most natural today?",
      body: "Morning walk before email. My mind still reached for escape but the walk broke the loop.",
      mood: 7,
    },
    {
      dayNumber: 5,
      prompt: "What got scheduled that used to get stolen by chaos?",
      body: "Blocked 6–7:30am for focus. Also booked Sunday call with Jordan. Calendar finally reflects priorities.",
      mood: 9,
    },
  ];

  for (const j of journalSeeds) {
    await prisma.journalEntry.create({
      data: { memberId: demo.id, ...j },
    });
  }

  await prisma.moodCheckIn.deleteMany({ where: { memberId: demo.id } });

  const moodSeeds = [
    { programDay: 0, energy: "flat", inner: "heavy", momentum: "stuck" },
    { programDay: 1, energy: "okay", inner: "numb", momentum: "spinning" },
    { programDay: 2, energy: "steady", inner: "growing", momentum: "flat" },
    { programDay: 3, energy: "charged", inner: "lit", momentum: "progress" },
    { programDay: 4, energy: "fired-up", inner: "creative", momentum: "shipped" },
    { programDay: 5, energy: "rocket", inner: "calm", momentum: "focused" },
    { programDay: 6, energy: "dawn", inner: "calm", momentum: "win" },
  ] as const;

  const energyScores: Record<string, number> = {
    flat: 3, okay: 4, steady: 5, charged: 6, "fired-up": 7, rocket: 8, dawn: 9,
  };
  const innerScores: Record<string, number> = {
    heavy: 5, numb: 4, growing: 6, lit: 7, creative: 8, calm: 9,
  };
  const momentumScores: Record<string, number> = {
    stuck: 2, spinning: 3, flat: 5, progress: 6, shipped: 7, focused: 8, win: 9,
  };

  const morningBase = new Date();
  morningBase.setHours(7, 30, 0, 0);
  const eveningBase = new Date();
  eveningBase.setHours(21, 0, 0, 0);

  for (const seed of moodSeeds) {
    const dayOffset = 6 - seed.programDay;
    const morningAt = new Date(morningBase);
    morningAt.setDate(morningAt.getDate() - dayOffset);
    const eveningAt = new Date(eveningBase);
    eveningAt.setDate(eveningAt.getDate() - dayOffset);

    await prisma.moodCheckIn.create({
      data: {
        memberId: demo.id,
        programDay: seed.programDay,
        energySlug: seed.energy,
        energyScore: energyScores[seed.energy],
        innerSlug: seed.inner,
        innerScore: innerScores[seed.inner],
        momentumSlug: seed.momentum,
        momentumScore: momentumScores[seed.momentum],
        morningAt,
        eveningAt,
      },
    });
  }

  await prisma.proofAnchor.deleteMany({
    where: { memberId: demo.id },
  });
  await prisma.proofSnapshot.deleteMany({
    where: { memberId: demo.id },
  });

  const weekOneProof = await computeProofSnapshot(demo.id, "week-1");

  const achievementSlugs = [
    { slug: "showed-up", title: "Showed Up", description: "You joined RESET. The line in the sand is drawn." },
    { slug: "identity-signed", title: "Identity Signed", description: "Your declaration is saved. Present tense, no apologies." },
    { slug: "day-one-done", title: "Day One Done", description: "Track protocol complete. The first 24 hours count double." },
    { slug: "streak-3", title: "3-Day Streak", description: "Three days in a row showing up. Momentum is real." },
    { slug: "first-partner", title: "First Partner", description: "Someone joined through your link. Income follows service." },
    { slug: "builder-mind", title: "Mind Builder", description: "You're actively shaping how you think and see." },
    { slug: "builder-life", title: "Life Builder", description: "Real-world habits and environment — under construction." },
    { slug: "builder-digital", title: "Digital Builder", description: "Shipping, posting, coding — your digital self is live." },
    { slug: "mood-week", title: "Mood Week", description: "Seven days of morning and evening mood logged. Patterns emerge." },
  ];

  for (const a of achievementSlugs) {
    await prisma.memberAchievement.upsert({
      where: { memberId_slug: { memberId: demo.id, slug: a.slug } },
      create: { memberId: demo.id, ...a },
      update: { title: a.title, description: a.description },
    });
  }

  const referrals = [
    { email: "jordan@example.com", name: "Jordan M.", plan: "MONTHLY" as const, code: "JORD4N1X" },
    { email: "sam@example.com", name: "Sam T.", plan: "LIFETIME" as const, code: "SAMT9LIF" },
    { email: "riley@example.com", name: "Riley K.", plan: "MONTHLY" as const, code: "RILE2YK8" },
  ];

  for (const r of referrals) {
    const child = await prisma.member.upsert({
      where: { email: r.email },
      create: {
        email: r.email,
        name: r.name,
        referralCode: r.code,
        referredById: demo.id,
        trackSlug: "new-identity",
        plan: r.plan,
      },
      update: { referredById: demo.id, plan: r.plan },
    });

    await prisma.referralEarning.deleteMany({
      where: { earnerId: demo.id, sourceId: child.id },
    });

    const price = r.plan === "LIFETIME" ? 19900 : 1900;
    await prisma.referralEarning.create({
      data: {
        earnerId: demo.id,
        sourceId: child.id,
        level: 1,
        amountCents: Math.round(price * 0.3),
        plan: r.plan,
        status: r.plan === "LIFETIME" ? "paid" : "pending",
      },
    });
  }

  console.log("\n✓ Demo account ready");
  console.log("  Email:    demo@reset.app");
  console.log("  Login:    http://localhost:8080/login");
  console.log("  Members:  http://localhost:8080/members");
  console.log("  Proof:    http://localhost:8080/members/progress");
  console.log("  Journal:  http://localhost:8080/members/journal");
  console.log("  Mood:     http://localhost:8080/members/mood");
  console.log("  Partner:  http://localhost:8080/members/partner");
  console.log("  Referral: http://localhost:8080/join?ref=ALEX7K2M");
  console.log(`  Proof:    week-1 score ${weekOneProof.proofScore} (${weekOneProof.status})`);
  console.log("  Anchor:   link wallet on Proof wall + TREASURY_SECRET_KEY for on-chain tx");
  console.log("");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
