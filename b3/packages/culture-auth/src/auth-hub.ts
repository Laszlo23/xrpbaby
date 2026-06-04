import { DEFAULT_AUTH_HUB_ORIGIN } from "./env.js";

export function authHubLoginUrl(
  returnUrl: string,
  hubOrigin: string = DEFAULT_AUTH_HUB_ORIGIN,
): string {
  const url = new URL("/auth/login", hubOrigin);
  url.searchParams.set("returnUrl", returnUrl);
  return url.toString();
}

export function authHubLogoutUrl(
  returnUrl: string,
  hubOrigin: string = DEFAULT_AUTH_HUB_ORIGIN,
): string {
  const url = new URL("/auth/logout", hubOrigin);
  url.searchParams.set("returnUrl", returnUrl);
  return url.toString();
}

/** True when satellite origin differs from the auth hub (cross-TLD session). */
export function shouldUseAuthHub(
  currentOrigin: string,
  hubOrigin: string = DEFAULT_AUTH_HUB_ORIGIN,
): boolean {
  try {
    return new URL(currentOrigin).origin !== new URL(hubOrigin).origin;
  } catch {
    return false;
  }
}

export function isAllowedReturnUrl(returnUrl: string, hubOrigin: string = DEFAULT_AUTH_HUB_ORIGIN): boolean {
  try {
    const target = new URL(returnUrl);
    if (target.protocol !== "https:" && target.protocol !== "http:") return false;
    if (target.origin === new URL(hubOrigin).origin) return true;
    const host = target.hostname;
    return (
      host.endsWith(".buildingcultureid.space") ||
      host.endsWith(".buildingculture.capital") ||
      host === "buildingcultureid.space" ||
      host === "buildingculture.capital" ||
      host === "localhost"
    );
  } catch {
    return false;
  }
}
