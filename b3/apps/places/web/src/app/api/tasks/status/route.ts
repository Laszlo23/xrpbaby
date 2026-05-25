import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { ensureUserProfile, getProfileByUserId } from "@/lib/community-queries";
import { getSessionFromCookies } from "@/lib/get-session";

export const dynamic = "force-dynamic";

const TASK_WEIGHTS: Record<string, number> = {
  daily_login: 1,
  share_property: 3,
  feedback_submitted: 5,
  profile_completed: 4,
};

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: "database_unconfigured" }, { status: 503 });
  }
  const day = new Date().toISOString().slice(0, 10);
  try {
    await ensureUserProfile(pool, session.userId);
    const profile = await getProfileByUserId(pool, session.userId);

    const counts = await pool.query<{ task_id: string; c: string }>(
      `SELECT task_id, COUNT(*)::text as c FROM task_events WHERE user_id = $1 GROUP BY task_id`,
      [session.userId],
    );
    const totalTasks = await pool.query<{ c: string }>(
      `SELECT COUNT(*)::text as c FROM task_events WHERE user_id = $1`,
      [session.userId],
    );
    const today = await pool.query<{ task_id: string }>(
      `SELECT task_id FROM task_events WHERE user_id = $1 AND day = $2::date`,
      [session.userId, day],
    );

    let points = 0;
    const byTask: Record<string, number> = {};
    for (const row of counts.rows) {
      const n = parseInt(row.c, 10) || 0;
      byTask[row.task_id] = n;
      points += n * (TASK_WEIGHTS[row.task_id] ?? 1);
    }

    const todayIds = new Set(today.rows.map((r) => r.task_id));
    const level = Math.min(10, 1 + Math.floor(points / 15));

    const profileComplete = Boolean(
      profile?.display_name?.trim() ||
        profile?.bio?.trim() ||
        (profile?.twitter ?? profile?.discord ?? profile?.farcaster ?? profile?.telegram ?? profile?.website)?.trim(),
    );

    return NextResponse.json({
      day,
      todayTaskIds: [...todayIds],
      dailyCheckedIn: todayIds.has("daily_login"),
      taskCounts: byTask,
      totalTaskEvents: parseInt(totalTasks.rows[0]?.c ?? "0", 10) || 0,
      points,
      level,
      profileComplete,
      badges: [
        totalTasks.rows[0] && parseInt(totalTasks.rows[0].c, 10) > 0 ? "starter" : null,
        byTask["share_property"] ? "sharer" : null,
        byTask["feedback_submitted"] ? "voice" : null,
        byTask["profile_completed"] ? "profile" : null,
      ].filter(Boolean),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "query failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
