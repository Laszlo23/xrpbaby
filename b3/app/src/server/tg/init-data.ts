import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramInitUser = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export type TelegramInitData = {
  user: TelegramInitUser;
  authDate: number;
  queryId?: string;
  startParam?: string;
  hash: string;
  raw: string;
};

type ValidateOptions = {
  maxAgeSec?: number;
  nowSec?: number;
};

export function readTelegramInitDataRaw(
  authorizationHeader: string | null,
  fallbackRaw?: string,
): string | null {
  if (authorizationHeader?.startsWith("tma ")) {
    const raw = authorizationHeader.slice("tma ".length).trim();
    if (raw) return raw;
  }
  if (fallbackRaw?.trim()) return fallbackRaw.trim();
  return null;
}

export function validateTelegramInitData(
  raw: string,
  botToken: string,
  opts?: ValidateOptions,
): TelegramInitData {
  const search = new URLSearchParams(raw);
  const hash = search.get("hash");
  if (!hash) {
    throw new Error("missing_hash");
  }
  const authDateRaw = search.get("auth_date");
  const authDate = Number(authDateRaw);
  if (!Number.isFinite(authDate) || authDate <= 0) {
    throw new Error("invalid_auth_date");
  }

  const pairs: string[] = [];
  for (const [key, value] of search.entries()) {
    if (key === "hash") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort((a, b) => a.localeCompare(b));
  const dataCheckString = pairs.join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const expected = Buffer.from(computedHash, "hex");
  const provided = Buffer.from(hash, "hex");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new Error("invalid_hash");
  }

  const maxAgeSec = opts?.maxAgeSec ?? 3600;
  const nowSec = opts?.nowSec ?? Math.floor(Date.now() / 1000);
  if (authDate + maxAgeSec < nowSec) {
    throw new Error("expired");
  }

  const userRaw = search.get("user");
  if (!userRaw) {
    throw new Error("missing_user");
  }
  let user: TelegramInitUser;
  try {
    user = JSON.parse(userRaw) as TelegramInitUser;
  } catch {
    throw new Error("invalid_user_json");
  }
  if (!Number.isFinite(user.id) || user.id <= 0) {
    throw new Error("invalid_user_id");
  }

  return {
    user,
    authDate,
    queryId: search.get("query_id") ?? undefined,
    startParam: search.get("start_param") ?? undefined,
    hash,
    raw,
  };
}
