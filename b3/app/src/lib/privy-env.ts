/** Trimmed Privy app id from the client bundle. */
export const privyAppId =
  (typeof import.meta !== "undefined" &&
    (import.meta.env.VITE_PRIVY_APP_ID as string | undefined)?.trim()) ||
  "";

export const privyClientId =
  (typeof import.meta !== "undefined" &&
    (import.meta.env.VITE_PRIVY_CLIENT_ID as string | undefined)?.trim()) ||
  "";

/** When false, fall back to legacy wagmi connectors (World, MetaMask, etc.). */
export const privyEnabled = privyAppId.length > 0;
