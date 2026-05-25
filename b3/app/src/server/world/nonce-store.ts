import { randomBytes } from "node:crypto";

const TTL_MS = 10 * 60 * 1000;

const store = new Map<string, number>();

function prune(): void {
  const now = Date.now();
  for (const [n, exp] of store) {
    if (exp <= now) store.delete(n);
  }
}

/** Alphanumeric nonce (no hyphens) per MiniKit wallet-auth guidance. */
export function createWalletAuthNonce(): string {
  prune();
  return randomBytes(24).toString("base64url").replace(/[-_]/g, "").slice(0, 32);
}

export function rememberNonce(nonce: string): void {
  prune();
  store.set(nonce, Date.now() + TTL_MS);
}

export function consumeNonceIfValid(nonce: string): boolean {
  prune();
  const exp = store.get(nonce);
  if (!exp || exp < Date.now()) {
    store.delete(nonce);
    return false;
  }
  store.delete(nonce);
  return true;
}
