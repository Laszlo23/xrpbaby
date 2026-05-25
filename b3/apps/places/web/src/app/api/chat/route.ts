import { NextRequest, NextResponse } from "next/server";
import { auditChat, hashUserMessage } from "@/lib/chat/audit";
import { completeChat } from "@/lib/chat/inference";
import { buildSystemPrompt, handoffSuggestionLine, type ChatMode } from "@/lib/chat/prompts";
import { rateLimitOk } from "@/lib/chat/rateLimit";
import { getCorpusChunks } from "@/lib/rag/loadCorpus";
import { retrieveTopK } from "@/lib/rag/retrieve";
import { notifyRiskWebhook } from "@/lib/risk/notify";
import { scoreMessageText } from "@/lib/risk/heuristics";

export const runtime = "nodejs";

const HANDOFF_RE = /\b(human|live (?:agent|support)|talk to (?:a )?(?:person|human)|real (?:person|support))\b/i;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function parseMode(raw: unknown): ChatMode {
  if (raw === "sales" || raw === "support" || raw === "education") return raw;
  return "education";
}

async function postHandoffDirect(mode: string, hint: string): Promise<void> {
  const url = process.env.SUPPORT_HANDOFF_URL;
  if (!url) return;
  const includeHint = process.env.SUPPORT_HANDOFF_INCLUDE_HINT === "1";
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.SUPPORT_HANDOFF_SECRET
        ? { "X-Webhook-Secret": process.env.SUPPORT_HANDOFF_SECRET }
        : {}),
    },
    body: JSON.stringify({
      source: "ogchain-web",
      event: "handoff_request",
      mode,
      t: new Date().toISOString(),
      hintHash: hint ? hashUserMessage(hint) : undefined,
      ...(includeHint && hint ? { hint: hint.slice(0, 500) } : {}),
    }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  const limit = Number(process.env.CHAT_RATE_LIMIT_PER_MIN ?? "40");
  const ip = clientIp(req);
  if (!rateLimitOk(`chat:${ip}`, limit, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again shortly." }, { status: 429 });
  }

  let body: {
    messages?: { role: string; content: string }[];
    mode?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const mode = parseMode(body.mode);
  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastText = typeof lastUser?.content === "string" ? lastUser.content : "";
  const risk = scoreMessageText(lastText);
  const userHash = lastText ? hashUserMessage(lastText) : "";

  void notifyRiskWebhook({ score: risk.score, flags: risk.flags, mode, userMessageHash: userHash });

  const wantsHandoff = HANDOFF_RE.test(lastText);
  if (wantsHandoff) {
    void postHandoffDirect(mode, lastText.slice(0, 200));
  }

  const inferenceOk =
    (process.env.INFERENCE_BACKEND === "og_compute" && !!process.env.OG_COMPUTE_INFERENCE_URL) ||
    !!process.env.OPENAI_API_KEY;
  if (!inferenceOk) {
    return NextResponse.json(
      {
        reply:
          "AI chat is not configured. Set OPENAI_API_KEY in web/.env.local (server-only), or set INFERENCE_BACKEND=og_compute with OG_COMPUTE_INFERENCE_URL.",
        riskScore: risk.score,
        riskFlags: risk.flags,
      },
      { status: 200 }
    );
  }

  const chunks = await getCorpusChunks();
  const topK = Number(process.env.CHAT_RAG_TOP_K ?? "4");
  const query = lastText || messages.map((m) => m.content).join(" ");
  const ragChunks = retrieveTopK(query, chunks, topK);

  let systemContent = buildSystemPrompt(mode, ragChunks);
  if (risk.score >= 40) {
    systemContent += `\n\n[Automated risk note: score=${risk.score}, flags=${risk.flags.join(",")}. Respond with a brief safety reminder; never ask for keys or seed phrases.]`;
  }

  const chatMessages = [
    { role: "system" as const, content: systemContent },
    ...messages.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    })),
  ];

  let reply: string;
  let backend: string;
  let model: string;
  try {
    const out = await completeChat(chatMessages, { temperature: 0.35, max_tokens: 800 });
    reply = out.text;
    backend = out.backend;
    model = out.model;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "completion failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (wantsHandoff) {
    reply += handoffSuggestionLine();
  }

  auditChat({
    event: "chat_completion",
    mode,
    riskScore: risk.score,
    riskFlags: risk.flags,
    ragChunkIds: ragChunks.map((c) => c.id),
    userMessageHash: userHash,
    replyChars: reply.length,
    model,
    backend,
  });

  if (risk.score >= 75) {
    auditChat({
      event: "risk_alert",
      mode,
      riskScore: risk.score,
      riskFlags: risk.flags,
      ragChunkIds: [],
      userMessageHash: userHash,
      replyChars: 0,
      model,
      backend,
    });
  }

  return NextResponse.json({
    reply,
    riskScore: risk.score,
    riskFlags: risk.flags,
    ragChunkIds: ragChunks.map((c) => c.id),
  });
}
