/**
 * Dev-only hints when critical client env vars are missing.
 * Avoids opaque Privy / identity failures during local setup.
 */
const WARNED = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (typeof import.meta === "undefined" || import.meta.env?.PROD) return;
  if (WARNED.has(key)) return;
  WARNED.add(key);
  console.warn(`[env-health] ${message}`);
}

export function warnMissingClientEnv(): void {
  const privy = import.meta.env?.VITE_PRIVY_APP_ID?.trim();
  if (!privy) {
    warnOnce(
      "privy",
      "VITE_PRIVY_APP_ID is unset — wallet connect will not work. See app/.env.example",
    );
  }

  const identity = import.meta.env?.VITE_IDENTITY_CONTRACT_ADDRESS?.trim();
  if (!identity) {
    warnOnce(
      "identity",
      "VITE_IDENTITY_CONTRACT_ADDRESS is unset — Culture ID mint checks may fail.",
    );
  }

  const bcc = import.meta.env?.VITE_BCC_TOKEN_ADDRESS?.trim();
  if (!bcc) {
    warnOnce("bcc", "VITE_BCC_TOKEN_ADDRESS is unset — BCC balances and agent access may fail.");
  }
}

export function getWalletConfigHint(): string | null {
  if (typeof import.meta !== "undefined" && import.meta.env?.PROD) return null;
  if (import.meta.env?.VITE_PRIVY_APP_ID?.trim()) return null;
  return "Wallet login is not configured in this environment (missing VITE_PRIVY_APP_ID).";
}
