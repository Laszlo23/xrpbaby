import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/get-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: "database_unconfigured" }, { status: 503 });
  }
  let body: { refCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const refCode = typeof body.refCode === "string" ? body.refCode.trim().toLowerCase() : "";
  if (!refCode || refCode.length < 4) {
    return NextResponse.json({ error: "invalid_ref" }, { status: 400 });
  }
  try {
    const ref = await pool.query<{ user_id: number }>(`SELECT user_id FROM referral_codes WHERE code = $1`, [refCode]);
    if (ref.rows.length === 0) {
      return NextResponse.json({ error: "unknown_ref" }, { status: 404 });
    }
    const referrerUserId = ref.rows[0].user_id;
    if (referrerUserId === session.userId) {
      return NextResponse.json({ ok: true, attached: false, reason: "self" });
    }
    const ins = await pool.query(
      `INSERT INTO referrals (referrer_user_id, referee_user_id)
       VALUES ($1, $2)
       ON CONFLICT (referee_user_id) DO NOTHING
       RETURNING id`,
      [referrerUserId, session.userId],
    );
    const attached = ins.rowCount === 1;
    return NextResponse.json({ ok: true, attached });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "query failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
