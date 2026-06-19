/**
 * Client-side Growth Intelligence SDK bootstrap.
 * Enable with VITE_GI_ENABLED=1 and VITE_GI_API_KEY.
 */
import { initGrowthIntelligence } from "@bc/growth-intelligence";

let started = false;

export function initGrowthIntelligenceClient(): void {
  if (typeof window === "undefined" || started) return;
  if (import.meta.env.VITE_GI_ENABLED !== "1") return;

  const apiKey = (import.meta.env.VITE_GI_API_KEY as string | undefined)?.trim();
  if (!apiKey) return;

  const appSlug = (import.meta.env.VITE_GI_APP_SLUG as string | undefined)?.trim() || "bc-id";

  initGrowthIntelligence({
    appSlug,
    apiKey,
    endpoint: "/api/intelligence",
    maskSelectors: ["[data-gi-mask]", 'input[type="password"]', "[data-sensitive]"],
    sampleRate: 1,
  });
  started = true;
}
