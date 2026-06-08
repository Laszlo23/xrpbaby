const TELEGRAM_API_BASE = "https://api.telegram.org";

export type PostTelegramResult =
  | { ok: true; messageId: number; url?: string }
  | { ok: false; error: string };

function groveTelegramBotToken(): string | undefined {
  return (
    process.env.GROVE_TELEGRAM_BOT_TOKEN?.trim() ||
    process.env.TELEGRAM_BOT_TOKEN?.trim() ||
    undefined
  );
}

export function groveTelegramConfigured(): boolean {
  return Boolean(groveTelegramBotToken() && process.env.GROVE_TELEGRAM_CHAT_ID?.trim());
}

export async function postGroveTelegramMessage(text: string): Promise<PostTelegramResult> {
  const token = groveTelegramBotToken();
  const chatId = process.env.GROVE_TELEGRAM_CHAT_ID?.trim();
  const topicIdRaw = process.env.GROVE_TELEGRAM_TOPIC_ID?.trim();
  const topicId = topicIdRaw ? Number(topicIdRaw) : undefined;
  if (!token || !chatId) return { ok: false, error: "telegram_not_configured" };

  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "empty_text" };

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: trimmed.slice(0, 4000),
    disable_web_page_preview: true,
  };
  if (Number.isFinite(topicId)) body.message_thread_id = topicId;

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    const raw = await res.text();
    let parsed: { ok?: boolean; result?: { message_id?: number }; description?: string } = {};
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      /* ignore parse errors */
    }

    if (!res.ok || !parsed.ok || !parsed.result?.message_id) {
      return { ok: false, error: parsed.description || raw.slice(0, 180) || `http_${res.status}` };
    }

    return { ok: true, messageId: parsed.result.message_id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "telegram_post_failed" };
  }
}
