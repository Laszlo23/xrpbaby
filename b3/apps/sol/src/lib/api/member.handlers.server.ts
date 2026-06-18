import type { Member } from "@/generated/prisma/client";
import { JOURNAL_PROMPTS } from "@/lib/achievements-data";
import { getCommunityStakeSummary } from "@/lib/community-stake.server";
import { getPrisma } from "@/lib/db.server";
import { createMemberFromSignup, createMemberSession } from "@/lib/member-onboard.server";
import {
  bumpStreak,
  evaluateAchievements,
  getProgramDay,
  getProgramStartDate,
  parseChecklistJson,
  parseIdentityJson,
  syncUnlockedDeliverables,
} from "@/lib/member-progress.server";
import { clearSessionToken, getSessionToken } from "@/lib/session.server";
import { validateDeliverableCompletion } from "@/lib/deliverable-validation.server";
import { resolveMoodOption } from "@/lib/mood-data";
import { formatMoodCheckIn } from "@/lib/mood-timeline.server";
import { computeProofSnapshot } from "@/lib/proof-score.server";
import { getTrack, PLAN_PRICES_CENTS } from "@/lib/tracks-data";

const DEMO_EMAIL = "demo@reset.app";

export async function getMemberFromSession() {
  const token = getSessionToken();
  if (!token) return null;

  const prisma = getPrisma();
  const session = await prisma.memberSession.findUnique({
    where: { token },
    include: { member: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.memberSession.delete({ where: { id: session.id } });
    return null;
  }

  return session.member;
}

export async function buildDashboard(member: Member) {
  const prisma = getPrisma();
  const track = getTrack(member.trackSlug);
  const programDay = getProgramDay(member);
  const maxUnlockDay = Math.min(programDay + 1, 7);

  await syncUnlockedDeliverables(member.id, member.trackSlug, maxUnlockDay);
  await computeProofSnapshot(member.id);
  await evaluateAchievements(member.id);

  const freshMember = await prisma.member.findUnique({
    where: { id: member.id },
    include: {
      deliverables: { include: { deliverable: true } },
      achievements: { orderBy: { earnedAt: "desc" } },
      journalEntries: { orderBy: { createdAt: "desc" }, take: 7 },
    },
  });
  if (!freshMember) return null;

  const unlocked = freshMember.deliverables.sort(
    (a, b) => a.deliverable.sortOrder - b.deliverable.sortOrder,
  );

  const directReferrals = await prisma.member.count({
    where: { referredById: member.id },
  });

  const earnings = await prisma.referralEarning.aggregate({
    where: { earnerId: member.id },
    _sum: { amountCents: true },
  });

  const pendingEarnings = await prisma.referralEarning.aggregate({
    where: { earnerId: member.id, status: "pending" },
    _sum: { amountCents: true },
  });

  const todayDeliverables = unlocked.filter((u) => u.deliverable.dayNumber <= maxUnlockDay);
  const completedCount = todayDeliverables.filter((u) => u.completedAt).length;
  const totalUnlocked = todayDeliverables.length;

  const todayMood = await prisma.moodCheckIn.findUnique({
    where: { memberId_programDay: { memberId: member.id, programDay } },
  });

  return {
    id: freshMember.id,
    name: freshMember.name,
    email: freshMember.email,
    referralCode: freshMember.referralCode,
    plan: freshMember.plan,
    trackSlug: freshMember.trackSlug,
    trackTitle: track?.title ?? freshMember.trackSlug,
    buildFocus: freshMember.buildFocus,
    programDay,
    programStartDate: getProgramStartDate(freshMember).toISOString(),
    streak: freshMember.streak,
    identity: parseIdentityJson(freshMember.identityJson),
    progress: {
      completedCount,
      totalUnlocked,
      percent: totalUnlocked > 0 ? Math.round((completedCount / totalUnlocked) * 100) : 0,
      maxUnlockDay,
    },
    deliverables: unlocked.map((u) => ({
      slug: u.deliverable.slug,
      title: u.deliverable.title,
      description: u.deliverable.description,
      type: u.deliverable.type,
      dayNumber: u.deliverable.dayNumber,
      content: u.deliverable.content,
      completedAt: u.completedAt?.toISOString() ?? null,
      unlockedAt: u.unlockedAt.toISOString(),
      checklistChecked: parseChecklistJson(u.checklistJson),
      reflectionNote: u.reflectionNote ?? "",
      isLocked: u.deliverable.dayNumber > maxUnlockDay,
    })),
    achievements: freshMember.achievements.map((a) => ({
      slug: a.slug,
      title: a.title,
      description: a.description,
      earnedAt: a.earnedAt.toISOString(),
    })),
    mood: {
      morningDone: todayMood?.morningAt != null,
      eveningDone: todayMood?.eveningAt != null,
      todayEnergySlug: todayMood?.energySlug ?? null,
      todayInnerSlug: todayMood?.innerSlug ?? null,
      todayMomentumSlug: todayMood?.momentumSlug ?? null,
    },
    proof: await (async () => {
      const snapshot = await prisma.proofSnapshot.findFirst({
        where: {
          memberId: member.id,
          periodKey: `week-${Math.floor(programDay / 7) + 1}`,
        },
        include: { anchor: true },
      });
      if (!snapshot) {
        return {
          score: 0,
          status: "draft" as const,
          periodKey: `week-${Math.floor(programDay / 7) + 1}`,
          threshold: 60,
          txSignature: null,
          walletAddress: freshMember.walletAddress,
        };
      }
      return {
        score: snapshot.proofScore,
        status: snapshot.status as "draft" | "eligible" | "anchored",
        periodKey: snapshot.periodKey,
        threshold: 60,
        txSignature: snapshot.anchor?.txSignature ?? null,
        walletAddress: freshMember.walletAddress,
      };
    })(),
    journal: {
      todayPrompt: JOURNAL_PROMPTS[Math.min(programDay, 7)] ?? JOURNAL_PROMPTS[0],
      recent: freshMember.journalEntries.map((j) => ({
        id: j.id,
        dayNumber: j.dayNumber,
        prompt: j.prompt,
        body: j.body,
        mood: j.mood,
        createdAt: j.createdAt.toISOString(),
      })),
    },
    partner: {
      directReferrals,
      totalEarningsCents: earnings._sum.amountCents ?? 0,
      pendingEarningsCents: pendingEarnings._sum.amountCents ?? 0,
      referralLink: `/join?ref=${freshMember.referralCode}`,
      planPrices: PLAN_PRICES_CENTS,
    },
    communityStake: await getCommunityStakeSummary(member.id),
  };
}

export async function handleSignUp(data: {
  email: string;
  name: string;
  trackSlug: string;
  plan: "TRIAL" | "MONTHLY" | "LIFETIME";
  referralCode?: string;
}) {
  const { member, trackTitle } = await createMemberFromSignup(data);
  await createMemberSession(member.id);
  return {
    id: member.id,
    name: member.name,
    referralCode: member.referralCode,
    trackTitle,
    plan: member.plan,
  };
}

export async function handleLoginDemo() {
  const prisma = getPrisma();
  const member = await prisma.member.findUnique({ where: { email: DEMO_EMAIL } });
  if (!member) {
    throw new Error("Demo account not found. Run: bun run db:demo");
  }
  await createMemberSession(member.id);
  return { id: member.id, name: member.name, demo: true };
}

export async function handleLogin(email: string) {
  const prisma = getPrisma();
  const member = await prisma.member.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!member) throw new Error("No account found. Join first.");
  await createMemberSession(member.id);
  return { id: member.id, name: member.name };
}

export async function handleLogout() {
  const token = getSessionToken();
  if (token) {
    const prisma = getPrisma();
    await prisma.memberSession.deleteMany({ where: { token } });
  }
  clearSessionToken();
  return { ok: true };
}

export async function handleGetMemberDashboard() {
  const member = await getMemberFromSession();
  if (!member) return null;
  return buildDashboard(member);
}

export async function handleSetBuildFocus(focus: "life" | "digital" | "mind" | "all") {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");
  const prisma = getPrisma();
  await prisma.member.update({
    where: { id: member.id },
    data: { buildFocus: focus },
  });
  await evaluateAchievements(member.id);
  await bumpStreak(member.id);
  return { ok: true };
}

export async function handleSaveIdentity(data: Record<string, string>) {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");
  const prisma = getPrisma();
  await prisma.member.update({
    where: { id: member.id },
    data: { identityJson: JSON.stringify(data) },
  });
  await computeProofSnapshot(member.id);
  await evaluateAchievements(member.id);
  await bumpStreak(member.id);
  return { ok: true };
}

export async function handleSaveChecklist(slug: string, checked: number[]) {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");
  const prisma = getPrisma();
  const deliverable = await prisma.deliverable.findUnique({ where: { slug } });
  if (!deliverable) throw new Error("Deliverable not found");
  await prisma.memberDeliverable.update({
    where: {
      memberId_deliverableId: { memberId: member.id, deliverableId: deliverable.id },
    },
    data: { checklistJson: JSON.stringify(checked) },
  });
  await bumpStreak(member.id);
  return { ok: true };
}

export async function handleCompleteDeliverable(
  slug: string,
  reflectionNote?: string,
) {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");
  await validateDeliverableCompletion(member.id, slug, reflectionNote);
  const prisma = getPrisma();
  const deliverable = await prisma.deliverable.findUnique({ where: { slug } });
  if (!deliverable) throw new Error("Deliverable not found");
  await prisma.memberDeliverable.update({
    where: {
      memberId_deliverableId: { memberId: member.id, deliverableId: deliverable.id },
    },
    data: {
      completedAt: new Date(),
      reflectionNote: reflectionNote ?? undefined,
    },
  });
  await bumpStreak(member.id);
  await computeProofSnapshot(member.id);
  await evaluateAchievements(member.id);
  return { ok: true };
}

export async function handleSaveJournalEntry(body: string, mood?: number) {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");
  const prisma = getPrisma();
  const programDay = getProgramDay(member);
  const prompt = JOURNAL_PROMPTS[Math.min(programDay, 7)] ?? JOURNAL_PROMPTS[0];
  const entry = await prisma.journalEntry.create({
    data: {
      memberId: member.id,
      dayNumber: programDay,
      prompt,
      body,
      mood,
    },
  });
  await bumpStreak(member.id);
  await computeProofSnapshot(member.id);
  await evaluateAchievements(member.id);
  return {
    id: entry.id,
    dayNumber: entry.dayNumber,
    prompt: entry.prompt,
    body: entry.body,
    mood: entry.mood,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function handleGetJournalEntries() {
  const member = await getMemberFromSession();
  if (!member) return null;
  const prisma = getPrisma();
  const entries = await prisma.journalEntry.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return entries.map((j) => ({
    id: j.id,
    dayNumber: j.dayNumber,
    prompt: j.prompt,
    body: j.body,
    mood: j.mood,
    createdAt: j.createdAt.toISOString(),
  }));
}

export async function handleGetPartnerTree() {
  const member = await getMemberFromSession();
  if (!member) return null;
  const prisma = getPrisma();
  const direct = await prisma.member.findMany({
    where: { referredById: member.id },
    select: { id: true, name: true, plan: true, createdAt: true, referralCode: true },
    orderBy: { createdAt: "desc" },
  });
  const earnings = await prisma.referralEarning.findMany({
    where: { earnerId: member.id },
    include: { source: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return {
    referralCode: member.referralCode,
    directPartners: direct.map((d) => ({
      name: d.name,
      plan: d.plan,
      joinedAt: d.createdAt.toISOString(),
      referralCode: d.referralCode,
    })),
    recentEarnings: earnings.map((e) => ({
      from: e.source.name,
      level: e.level,
      amountCents: e.amountCents,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export async function handleSaveMorningMood(energySlug: string) {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");

  const option = resolveMoodOption("energy", energySlug);
  if (!option) throw new Error("Invalid energy mood");

  const prisma = getPrisma();
  const programDay = getProgramDay(member);

  await prisma.moodCheckIn.upsert({
    where: { memberId_programDay: { memberId: member.id, programDay } },
    create: {
      memberId: member.id,
      programDay,
      energySlug: option.slug,
      energyScore: option.value,
      morningAt: new Date(),
    },
    update: {
      energySlug: option.slug,
      energyScore: option.value,
      morningAt: new Date(),
    },
  });

  await bumpStreak(member.id);
  await computeProofSnapshot(member.id);
  await evaluateAchievements(member.id);
  return { ok: true };
}

export async function handleSaveEveningMood(innerSlug: string, momentumSlug: string) {
  const member = await getMemberFromSession();
  if (!member) throw new Error("Not signed in");

  const inner = resolveMoodOption("inner", innerSlug);
  const momentum = resolveMoodOption("momentum", momentumSlug);
  if (!inner || !momentum) throw new Error("Invalid mood selection");

  const prisma = getPrisma();
  const programDay = getProgramDay(member);

  await prisma.moodCheckIn.upsert({
    where: { memberId_programDay: { memberId: member.id, programDay } },
    create: {
      memberId: member.id,
      programDay,
      innerSlug: inner.slug,
      innerScore: inner.value,
      momentumSlug: momentum.slug,
      momentumScore: momentum.value,
      eveningAt: new Date(),
    },
    update: {
      innerSlug: inner.slug,
      innerScore: inner.value,
      momentumSlug: momentum.slug,
      momentumScore: momentum.value,
      eveningAt: new Date(),
    },
  });

  await bumpStreak(member.id);
  await computeProofSnapshot(member.id);
  await evaluateAchievements(member.id);
  return { ok: true };
}

export async function handleGetMoodTimeline() {
  const member = await getMemberFromSession();
  if (!member) return null;

  const prisma = getPrisma();
  const programDay = getProgramDay(member);

  const rows = await prisma.moodCheckIn.findMany({
    where: { memberId: member.id },
    orderBy: { programDay: "desc" },
    take: 30,
  });

  const today = await prisma.moodCheckIn.findUnique({
    where: { memberId_programDay: { memberId: member.id, programDay } },
  });

  return {
    programDay,
    today: today ? formatMoodCheckIn(today) : null,
    points: rows.reverse().map(formatMoodCheckIn),
    morningDone: today?.morningAt != null,
    eveningDone: today?.eveningAt != null,
  };
}
