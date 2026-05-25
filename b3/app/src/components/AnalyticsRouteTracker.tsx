import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { captureLandingView, initProductAnalytics } from "@/lib/analytics";
import { storeRaffleReferrerFromUrl } from "@/lib/raffle-referral";

/** Fires `landing_view` on SPA navigations when PostHog is configured. */
export function AnalyticsRouteTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });

  useEffect(() => {
    initProductAnalytics();
  }, []);

  useEffect(() => {
    storeRaffleReferrerFromUrl(searchStr);
    captureLandingView(pathname, searchStr);
  }, [pathname, searchStr]);

  return null;
}
