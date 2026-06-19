import type { AuthSurfaceKind } from "@/lib/auth-surface-env";

/** Privy login method keys — wallet uses connectWallet(), not loginMethods. */
export type CultureLoginMethod = "email" | "google" | "apple" | "farcaster";

const EMAIL_FIRST: CultureLoginMethod[] = ["email", "google", "apple"];
const FARCASTER_FIRST: CultureLoginMethod[] = ["farcaster", "email", "google", "apple"];

export type CultureLoginPreference = "default" | "email" | "farcaster";

/**
 * Surface-aware Privy loginMethods. Never includes "wallet" — use connectWallet() instead
 * (Privy wallet tab can break in some builds; see packages/culture-auth privy-config).
 */
export function loginMethodsForSurface(
  kind: AuthSurfaceKind,
  preference: CultureLoginPreference = "default",
): CultureLoginMethod[] {
  if (preference === "farcaster" || (preference === "default" && kind === "farcaster")) {
    return FARCASTER_FIRST;
  }
  return EMAIL_FIRST;
}

export function primaryLoginLabel(kind: AuthSurfaceKind): string {
  switch (kind) {
    case "farcaster":
      return "Continue with Farcaster";
    case "baseapp":
      return "Continue with email";
    case "browser":
      return "Continue with email";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function shouldAutoOpenLoginModal(kind: AuthSurfaceKind): boolean {
  return kind === "farcaster";
}
