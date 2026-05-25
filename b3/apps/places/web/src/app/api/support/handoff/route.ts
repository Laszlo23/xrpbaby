import { NextRequest, NextResponse } from "next/server";
import { hashUserMessage } from "@/lib/chat/audit";

/**
 * POST { "mode"?: string, "hint"?: string } — notifies SUPPORT_HANDOFF_URL (Slack/Discord/Zapier).
 * Does not send raw message content unless SUPPORT_HANDOFF_INCLUDE_HINT=1.
 */
export async function POST(req: NextRequest) {
  const url = process.env.SUPPORT_HANDOFF_URL;
  if (!url) {
    return NextResponse.json(
      { ok: false, error: "SUPPORT_HANDOFF_URL not configured" },
      { status: 503 }
    );
  }

  let body: { mode?: string; hint?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const mode = typeof body.mode === "string" ? body.mode : "unknown";
  const hint = typeof body.hint === "string" ? body.hint : "";
  const includeHint = process.env.SUPPORT_HANDOFF_INCLUDE_HINT === "1";

  const payload = {
    source: "ogchain-web",
    event: "handoff_request",
    mode,
    t: new Date().toISOString(),
    hintHash: hint ? hashUserMessage(hint) : undefined,
    ...(includeHint && hint ? { hint: hint.slice(0, 500) } : {}),
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SUPPORT_HANDOFF_SECRET
          ? { "X-Webhook-Secret": process.env.SUPPORT_HANDOFF_SECRET }
          : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ ok: false, error: t }, { status: 502 });
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "handoff failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
