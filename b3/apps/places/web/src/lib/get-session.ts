import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/web-session";

export async function getSessionFromCookies(): Promise<{ userId: number; address: string } | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const p = verifySession(raw);
  if (!p) return null;
  return { userId: p.userId, address: p.address };
}
