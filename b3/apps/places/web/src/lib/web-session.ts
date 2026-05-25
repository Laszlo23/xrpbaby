import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "bc_session";
const MAX_AGE_SEC = 7 * 24 * 60 * 60;

export { COOKIE_NAME };

export type SessionPayload = {
  userId: number;
  address: string;
  exp: number;
};

function getSecret(): string | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

/** True when server can issue signed session cookies (set SESSION_SECRET, 16+ chars). */
export function hasSessionSecret(): boolean {
  return getSecret() !== null;
}

/** Signed opaque token: base64url(payload).hmac */
export function signSession(userId: number, address: string): string | null {
  const secret = getSecret();
  if (!secret) return null;
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload: SessionPayload = { userId, address: address.toLowerCase(), exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifySession(token: string): SessionPayload | null {
  const secret = getSecret();
  if (!secret) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const raw = Buffer.from(payloadB64, "base64url").toString("utf8");
    const data = JSON.parse(raw) as SessionPayload;
    if (typeof data.userId !== "number" || typeof data.address !== "string" || typeof data.exp !== "number") {
      return null;
    }
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}
