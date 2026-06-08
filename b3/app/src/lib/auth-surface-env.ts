export type AuthSurfaceKind = "farcaster" | "baseapp" | "browser";

export type AuthSurfaceEnv = {
  kind: AuthSurfaceKind;
  label: string;
};

const BROWSER_ENV: AuthSurfaceEnv = { kind: "browser", label: "Browser" };

export async function detectAuthSurfaceEnv(): Promise<AuthSurfaceEnv> {
  try {
    const sdk = (await import("@farcaster/miniapp-sdk")).default;
    const inMiniApp = await sdk.isInMiniApp();
    if (inMiniApp) return { kind: "farcaster", label: "Farcaster Mini App" };
  } catch {
    // Ignore: likely regular browser / non-farcaster context.
  }

  if (typeof window !== "undefined") {
    const ua = window.navigator.userAgent.toLowerCase();
    const eth = (window as Window & { ethereum?: { isCoinbaseWallet?: boolean } }).ethereum;
    const inBaseApp =
      Boolean(eth?.isCoinbaseWallet) ||
      ua.includes("coinbase") ||
      ua.includes("baseapp") ||
      ua.includes("cbwallet");
    if (inBaseApp) return { kind: "baseapp", label: "Base/Coinbase App" };
  }

  return BROWSER_ENV;
}
