import { NextResponse } from "next/server";
import { ensureReferralCode } from "@/lib/community-queries";
import { getPool } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/get-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ error: "database_unconfigured" }, { status: 503 });
  }
  try {
    const code = await ensureReferralCode(pool, session.userId);
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
    const link = origin ? `${origin}/community?ref=${encodeURIComponent(code)}` : "";
    return NextResponse.json({ code, link });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "query failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}
