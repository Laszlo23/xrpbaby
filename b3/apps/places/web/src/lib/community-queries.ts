import type { Pool } from "pg";

export type UserProfileRow = {
  user_id: number;
  visibility: "private" | "public";
  display_name: string | null;
  bio: string | null;
  show_holdings: boolean;
  twitter: string | null;
  discord: string | null;
  farcaster: string | null;
  telegram: string | null;
  linkedin: string | null;
  website: string | null;
  public_slug: string | null;
  extra_wallets: unknown;
};

export async function ensureUserProfile(pool: Pool, userId: number): Promise<void> {
  await pool.query(
    `INSERT INTO user_profiles (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId],
  );
}

export async function getProfileByUserId(pool: Pool, userId: number): Promise<UserProfileRow | null> {
  await ensureUserProfile(pool, userId);
  const r = await pool.query<UserProfileRow>(`SELECT * FROM user_profiles WHERE user_id = $1`, [userId]);
  return r.rows[0] ?? null;
}

export async function getWalletForUser(pool: Pool, userId: number): Promise<string | null> {
  const r = await pool.query<{ address: string }>(
    `SELECT address FROM wallet_bindings WHERE user_id = $1 ORDER BY id ASC LIMIT 1`,
    [userId],
  );
  return r.rows[0]?.address ?? null;
}

export function randomReferralCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const out: string[] = [];
  const crypto = globalThis.crypto;
  for (let i = 0; i < 8; i++) {
    const n = crypto.getRandomValues(new Uint8Array(1))[0]! % chars.length;
    out.push(chars[n]!);
  }
  return out.join("");
}

export async function ensureReferralCode(pool: Pool, userId: number): Promise<string> {
  const existing = await pool.query<{ code: string }>(`SELECT code FROM referral_codes WHERE user_id = $1`, [userId]);
  if (existing.rows.length > 0) return existing.rows[0]!.code;
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomReferralCode();
    try {
      await pool.query(`INSERT INTO referral_codes (user_id, code) VALUES ($1, $2)`, [userId, code]);
      return code;
    } catch {
      /* unique violation — retry */
    }
  }
  throw new Error("could not allocate referral code");
}
