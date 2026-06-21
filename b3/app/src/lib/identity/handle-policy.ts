export const RESERVED_MAX_LEN = 3;
export const PROMO_MIN_LEN = 4;
export const STANDARD_MIN_LEN = 3;

export type HandlePolicyTier = "reserved" | "promo" | "standard";

export type HandlePolicyResult =
  | { ok: true; tier: HandlePolicyTier }
  | { ok: false; error: "reserved_team" | "handle_too_short" | "invalid_handle" };

function readTeamWalletAllowlist(): Set<string> {
  const raw = process.env.IDENTITY_TEAM_WALLETS;
  const list = (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^0x[a-f0-9]{40}$/.test(s));
  return new Set(list);
}

/** Wallets allowed to mint 1–3 letter reserved handles (team / founder). */
export function isIdentityTeamWallet(wallet?: string | null): boolean {
  if (!wallet) return false;
  return readTeamWalletAllowlist().has(wallet.trim().toLowerCase());
}

export function premiumHandleTier(handleLength: number): HandlePolicyTier {
  const len = Math.floor(handleLength);
  if (len <= RESERVED_MAX_LEN) return "reserved";
  if (len >= PROMO_MIN_LEN) return "promo";
  return "standard";
}

export function validateHandleForPromoMint(
  handle: string,
  options?: { teamWallet?: boolean },
): HandlePolicyResult {
  const clean = handle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (!clean || clean === "yourname") {
    return { ok: false, error: "invalid_handle" };
  }
  const tier = premiumHandleTier(clean.length);
  if (options?.teamWallet === true) {
    if (clean.length >= 1) return { ok: true, tier };
    return { ok: false, error: "invalid_handle" };
  }
  if (tier === "reserved") {
    return { ok: false, error: "reserved_team" };
  }
  if (clean.length < PROMO_MIN_LEN) {
    return { ok: false, error: "handle_too_short" };
  }
  return { ok: true, tier: "promo" };
}

/** Server-side validation with wallet allowlist from env. */
export function validateHandleForPromoMintWallet(
  handle: string,
  wallet?: string | null,
): HandlePolicyResult {
  return validateHandleForPromoMint(handle, { teamWallet: isIdentityTeamWallet(wallet) });
}

export function handlePolicyUserMessage(
  error: Extract<HandlePolicyResult, { ok: false }>["error"],
): string {
  switch (error) {
    case "reserved_team":
      return "1–3 letter names are reserved for team / DAO. Choose 4+ characters.";
    case "handle_too_short":
      return "Promo mint requires at least 4 characters in your handle.";
    case "invalid_handle":
      return "Enter a valid handle (letters and numbers only).";
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}
