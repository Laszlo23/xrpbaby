import type { PrismaClient } from "@prisma/client";
import {
  CULTURE_QUIZ,
  getTaskDef,
  loadCompletedTaskIds,
  isTonConnected,
  taskStatus,
  forestStageFromLevel,
} from "@/server/tg/tasks";
import { computeStreakDays, hasCheckedInToday, streakBonusXp } from "@/server/tg/streak";
import { getCulturePoints, progressionFromPoints } from "@/server/tg/member";

export type CompleteTaskInput = {
  taskId: string;
  moodId?: string;
  quizAnswerId?: string;
  thanksPreset?: string;
};

export async function completeTelegramTask(
  prisma: PrismaClient,
  memberId: string,
  walletId: string | null,
  input: CompleteTaskInput,
): Promise<
  | {
      ok: true;
      xpGranted: number;
      streakDays: number;
      progression: ReturnType<typeof progressionFromPoints>;
    }
  | { ok: false; error: string; status: number }
> {
  const task = getTaskDef(input.taskId);
  if (!task) return { ok: false, error: "unknown_task", status: 404 };
  if (!walletId) return { ok: false, error: "wallet_not_linked", status: 409 };

  const completed = await loadCompletedTaskIds(prisma, memberId);
  const tonConnected = await isTonConnected(prisma, memberId);
  const status = taskStatus(task, completed, tonConnected);

  if (task.id === "daily_checkin") {
    if (await hasCheckedInToday(prisma, memberId)) {
      const points = await getCulturePoints(prisma, walletId);
      return {
        ok: true,
        xpGranted: 0,
        streakDays: await computeStreakDays(prisma, memberId),
        progression: progressionFromPoints(points),
      };
    }
  } else if (status === "completed") {
    const points = await getCulturePoints(prisma, walletId);
    return {
      ok: true,
      xpGranted: 0,
      streakDays: await computeStreakDays(prisma, memberId),
      progression: progressionFromPoints(points),
    };
  } else if (status === "locked") {
    return { ok: false, error: "task_locked", status: 409 };
  }

  if (task.id === "mood_vote") {
    const valid = input.moodId && ["fire", "chill", "build"].includes(input.moodId);
    if (!valid) return { ok: false, error: "invalid_mood", status: 400 };
  }
  if (task.id === "culture_quiz_1") {
    if (input.quizAnswerId !== CULTURE_QUIZ.correctId) {
      return { ok: false, error: "quiz_incorrect", status: 400 };
    }
  }
  if (task.id === "say_thanks") {
    if (!input.thanksPreset?.trim()) return { ok: false, error: "thanks_required", status: 400 };
  }
  if (task.id === "share_invite") {
    /* client opens share sheet; server records on complete tap */
  }
  if (task.id === "ton_bonus") {
    if (!tonConnected) return { ok: false, error: "connect_ton_first", status: 409 };
  }

  let xp = task.xpReward;
  if (task.id === "daily_checkin") {
    const streakBefore = await computeStreakDays(prisma, memberId);
    const newStreak = streakBefore + 1;
    xp += streakBonusXp(newStreak);
    await prisma.activityEvent.create({
      data: {
        memberId,
        type: "tg:daily_checkin",
        sourceModule: "telegram",
        payload: { taskId: task.id, streakDays: newStreak },
      },
    });
  }

  await prisma.pointLedger.create({
    data: {
      walletId,
      delta: xp,
      reason: "tg_task_reward",
      taskSlug: task.id,
      metadata: { taskId: task.id, source: "telegram" },
    },
  });

  await prisma.activityEvent.create({
    data: {
      memberId,
      type: "tg:task_completed",
      sourceModule: "telegram",
      payload: {
        taskId: task.id,
        xpReward: xp,
        moodId: input.moodId,
        quizAnswerId: input.quizAnswerId,
        thanksPreset: input.thanksPreset,
      },
    },
  });

  if (task.id === "say_thanks") {
    await prisma.activityEvent.create({
      data: {
        memberId,
        type: "tg:gratitude_sent",
        sourceModule: "telegram",
        payload: { gratitudeNote: input.thanksPreset, source: "tg_task" },
      },
    });
  }

  const points = await getCulturePoints(prisma, walletId);
  const progression = progressionFromPoints(points);
  const forestStage = forestStageFromLevel(progression.level);

  await prisma.member.update({
    where: { id: memberId },
    data: { forestStage },
  });

  const streakDays = await computeStreakDays(prisma, memberId);

  return { ok: true, xpGranted: xp, streakDays, progression };
}
