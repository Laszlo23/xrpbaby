import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ posts: [] });
  }
  try {
    const r = await pool.query<{ id: number; title: string; body: string; published_at: string }>(
      `SELECT id, title, body, published_at FROM platform_posts ORDER BY published_at DESC LIMIT 20`,
    );
    return NextResponse.json({ posts: r.rows });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
