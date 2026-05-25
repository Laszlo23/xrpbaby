/**
 * Trimmed Privy app id from the client bundle.
 * Supports `NEXT_PUBLIC_PRIVY_APP_ID` or typo fallback `NEXT_PUBLIC_PRIVY_APPID`.
 */
export const privyAppId =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim() ||
  process.env.NEXT_PUBLIC_PRIVY_APPID?.trim() ||
  "";

/** When false, omit `PrivyProvider` so static generation works without dashboard env. */
export const privyEnabled = privyAppId.length > 0;
