/** Known benign browser errors — extend when baseline proves noise, not regressions. */
export const PAGE_ERROR_ALLOWLIST: RegExp[] = [
  /Suspense boundary received an update before it finished hydrating/i,
  /Minified React error #421/i,
];

export const CONSOLE_ERROR_ALLOWLIST: RegExp[] = [
  /Failed to load resource: the server responded with a status of 503/i,
  /Failed to load resource: the server responded with a status of 401/i,
  /Failed to load resource: the server responded with a status of 404/i,
  /net::ERR_BLOCKED_BY_CLIENT/i,
  /net::ERR_NAME_NOT_RESOLVED/i,
  /Content Security Policy/i,
  /Privy/i,
  /WalletConnect/i,
  /chrome-extension:/i,
];

const ASSET_EXTENSIONS = /\.(js|mjs|css|woff2?|png|jpg|jpeg|svg|webp|ico)(\?|$)/i;

export function isAllowlistedPageError(message: string): boolean {
  return PAGE_ERROR_ALLOWLIST.some((pattern) => pattern.test(message));
}

export function isAllowlistedConsoleError(text: string): boolean {
  return CONSOLE_ERROR_ALLOWLIST.some((pattern) => pattern.test(text));
}

export function isAppAssetRequest(url: string, baseURL?: string): boolean {
  if (!url) return false;
  if (url.startsWith("data:") || url.startsWith("blob:")) return false;
  try {
    const parsed = new URL(url);
    if (baseURL) {
      const base = new URL(baseURL);
      if (parsed.origin !== base.origin) return false;
    }
    return ASSET_EXTENSIONS.test(parsed.pathname) || parsed.pathname.startsWith("/assets/");
  } catch {
    return false;
  }
}
