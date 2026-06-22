import type { PrivyClientConfig } from "@privy-io/react-auth";

import { CULTURE_WALLET_LIST } from "./privy-wallet-integration.js";

export type CultureAuthSurface = "browser" | "baseapp" | "farcaster";
export type CultureLoginPreference = "default" | "email" | "farcaster";

type PrivySocialLoginMethod = Exclude<
  NonNullable<PrivyClientConfig["loginMethods"]>[number],
  "wallet"
>;

/** Social + Farcaster login keys — wallets are configured via loginMethodsAndOrder. */
export const CULTURE_PRIVY_LOGIN_METHODS = [
  "farcaster",
  "email",
  "google",
  "apple",
] as const satisfies ReadonlyArray<PrivySocialLoginMethod>;

const EMAIL_FIRST = ["email", "google", "apple", "farcaster"] as const;
const FARCASTER_FIRST = ["farcaster", "email", "google", "apple"] as const;

/** Surface-aware loginMethods passed to Privy `login()`. */
export function culturePrivyLoginMethods(
  surface: CultureAuthSurface = "browser",
  preference: CultureLoginPreference = "default",
): Array<(typeof CULTURE_PRIVY_LOGIN_METHODS)[number]> {
  if (preference === "farcaster" || (preference === "default" && surface === "farcaster")) {
    return [...FARCASTER_FIRST];
  }
  if (preference === "email") {
    return [...EMAIL_FIRST];
  }
  return [...CULTURE_PRIVY_LOGIN_METHODS];
}

/** Default Privy modal layout — wallets as first-class options beside social login. */
export function culturePrivyLoginMethodsAndOrder(): NonNullable<
  PrivyClientConfig["loginMethodsAndOrder"]
> {
  const walletPrimary = CULTURE_WALLET_LIST.filter((entry) =>
    ["base_account", "coinbase_wallet"].includes(entry),
  ) as NonNullable<PrivyClientConfig["loginMethodsAndOrder"]>["primary"][number][];
  const walletOverflow = CULTURE_WALLET_LIST.filter((entry) =>
    ["detected_ethereum_wallets", "metamask", "wallet_connect"].includes(entry),
  ) as NonNullable<PrivyClientConfig["loginMethodsAndOrder"]>["overflow"];

  return {
    primary: ["farcaster", "email", "google", "apple", ...walletPrimary],
    overflow: walletOverflow,
  };
}

export function culturePrimaryLoginLabel(surface: CultureAuthSurface): string {
  switch (surface) {
    case "farcaster":
      return "Continue with Farcaster";
    case "baseapp":
    case "browser":
      return "Log in or sign up";
    default: {
      const _exhaustive: never = surface;
      return _exhaustive;
    }
  }
}
