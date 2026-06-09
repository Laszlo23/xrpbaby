import { captureTelegramEvent } from "@/lib/analytics";
import { telegramAuthHeaders } from "@/lib/tg/telegram-webapp";

export type TgApiError = { ok: false; error: string };

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { ok: false, error: text || res.statusText };
  }
}

export async function tgFetch<T>(
  path: string,
  init?: RequestInit & { initDataRaw?: string | null },
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string; body: unknown }> {
  const headers = {
    ...telegramAuthHeaders(init?.initDataRaw),
    ...(init?.headers as Record<string, string> | undefined),
  };
  const res = await fetch(path, { ...init, headers });
  const body = await parseJson(res);
  if (!res.ok) {
    const err =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof (body as TgApiError).error === "string"
        ? (body as TgApiError).error
        : res.statusText;
    return { ok: false, status: res.status, error: err, body };
  }
  return { ok: true, data: body as T };
}

export type TgAuthResponse = {
  ok: true;
  member: { id: string; walletAddress: string | null; telegramUserId: string };
  session: { expiresAt: string };
  progression: { level: number; xp: number; nextLevelXp: number };
};

export type TgMeResponse = {
  ok: true;
  member: { id: string; displayName: string; walletAddress: string | null };
  wallets: {
    tonConnected: boolean;
    tonWalletAddress: string | null;
    tonWalletApp: string | null;
    evmConnected: boolean;
  };
  gamification: {
    level: number;
    xp: number;
    nextLevelXp: number;
    streakDays: number;
    forestStage?: string;
    badges: string[];
  };
};

export type TgTask = {
  id: string;
  title: string;
  subtitle: string;
  xpReward: number;
  kind: "tap" | "emoji" | "quiz" | "share" | "thanks" | "wallet";
  status: "available" | "completed" | "locked";
  anytime?: boolean;
};

export type TgHomeResponse = {
  ok: true;
  member: { id: string; displayName: string; walletAddress: string | null; blockNumber: number };
  wallets: { tonConnected: boolean; tonWalletAddress: string | null };
  gamification: {
    level: number;
    xp: number;
    nextLevelXp: number;
    streakDays: number;
    forestStage: string;
    checkedInToday: boolean;
    coreMissionsCompleted: number;
  };
  currentMission: TgTask | null;
  tasks: TgTask[];
};

export type TgTasksResponse = {
  ok: true;
  tasks: TgTask[];
  moodOptions: Array<{ id: string; emoji: string; label: string }>;
  thanksPresets: readonly string[];
  quiz: {
    id: string;
    question: string;
    options: Array<{ id: string; label: string }>;
    correctId: string;
  };
};

export type TgLeaderboardResponse = {
  ok: true;
  rows: Array<{ rank: number; displayName: string; points: number; isYou: boolean }>;
  you: { rank: number | null; points: number; xpBehindNext: number | null };
};

export type TgQuest = {
  id: string;
  type: string;
  title: string;
  xpReward: number;
  status: "available" | "completed" | "locked";
};

export type TgModule = {
  id: string;
  title: string;
  durationMin: number;
  xpReward: number;
  status: "available" | "completed" | "locked";
};

export async function tgAuth(initDataRaw?: string | null) {
  const result = await tgFetch<TgAuthResponse>("/api/tg/auth", {
    method: "POST",
    body: JSON.stringify({}),
    initDataRaw,
  });
  if (result.ok) captureTelegramEvent("tg_auth_success");
  return result;
}

export async function tgMe(initDataRaw?: string | null) {
  return tgFetch<TgMeResponse>("/api/tg/me", { method: "GET", initDataRaw });
}

export async function tgQuests(initDataRaw?: string | null) {
  return tgFetch<{ ok: true; quests: TgQuest[] }>("/api/tg/quests", { method: "GET", initDataRaw });
}

export async function tgClaimQuest(questId: string, initDataRaw?: string | null) {
  const result = await tgFetch<{
    ok: true;
    xpGranted: number;
    progression: { level: number; xp: number };
  }>("/api/tg/quests/claim", { method: "POST", body: JSON.stringify({ questId }), initDataRaw });
  if (result.ok) captureTelegramEvent("tg_quest_claimed", { questId });
  return result;
}

export async function tgTonConnected(
  walletAddress: string,
  walletApp?: string,
  initDataRaw?: string | null,
) {
  const result = await tgFetch<{ ok: true }>("/api/tg/wallet/ton-connected", {
    method: "POST",
    body: JSON.stringify({ walletAddress, walletApp }),
    initDataRaw,
  });
  if (result.ok) captureTelegramEvent("tg_wallet_connected_ton", { walletApp });
  return result;
}

export async function tgLearnModules(initDataRaw?: string | null) {
  return tgFetch<{ ok: true; modules: TgModule[] }>("/api/tg/learn/modules", {
    method: "GET",
    initDataRaw,
  });
}

export async function tgLearnComplete(
  moduleId: string,
  proof: { quizScore?: number; gratitudeType?: string; gratitudeNote?: string },
  initDataRaw?: string | null,
) {
  const result = await tgFetch<{ ok: true; xpGranted: number }>("/api/tg/learn/complete", {
    method: "POST",
    body: JSON.stringify({ moduleId, proof }),
    initDataRaw,
  });
  if (result.ok) {
    captureTelegramEvent("tg_learning_module_completed", { moduleId });
    if (moduleId === "m_gratitude_support_loop") {
      captureTelegramEvent("tg_gratitude_sent", { gratitudeType: proof.gratitudeType });
    }
  }
  return result;
}

export async function tgHome(initDataRaw?: string | null) {
  return tgFetch<TgHomeResponse>("/api/tg/home", { method: "GET", initDataRaw });
}

export async function tgTasks(initDataRaw?: string | null) {
  return tgFetch<TgTasksResponse>("/api/tg/tasks", { method: "GET", initDataRaw });
}

export async function tgCompleteTask(
  taskId: string,
  payload?: { moodId?: string; quizAnswerId?: string; thanksPreset?: string },
  initDataRaw?: string | null,
) {
  const result = await tgFetch<{
    ok: true;
    xpGranted: number;
    streakDays: number;
    progression: { level: number; xp: number; nextLevelXp: number };
  }>("/api/tg/tasks/complete", {
    method: "POST",
    body: JSON.stringify({ taskId, ...payload }),
    initDataRaw,
  });
  if (result.ok) captureTelegramEvent("tg_task_completed", { taskId, xp: result.data.xpGranted });
  return result;
}

export async function tgLeaderboard(initDataRaw?: string | null, limit = 10) {
  return tgFetch<TgLeaderboardResponse>(`/api/tg/leaderboard?limit=${limit}`, {
    method: "GET",
    initDataRaw,
  });
}

export async function tgXrpQuote(amount: string, initDataRaw?: string | null) {
  const q = new URLSearchParams({ base: "XRP", quote: "USD", amount, mode: "learn" });
  const result = await tgFetch<Record<string, unknown>>(`/api/market/xrp-quote?${q}`, {
    method: "GET",
    initDataRaw,
  });
  if (result.ok) captureTelegramEvent("tg_xrp_quote_requested", { amount });
  return result;
}
