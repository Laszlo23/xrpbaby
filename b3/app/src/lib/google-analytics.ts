/** Google Analytics 4 measurement ID for app.buildingcultureid.space */
export const DEFAULT_GA_MEASUREMENT_ID = "G-C5D9GNN3TJ";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getGoogleAnalyticsId(): string | undefined {
  const raw =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GA_MEASUREMENT_ID?.trim()) ||
    (typeof process !== "undefined" && process.env.VITE_GA_MEASUREMENT_ID?.trim()) ||
    "";
  if (raw === "0" || raw.toLowerCase() === "false" || raw.toLowerCase() === "off") {
    return undefined;
  }
  if (raw) return raw;
  if (typeof import.meta !== "undefined" && import.meta.env?.PROD) {
    return DEFAULT_GA_MEASUREMENT_ID;
  }
  return undefined;
}

export function captureGooglePageView(pathname: string, search = ""): void {
  if (typeof window === "undefined") return;
  const id = getGoogleAnalyticsId();
  if (!id || typeof window.gtag !== "function") return;
  const pagePath = `${pathname}${search.startsWith("?") ? search : search ? `?${search}` : ""}`;
  window.gtag("config", id, { page_path: pagePath });
}
