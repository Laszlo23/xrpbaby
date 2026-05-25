import { levelFromXp } from "./gamification";
import type { TaskId } from "./tasks";

export type MiniUserRow = {
  fid: number;
  xp: number;
  level: number;
  updated_at: string;
};

export type MiniTaskCompletionRow = {
  fid: number;
  task_id: string;
  completed_at: string;
  proof: string | null;
};

type D1Like = D1Database;

const memoryUsers = new Map<number, MiniUserRow>();
const memoryCompletions = new Map<string, MiniTaskCompletionRow>();

function completionKey(fid: number, taskId: string): string {
  return `${fid}:${taskId}`;
}

async function getDb(): Promise<D1Like | null> {
  try {
    const mod = await import("cloudflare:workers");
    const env = mod.env as { DB?: D1Like };
    return env.DB ?? null;
  } catch {
    return null;
  }
}

export async function getOrCreateUser(fid: number): Promise<MiniUserRow> {
  const db = await getDb();
  const now = new Date().toISOString();

  if (!db) {
    const existing = memoryUsers.get(fid);
    if (existing) return existing;
    const row: MiniUserRow = { fid, xp: 0, level: 1, updated_at: now };
    memoryUsers.set(fid, row);
    return row;
  }

  const found = await db
    .prepare("SELECT fid, xp, level, updated_at FROM mini_user WHERE fid = ?")
    .bind(fid)
    .first<MiniUserRow>();

  if (found) return found;

  await db
    .prepare(
      "INSERT INTO mini_user (fid, xp, level, updated_at) VALUES (?, 0, 1, ?)",
    )
    .bind(fid, now)
    .run();

  return { fid, xp: 0, level: 1, updated_at: now };
}

export async function getCompletedTaskIds(fid: number): Promise<Set<string>> {
  const db = await getDb();

  if (!db) {
    const ids = new Set<string>();
    for (const [key, row] of memoryCompletions) {
      if (key.startsWith(`${fid}:`)) ids.add(row.task_id);
    }
    return ids;
  }

  const { results } = await db
    .prepare("SELECT task_id FROM mini_task_completion WHERE fid = ?")
    .bind(fid)
    .all<{ task_id: string }>();

  return new Set((results ?? []).map((r: { task_id: string }) => r.task_id));
}

export async function completeTask(
  fid: number,
  taskId: TaskId,
  xpReward: number,
  proof?: string,
): Promise<MiniUserRow> {
  const db = await getDb();
  const now = new Date().toISOString();
  const user = await getOrCreateUser(fid);
  const newXp = user.xp + xpReward;
  const { level } = levelFromXp(newXp);

  if (!db) {
    memoryCompletions.set(completionKey(fid, taskId), {
      fid,
      task_id: taskId,
      completed_at: now,
      proof: proof ?? null,
    });
    const updated: MiniUserRow = {
      fid,
      xp: newXp,
      level,
      updated_at: now,
    };
    memoryUsers.set(fid, updated);
    return updated;
  }

  await db.batch([
    db
      .prepare(
        `INSERT INTO mini_task_completion (fid, task_id, completed_at, proof)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(fid, task_id) DO NOTHING`,
      )
      .bind(fid, taskId, now, proof ?? null),
    db
      .prepare(
        "UPDATE mini_user SET xp = ?, level = ?, updated_at = ? WHERE fid = ?",
      )
      .bind(newXp, level, now, fid),
  ]);

  return { fid, xp: newXp, level, updated_at: now };
}

export async function getLeaderboard(
  limit = 50,
): Promise<Array<MiniUserRow & { rank: number }>> {
  const db = await getDb();

  if (!db) {
    return [...memoryUsers.values()]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit)
      .map((u, i) => ({ ...u, rank: i + 1 }));
  }

  const { results } = await db
    .prepare(
      "SELECT fid, xp, level, updated_at FROM mini_user ORDER BY xp DESC LIMIT ?",
    )
    .bind(limit)
    .all<MiniUserRow>();

  return (results ?? []).map((u: MiniUserRow, i: number) => ({
    ...u,
    rank: i + 1,
  }));
}
