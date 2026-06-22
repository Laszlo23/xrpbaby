import type { AuthSurfaceKind } from "@/lib/auth-surface-env";
import {
  culturePrimaryLoginLabel,
  culturePrivyLoginMethods,
  CULTURE_PRIVY_LOGIN_METHODS,
  type CultureLoginPreference,
} from "@bc/culture-auth";

export type { CultureLoginPreference };
export { CULTURE_PRIVY_LOGIN_METHODS };

/** Surface-aware Privy loginMethods — Farcaster + wallets included in every surface. */
export function loginMethodsForSurface(
  kind: AuthSurfaceKind,
  preference: CultureLoginPreference = "default",
) {
  return culturePrivyLoginMethods(kind, preference);
}

export function primaryLoginLabel(kind: AuthSurfaceKind): string {
  return culturePrimaryLoginLabel(kind);
}

export function shouldAutoOpenLoginModal(kind: AuthSurfaceKind): boolean {
  return kind === "farcaster";
}
