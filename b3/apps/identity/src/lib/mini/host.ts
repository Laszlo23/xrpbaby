import { MINI_APP_HOST, isMiniAppHost } from "./site";

export function getHostname(): string {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  return MINI_APP_HOST;
}

export function isMiniAppContext(): boolean {
  if (import.meta.env.VITE_FORCE_MINI_APP === "true") return true;
  const host = getHostname();
  return isMiniAppHost(host);
}
