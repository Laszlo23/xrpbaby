import { storage } from "@/src/utils/storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL ?? "";
const TOKEN_KEY = "fb_access_token";

export type ApiUser = {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  xp: number;
  founding_score: number;
  referral_code: string;
  referral_count: number;
  keys: Record<string, number>;
  mystery_boxes: number;
  badges: string[];
  completed_quests: string[];
  visited_apps: string[];
  last_spin: string | null;
  last_daily_login: string | null;
  profile_completed: boolean;
  farcaster_fid: number | null;
  farcaster_username: string | null;
  level: {
    current: { id: number; name: string; threshold: number };
    next: { id: number; name: string; threshold: number } | null;
    progress: number;
  };
};

export async function setToken(token: string) {
  await storage.secureSet(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return storage.secureGet(TOKEN_KEY, null as unknown as string);
}

export async function clearToken() {
  await storage.secureRemove(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) || `HTTP ${res.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data as T;
}

export const api = {
  // public
  countdown: () =>
    request<{ target_utc: string; seconds_remaining: number; days: number; hours: number; minutes: number; seconds: number; launched: boolean }>(
      "/countdown",
      {},
      false,
    ),
  stats: () => request<{ total_builders: number; total_xp: number; ecosystem_visits: number; completed_profiles: number }>("/stats", {}, false),
  feed: (limit = 30) => request<any[]>(`/feed?limit=${limit}`, {}, false),
  leaderboard: (category = "xp", limit = 50) =>
    request<any[]>(`/leaderboard?category=${category}&limit=${limit}`, {}, false),

  // auth
  register: (b: { username: string; email: string; password: string; referral_code?: string }) =>
    request<{ access_token: string }>("/auth/register", { method: "POST", body: JSON.stringify(b) }, false),
  login: (b: { email: string; password: string }) =>
    request<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify(b) }, false),
  me: () => request<ApiUser>("/auth/me"),
  getNeynarAuthUrl: () => request<{ authorization_url: string }>("/auth/neynar/authorize", {}, false),

  // profile
  linkFarcaster: (b: { fid: number; signer_uuid: string }) =>
    request<ApiUser>("/profile/link-farcaster", { method: "POST", body: JSON.stringify(b) }),
  unlinkFarcaster: () => request<ApiUser>("/profile/link-farcaster", { method: "DELETE" }),
  updateProfile: (b: { avatar?: string; bio?: string }) =>
    request<ApiUser>("/profile", { method: "PATCH", body: JSON.stringify(b) }),
  claimDailyLogin: () => request<{ awarded: boolean; user: ApiUser }>("/profile/daily-login", { method: "POST" }),

  // ecosystem & quests
  ecosystem: () => request<{ slug: string; name: string; url: string; xp: number; description: string }[]>("/ecosystem", {}, false),
  visitEcosystem: (slug: string) =>
    request<{ awarded: boolean; xp?: number; user: ApiUser }>("/ecosystem/visit", {
      method: "POST",
      body: JSON.stringify({ app_slug: slug }),
    }),
  dailyQuests: () =>
    request<{ slug: string; title: string; description: string; xp: number; icon: string; completed: boolean }[]>(
      "/quests/daily",
    ),
  completeQuest: (slug: string) =>
    request<{ awarded: boolean; xp?: number; user: ApiUser }>("/quests/complete", {
      method: "POST",
      body: JSON.stringify({ quest_slug: slug }),
    }),
  communityMissions: () =>
    request<{ slug: string; title: string; description: string; goal: number; reward_xp: number; progress: number; percent: number }[]>(
      "/quests/community",
      {},
      false,
    ),

  // inventory
  openMysteryBox: () =>
    request<{ reward: { type: string; key?: string; amount?: number; name?: string; description?: string }; user: ApiUser }>("/mystery-box/open", {
      method: "POST",
    }),
  spinStatus: () => request<{ can_spin: boolean; next_at: string | null }>("/spin/status"),
  spin: () =>
    request<{ segment_index: number; segment: { type: string; label: string; amount?: number; key?: string }; user: ApiUser }>("/spin", {
      method: "POST",
    }),

  // social
  shareX: () => request<{ awarded: boolean; xp: number; user: ApiUser }>("/share/x", { method: "POST" }),
  shareFarcaster: () => request<{ awarded: boolean; xp: number; user: ApiUser }>("/share/farcaster", { method: "POST" }),
  shareTelegram: () => request<{ awarded: boolean; xp: number; user: ApiUser }>("/share/telegram", { method: "POST" }),

  // mayor
  mayorChat: (message: string, session_id?: string) =>
    request<{ reply: string; session_id: string }>("/mayor/chat", {
      method: "POST",
      body: JSON.stringify({ message, session_id }),
    }),
  mayorHistory: (session_id?: string) =>
    request<{ id: string; role: "user" | "mayor"; text: string; ts: string }[]>(
      `/mayor/history${session_id ? `?session_id=${encodeURIComponent(session_id)}` : ""}`,
    ),
};
