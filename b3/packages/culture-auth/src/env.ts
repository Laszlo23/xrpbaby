/** Canonical auth hub origin. */
export const DEFAULT_AUTH_HUB_ORIGIN = "https://app.buildingcultureid.space";

/** Central member sync API origin — same as auth hub by default. */
export const DEFAULT_SYNC_API_ORIGIN = DEFAULT_AUTH_HUB_ORIGIN;

function trimEnv(value: string | undefined): string {
  return value?.trim() ?? "";
}

/** Read Privy app id from Vite (`VITE_*`) or Next (`NEXT_PUBLIC_*`) bundles. */
export function readPrivyAppId(env: Record<string, string | undefined> = readClientEnv()): string {
  return (
    trimEnv(env.VITE_PRIVY_APP_ID) ||
    trimEnv(env.NEXT_PUBLIC_PRIVY_APP_ID) ||
    trimEnv(env.NEXT_PUBLIC_PRIVY_APPID)
  );
}

export function readPrivyClientId(env: Record<string, string | undefined> = readClientEnv()): string {
  return trimEnv(env.VITE_PRIVY_CLIENT_ID) || trimEnv(env.NEXT_PUBLIC_PRIVY_CLIENT_ID);
}

export function readPlatformOrigin(env: Record<string, string | undefined> = readClientEnv()): string {
  return (
    trimEnv(env.VITE_PLATFORM_ORIGIN) ||
    trimEnv(env.NEXT_PUBLIC_PLATFORM_ORIGIN) ||
    DEFAULT_SYNC_API_ORIGIN
  );
}

export function readWalletConnectProjectId(
  env: Record<string, string | undefined> = readClientEnv(),
): string {
  return (
    trimEnv(env.VITE_WALLETCONNECT_PROJECT_ID) ||
    trimEnv(env.VITE_WALLET_CONNECT_PROJECT_ID) ||
    trimEnv(env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID)
  );
}

export function readNeynarClientId(env: Record<string, string | undefined> = readClientEnv()): string {
  return trimEnv(env.VITE_NEYNAR_CLIENT_ID) || trimEnv(env.NEXT_PUBLIC_NEYNAR_CLIENT_ID);
}

export function isPrivyEnabled(appId?: string): boolean {
  return (appId ?? readPrivyAppId()).length > 0;
}

function readClientEnv(): Record<string, string | undefined> {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env as Record<string, string | undefined>;
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env as Record<string, string | undefined>;
  }
  return {};
}

export type CultureAuthEnv = {
  privyAppId: string;
  privyClientId: string;
  platformOrigin: string;
  walletConnectProjectId: string;
  neynarClientId: string;
  privyEnabled: boolean;
};

export function resolveCultureAuthEnv(
  overrides: Partial<CultureAuthEnv> = {},
): CultureAuthEnv {
  const env = readClientEnv();
  const privyAppId = overrides.privyAppId ?? readPrivyAppId(env);
  return {
    privyAppId,
    privyClientId: overrides.privyClientId ?? readPrivyClientId(env),
    platformOrigin: overrides.platformOrigin ?? readPlatformOrigin(env),
    walletConnectProjectId: overrides.walletConnectProjectId ?? readWalletConnectProjectId(env),
    neynarClientId: overrides.neynarClientId ?? readNeynarClientId(env),
    privyEnabled: overrides.privyEnabled ?? isPrivyEnabled(privyAppId),
  };
}
