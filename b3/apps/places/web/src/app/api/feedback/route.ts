import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/get-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  let body: { message?: string; email?: string; category?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (message.length < 10) {
    return NextResponse.json({ error: "message_too_short" }, { status: 400 });
  }
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: "database_unconfigured" }, { status: 503 });
  }
  const email = typeof body.email === "string" ? body.email.slice(0, 200) : null;
  const category = typeof body.category === "string" ? body.category.slice(0, 40) : "general";

  const webhook = process.env.FEEDBACK_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.slice(0, 8000),
          email,
          category,
          wallet: session?.address ?? null,
          t: new Date().toISOString(),
        }),
      });
    } catch {
      /* non-fatal */
    }
  }

  try {
    await pool.query(
      `INSERT INTO feedback_submissions (user_id, wallet_address, email, category, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        session?.userId ?? null,
        session?.address?.toLowerCase() ?? null,
        email,
        category,
        message.slice(0, 8000),
      ],
    );
    if (session) {
      await pool.query(
        `INSERT INTO task_events (user_id, task_id, day, payload)
         VALUES ($1, 'feedback_submitted', '2000-01-02'::date, NULL)
         ON CONFLICT (user_id, task_id, day) DO NOTHING`,
        [session.userId],
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "save failed";
    if (msg.includes("feedback_submissions") || msg.includes("does not exist")) {
      return NextResponse.json(
        { error: "feedback_table_missing", hint: "Run web/sql/feedback_schema.sql" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
