import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { captureLandingView, initProductAnalytics } from "@/lib/analytics";
import {
  getPersistedMarketingAttribution,
  mergeMarketingAttributionFromUrl,
} from "@/lib/agent-attribution";
import { initGrowthIntelligenceClient } from "@/lib/growth-intelligence-client";
import { warnMissingClientEnv } from "@/lib/env-health";
import { trackLandingEvent } from "@/lib/landing-api";
import { storeRaffleReferrerFromUrl } from "@/lib/raffle-referral";

/** Fires `landing_view` on SPA navigations when PostHog is configured. */
export function AnalyticsRouteTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });

  useEffect(() => {
    initProductAnalytics();
    initGrowthIntelligenceClient();
    warnMissingClientEnv();
  }, []);

  useEffect(() => {
    storeRaffleReferrerFromUrl(searchStr);
    captureLandingView(pathname, searchStr);
    const fromUrl = mergeMarketingAttributionFromUrl(searchStr);
    const persisted = getPersistedMarketingAttribution();
    void trackLandingEvent("landing_view", pathname, {
      pathname,
      search: searchStr,
      ...persisted,
      ...fromUrl,
    });
  }, [pathname, searchStr]);

  return null;
}
