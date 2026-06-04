import { SITE_ORIGIN } from "@/lib/seo/site";
import { isMiniAppHost } from "./site";

const MARKETING_HOST = new URL(SITE_ORIGIN).hostname;

export function getHostname(): string {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  // SSR has no Host header here — default to the public marketing domain so we
  // do not treat buildingcultureid.space as the mini app host during hydration.
  return MARKETING_HOST;
}

export function isMiniAppContext(): boolean {
  if (import.meta.env.VITE_FORCE_MINI_APP === "true") return true;
  const host = getHostname();
  return isMiniAppHost(host);
}
