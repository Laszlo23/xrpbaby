import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { ensureUserProfile, getProfileByUserId } from "@/lib/community-queries";
import { getSessionFromCookies } from "@/lib/get-session";

export const dynamic = "force-dynamic";

const ALLOWED_TASKS = new Set(["daily_login", "share_property", "profile_completed"]);

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: "database_unconfigured" }, { status: 503 });
  }
  let body: { taskId?: string; metadata?: { propertyId?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const taskId = typeof body.taskId === "string" ? body.taskId : "";
  if (!ALLOWED_TASKS.has(taskId)) {
    return NextResponse.json({ error: "invalid_task" }, { status: 400 });
  }
  const day =
    taskId === "profile_completed"
      ? "2000-01-01"
      : new Date().toISOString().slice(0, 10);
  let payload: Record<string, unknown> | null = null;
  if (taskId === "share_property") {
    const pid = body.metadata?.propertyId;
    if (typeof pid !== "string" || !/^\d+$/.test(pid)) {
      return NextResponse.json({ error: "metadata_property_required" }, { status: 400 });
    }
    payload = { propertyId: pid };
  }

  try {
    await ensureUserProfile(pool, session.userId);
    if (taskId === "profile_completed") {
      const prof = await getProfileByUserId(pool, session.userId);
      const ok =
        Boolean(prof?.display_name?.trim()) ||
        Boolean(prof?.bio?.trim()) ||
        Boolean(
          (prof?.twitter ?? prof?.discord ?? prof?.farcaster ?? prof?.telegram ?? prof?.website ?? "").trim(),
        );
      if (!ok) {
        return NextResponse.json({ error: "profile_not_complete_enough" }, { status: 400 });
      }
    }
    const r = await pool.query(
      `INSERT INTO task_events (user_id, task_id, day, payload)
       VALUES ($1, $2, $3::date, $4::jsonb)
       ON CONFLICT (user_id, task_id, day) DO NOTHING
       RETURNING id`,
      [session.userId, taskId, day, payload ? JSON.stringify(payload) : null],
    );
    const claimed = r.rowCount === 1;
    return NextResponse.json({ ok: true, claimed, taskId, day });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "query failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
