import {
  readTelegramInitDataRaw,
  validateTelegramInitData,
  type TelegramInitData,
} from "@/server/tg/init-data";

type RequireTelegramAuthResult =
  | { ok: true; initData: TelegramInitData }
  | { ok: false; status: number; error: string };

function parseDevUserHeader(raw: string): TelegramInitData | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.startsWith("{")) {
      const parsed = JSON.parse(trimmed) as { id?: number; username?: string; first_name?: string };
      if (!Number.isFinite(parsed.id) || Number(parsed.id) <= 0) return null;
      return {
        user: {
          id: Number(parsed.id),
          username: parsed.username,
          first_name: parsed.first_name ?? "Dev",
        },
        authDate: Math.floor(Date.now() / 1000),
        hash: "dev",
        raw: "dev",
      };
    }
    const id = Number(trimmed);
    if (!Number.isFinite(id) || id <= 0) return null;
    return {
      user: { id, first_name: "Dev" },
      authDate: Math.floor(Date.now() / 1000),
      hash: "dev",
      raw: "dev",
    };
  } catch {
    return null;
  }
}

/**
 * Validates Telegram init-data from Authorization header or request body.
 * Local convenience: in non-production, `x-telegram-dev-user` bypasses signature checks.
 */
export function requireTelegramAuth(
  request: Request,
  opts?: { initDataRaw?: string },
): RequireTelegramAuthResult {
  if (process.env.NODE_ENV !== "production") {
    const devHeader = request.headers.get("x-telegram-dev-user");
    if (devHeader) {
      const dev = parseDevUserHeader(devHeader);
      if (dev) return { ok: true, initData: dev };
      return { ok: false, status: 400, error: "invalid_dev_user_header" };
    }
  }

  const initRaw = readTelegramInitDataRaw(request.headers.get("authorization"), opts?.initDataRaw);
  if (!initRaw) return { ok: false, status: 401, error: "missing_init_data" };

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!botToken) return { ok: false, status: 503, error: "telegram_not_configured" };
  const maxAgeSec = Number(process.env.TELEGRAM_INITDATA_MAX_AGE_SEC ?? "3600");

  try {
    const initData = validateTelegramInitData(initRaw, botToken, { maxAgeSec });
    return { ok: true, initData };
  } catch (error) {
    return {
      ok: false,
      status: 401,
      error: error instanceof Error ? error.message : "invalid_init_data",
    };
  }
}
