import type { PrismaClient } from "@prisma/client";
import { hasCheckedInToday } from "@/server/tg/streak";

export type TgTaskStatus = "available" | "completed" | "locked";

export type TgTaskDef = {
  id: string;
  title: string;
  subtitle: string;
  xpReward: number;
  kind: "tap" | "emoji" | "quiz" | "share" | "thanks" | "wallet" | "voice";
  unlockAfter?: string[];
  anytime?: boolean;
};

export const TG_TASKS: TgTaskDef[] = [
  {
    id: "daily_checkin",
    title: "Daily tap-in",
    subtitle: "You're here. That's the work.",
    xpReward: 20,
    kind: "tap",
  },
  {
    id: "wave_hello",
    title: "Wave to the grove",
    subtitle: "Say hi to the community.",
    xpReward: 15,
    kind: "tap",
    unlockAfter: ["daily_checkin"],
  },
  {
    id: "mood_vote",
    title: "Today's vibe",
    subtitle: "Pick the grove mood.",
    xpReward: 10,
    kind: "emoji",
    unlockAfter: ["wave_hello"],
  },
  {
    id: "culture_quiz_1",
    title: "Quick culture quiz",
    subtitle: "One question. No stress.",
    xpReward: 25,
    kind: "quiz",
    unlockAfter: ["mood_vote"],
  },
  {
    id: "share_invite",
    title: "Invite a friend",
    subtitle: "Drop your link in the group.",
    xpReward: 30,
    kind: "share",
    unlockAfter: ["culture_quiz_1"],
  },
  {
    id: "say_thanks",
    title: "Thank a builder",
    subtitle: "Pick a thank-you — spread good vibes.",
    xpReward: 20,
    kind: "thanks",
    anytime: true,
  },
  {
    id: "ton_bonus",
    title: "Wallet bonus",
    subtitle: "Connect TON for a bonus badge.",
    xpReward: 50,
    kind: "wallet",
    unlockAfter: ["culture_quiz_1"],
  },
  {
    id: "builder_voice",
    title: "Builder Voice",
    subtitle: "Earn Culture Points for useful product feedback (not “all good”).",
    xpReward: 0,
    kind: "voice",
    anytime: true,
  },
];

export const MOOD_OPTIONS = [
  { id: "fire", emoji: "🔥", label: "On fire" },
  { id: "chill", emoji: "🌿", label: "Chill grove" },
  { id: "build", emoji: "🧱", label: "Build mode" },
] as const;

export const THANKS_PRESETS = [
  "Thanks for welcoming new members!",
  "Appreciate the good vibes in the group.",
  "Grateful for builders who show up daily.",
] as const;

export const CULTURE_QUIZ = {
  id: "culture_quiz_1",
  question: "What is Building Culture about?",
  options: [
    { id: "a", label: "One person, one block — grow together" },
    { id: "b", label: "Only trading tokens" },
    { id: "c", label: "A solo wallet app" },
  ],
  correctId: "a",
} as const;

const TASK_MAP = new Map(TG_TASKS.map((t) => [t.id, t]));

export function getTaskDef(taskId: string): TgTaskDef | undefined {
  return TASK_MAP.get(taskId);
}

export async function loadCompletedTaskIds(
  prisma: PrismaClient,
  memberId: string,
): Promise<Set<string>> {
  const rows = await prisma.activityEvent.findMany({
    where: { memberId, type: "tg:task_completed" },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { payload: true },
  });
  const done = new Set<string>();
  for (const row of rows) {
    const payload =
      row.payload && typeof row.payload === "object"
        ? (row.payload as Record<string, unknown>)
        : null;
    const taskId = typeof payload?.taskId === "string" ? payload.taskId : undefined;
    if (taskId) done.add(taskId);
  }
  return done;
}

export async function isTonConnected(prisma: PrismaClient, memberId: string): Promise<boolean> {
  return (
    (await prisma.activityEvent.findFirst({
      where: { memberId, type: "tg:ton_wallet_connected" },
      select: { id: true },
    })) !== null
  );
}

export function taskStatus(
  task: TgTaskDef,
  completed: Set<string>,
  tonConnected: boolean,
): TgTaskStatus {
  if (completed.has(task.id)) return "completed";
  if (task.id === "ton_bonus") {
    if (!tonConnected && !completed.has("ton_bonus")) {
      const prereqs = task.unlockAfter ?? [];
      const unlocked = prereqs.every((id) => completed.has(id));
      return unlocked ? "available" : "locked";
    }
    return completed.has("ton_bonus") ? "completed" : "available";
  }
  if (task.unlockAfter?.length) {
    const unlocked = task.unlockAfter.every((id) => completed.has(id));
    if (!unlocked) return "locked";
  }
  if (task.id === "daily_checkin" && completed.has("daily_checkin")) {
    return "completed";
  }
  return "available";
}

export async function resolveTaskStatuses(
  prisma: PrismaClient,
  memberId: string,
): Promise<Array<TgTaskDef & { status: TgTaskStatus }>> {
  const completed = await loadCompletedTaskIds(prisma, memberId);
  const tonConnected = await isTonConnected(prisma, memberId);
  const checkedInToday = await hasCheckedInToday(prisma, memberId);

  return TG_TASKS.map((task) => {
    let status = taskStatus(task, completed, tonConnected);
    if (task.id === "daily_checkin" && checkedInToday) status = "completed";
    return { ...task, status };
  });
}

export function forestStageFromLevel(level: number): string {
  if (level >= 6) return "tree";
  if (level >= 3) return "sapling";
  return "seedling";
}

export function nextAvailableTask(
  tasks: Array<TgTaskDef & { status: TgTaskStatus }>,
): (TgTaskDef & { status: TgTaskStatus }) | null {
  const chain = ["daily_checkin", "wave_hello", "mood_vote", "culture_quiz_1", "share_invite"];
  for (const id of chain) {
    const t = tasks.find((x) => x.id === id);
    if (t && t.status === "available") return t;
  }
  const thanks = tasks.find((x) => x.id === "say_thanks" && x.status === "available");
  if (thanks) return thanks;
  return null;
}

export function coreMissionsCompleted(tasks: Array<TgTaskDef & { status: TgTaskStatus }>): number {
  const core = ["daily_checkin", "wave_hello", "mood_vote", "culture_quiz_1"];
  return core.filter((id) => tasks.find((t) => t.id === id)?.status === "completed").length;
}
