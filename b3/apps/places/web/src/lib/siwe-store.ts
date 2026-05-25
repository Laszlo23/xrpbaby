import { getPool } from "./db";

const TTL_MS = 10 * 60 * 1000;
const memory = new Map<string, { nonce: string; expiresAt: number }>();

export async function saveNonce(address: string, nonce: string): Promise<void> {
  const key = address.toLowerCase();
  const pool = getPool();
  const exp = new Date(Date.now() + TTL_MS);
  if (pool) {
    await pool.query(
      `INSERT INTO siwe_nonces (address, nonce, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (address) DO UPDATE SET nonce = $2, expires_at = $3`,
      [key, nonce, exp.toISOString()]
    );
    return;
  }
  memory.set(key, { nonce, expiresAt: Date.now() + TTL_MS });
}

export async function takeNonce(address: string, expectedNonce: string): Promise<boolean> {
  const key = address.toLowerCase();
  const pool = getPool();
  if (pool) {
    const r = await pool.query<{ nonce: string }>(
      `DELETE FROM siwe_nonces WHERE address = $1 AND nonce = $2 AND expires_at > NOW() RETURNING nonce`,
      [key, expectedNonce]
    );
    return r.rowCount === 1;
  }
  const row = memory.get(key);
  if (!row || row.expiresAt < Date.now()) {
    memory.delete(key);
    return false;
  }
  if (row.nonce !== expectedNonce) return false;
  memory.delete(key);
  return true;
}
