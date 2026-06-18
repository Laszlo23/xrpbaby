import type { Member } from "@/generated/prisma/client";
import { ACHIEVEMENT_DEFS } from "@/lib/achievements-data";
import { getPrisma } from "@/lib/db.server";
import { isPeriodContainingDay7 } from "@/lib/proof-data";

export function getProgramStartDate(member: Member): Date {
  return member.programStartDate ?? member.createdAt;
}

export function getProgramDay(member: Member): number {
  const start = getProgramStartDate(member);
  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - startDay.getTime()) / 86_400_000);
}

export function parseIdentityJson(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    /* ignore */
  }
  return {};
}

export function parseChecklistJson(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((n): n is number => typeof n === "number");
    }
  } catch {
    /* ignore */
  }
  return [];
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function lastActiveKey(date: Date | null): string | null {
  if (!date) return null;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export async function bumpStreak(memberId: string): Promise<number> {
  const prisma = getPrisma();
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return 0;

  const today = todayKey();
  const last = lastActiveKey(member.lastActiveDate);

  if (last === today) return member.streak;

  let streak = member.streak;
  if (!last) {
    streak = 1;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = lastActiveKey(yesterday);
    streak = last === yesterdayKey ? member.streak + 1 : 1;
  }

  await prisma.member.update({
    where: { id: memberId },
    data: { streak, lastActiveDate: new Date() },
  });

  return streak;
}

export async function syncUnlockedDeliverables(
  memberId: string,
  trackSlug: string,
  programDay: number,
): Promise<void> {
  const prisma = getPrisma();
  const deliverables = await prisma.deliverable.findMany({
    where: {
      dayNumber: { lte: programDay },
      OR: [{ trackSlug: null }, { trackSlug }],
    },
  });

  for (const d of deliverables) {
    await prisma.memberDeliverable.upsert({
      where: {
        memberId_deliverableId: { memberId, deliverableId: d.id },
      },
      create: { memberId, deliverableId: d.id },
      update: {},
    });
  }
}

async function awardAchievement(memberId: string, slug: string): Promise<void> {
  const def = ACHIEVEMENT_DEFS.find((a) => a.slug === slug);
  if (!def) return;

  const prisma = getPrisma();
  await prisma.memberAchievement.upsert({
    where: { memberId_slug: { memberId, slug } },
    create: {
      memberId,
      slug,
      title: def.title,
      description: def.description,
    },
    update: {},
  });
}

export async function evaluateAchievements(memberId: string): Promise<void> {
  const prisma = getPrisma();
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      deliverables: { include: { deliverable: true } },
      achievements: true,
    },
  });
  if (!member) return;

  await awardAchievement(memberId, "showed-up");

  const identity = parseIdentityJson(member.identityJson);
  const identityFilled = ["q1", "q2", "q3", "q4", "q5"].every((k) => identity[k]?.trim());
  if (identityFilled) await awardAchievement(memberId, "identity-signed");

  const trackDay1 = member.deliverables.find(
    (d) => d.deliverable.dayNumber === 1 && d.deliverable.trackSlug === member.trackSlug,
  );
  if (trackDay1?.completedAt) await awardAchievement(memberId, "day-one-done");

  const anchoredWeekOne = await prisma.proofSnapshot.findFirst({
    where: {
      memberId,
      status: "anchored",
      anchor: { isNot: null },
    },
    include: { anchor: true },
  });
  if (anchoredWeekOne && isPeriodContainingDay7(anchoredWeekOne.periodKey)) {
    await awardAchievement(memberId, "week-one-proof");
  }

  if (member.streak >= 3) await awardAchievement(memberId, "streak-3");
  if (member.streak >= 7) await awardAchievement(memberId, "streak-7");

  const referrals = await prisma.member.count({ where: { referredById: memberId } });
  if (referrals > 0) await awardAchievement(memberId, "first-partner");

  const focus = member.buildFocus;
  if (focus === "mind" || focus === "all") await awardAchievement(memberId, "builder-mind");
  if (focus === "life" || focus === "all") await awardAchievement(memberId, "builder-life");
  if (focus === "digital" || focus === "all") await awardAchievement(memberId, "builder-digital");

  const completeMoodDays = await prisma.moodCheckIn.count({
    where: {
      memberId,
      morningAt: { not: null },
      eveningAt: { not: null },
    },
  });
  if (completeMoodDays >= 7) await awardAchievement(memberId, "mood-week");
}
