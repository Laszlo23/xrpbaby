import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

const SESSION_COOKIE = "reset_member_session";
const SESSION_DAYS = 30;

export function getSessionToken(): string | undefined {
  return getCookie(SESSION_COOKIE);
}

export function setSessionToken(token: string): void {
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionToken(): void {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}
