import { NextRequest, NextResponse } from "next/server";
import { scoreMessageText } from "@/lib/risk/heuristics";

/**
 * POST { "text": "..." } -> { score, flags }
 * For admin dashboards and client-side pre-checks. Does not store messages.
 */
export async function POST(req: NextRequest) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text : "";
  const { score, flags } = scoreMessageText(text);
  return NextResponse.json({ score, flags });
}
