import { createHmac, timingSafeEqual } from "node:crypto";

const WORKSHOP_TOKEN_SALT = "bc-investor-workshop-v1";

export function investorWorkshopSecret(): string | undefined {
  return process.env.INVESTOR_WORKSHOP_SECRET?.trim();
}

export function investorWorkshopEnabled(): boolean {
  return Boolean(investorWorkshopSecret());
}

export function issueWorkshopToken(secret: string): string {
  return createHmac("sha256", secret).update(WORKSHOP_TOKEN_SALT).digest("base64url");
}

export function verifyWorkshopToken(token: string | null | undefined): boolean {
  const secret = investorWorkshopSecret();
  if (!secret || !token?.trim()) return false;
  try {
    const expected = issueWorkshopToken(secret);
    const a = Buffer.from(expected);
    const b = Buffer.from(token.trim());
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyWorkshopPassword(password: string): boolean {
  const secret = investorWorkshopSecret();
  if (!secret) return false;
  try {
    const a = Buffer.from(secret);
    const b = Buffer.from(password);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
