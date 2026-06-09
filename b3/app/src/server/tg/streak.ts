import type { PrismaClient } from "@prisma/client";

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function streakBonusXp(streakDays: number): number {
  if (streakDays >= 14) return 20;
  if (streakDays >= 7) return 10;
  if (streakDays >= 3) return 5;
  return 0;
}

export async function computeStreakDays(prisma: PrismaClient, memberId: string): Promise<number> {
  const events = await prisma.activityEvent.findMany({
    where: { memberId, type: "tg:daily_checkin" },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: { createdAt: true },
  });
  if (events.length === 0) return 0;

  const days = new Set(events.map((e) => utcDayKey(e.createdAt)));
  const today = utcDayKey(new Date());
  const yesterday = utcDayKey(new Date(Date.now() - 86_400_000));

  let anchor: string | null = null;
  if (days.has(today)) anchor = today;
  else if (days.has(yesterday)) anchor = yesterday;
  else return 0;

  let streak = 0;
  let cursor = new Date(`${anchor}T12:00:00.000Z`);
  while (days.has(utcDayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

export async function hasCheckedInToday(prisma: PrismaClient, memberId: string): Promise<boolean> {
  const today = utcDayKey(new Date());
  const start = new Date(`${today}T00:00:00.000Z`);
  const end = new Date(`${today}T23:59:59.999Z`);
  const row = await prisma.activityEvent.findFirst({
    where: {
      memberId,
      type: "tg:daily_checkin",
      createdAt: { gte: start, lte: end },
    },
    select: { id: true },
  });
  return row !== null;
}
