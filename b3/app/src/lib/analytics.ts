/**
 * Product analytics (PostHog) + Sentry breadcrumbs as fallback.
 * Set VITE_POSTHOG_KEY (+ optional VITE_POSTHOG_HOST) to enable.
 */
import posthog from "posthog-js";
import {
  getPersistedMarketingAttribution,
  mergeMarketingAttributionFromUrl,
} from "@/lib/agent-attribution";

let initialized = false;

function marketingAttributionRecord(): Record<string, string> {
  const a = getPersistedMarketingAttribution();
  const r: Record<string, string> = {};
  if (a.agent_ref) r.agent_ref = a.agent_ref;
  if (a.utm_source) r.utm_source = a.utm_source;
  if (a.utm_medium) r.utm_medium = a.utm_medium;
  if (a.utm_campaign) r.utm_campaign = a.utm_campaign;
  return r;
}

function sentryBreadcrumb(message: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  void import("@sentry/browser")
    .then((Sentry) => {
      Sentry.addBreadcrumb({
        category: "product",
        message,
        level: "info",
        data,
      });
    })
    .catch(() => {});
}

export function initProductAnalytics(): void {
  if (typeof window === "undefined" || initialized) return;
  const key =
    (import.meta.env.VITE_POSTHOG_KEY as string | undefined)?.trim() ||
    (import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined)?.trim();
  if (!key) return;
  const host =
    (import.meta.env.VITE_POSTHOG_HOST as string | undefined)?.trim() ||
    (import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined)?.trim() ||
    "https://eu.i.posthog.com";
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
  initialized = true;
}

export function captureLandingView(pathname: string, search?: string): void {
  if (typeof window === "undefined") return;
  initProductAnalytics();
  const attribution = mergeMarketingAttributionFromUrl(search ?? "");
  const props: Record<string, string> = { pathname, search: search ?? "" };
  if (attribution.agent_ref) props.agent_ref = attribution.agent_ref;
  if (attribution.utm_source) props.utm_source = attribution.utm_source;
  if (attribution.utm_medium) props.utm_medium = attribution.utm_medium;
  if (attribution.utm_campaign) props.utm_campaign = attribution.utm_campaign;
  sentryBreadcrumb("landing_view", props);
  if (!initialized) return;
  posthog.capture("landing_view", props);
}

export function captureWalletConnected(address: `0x${string}`): void {
  if (typeof window === "undefined") return;
  initProductAnalytics();
  const props = {
    ...marketingAttributionRecord(),
    address_preview: `${address.slice(0, 8)}…${address.slice(-4)}`,
  };
  sentryBreadcrumb("wallet_connected", props);
  if (!initialized) return;
  posthog.identify(address, { wallet: address });
  posthog.capture("wallet_connected", props);
}

export function captureMintClicked(payload: {
  drop_slug?: string;
  quantity: number;
  price_wei: string;
  product?: "raffle" | "ags";
  agent_type_id?: number;
}): void {
  if (typeof window === "undefined") return;
  initProductAnalytics();
  const props = { ...marketingAttributionRecord(), ...payload };
  sentryBreadcrumb("mint_clicked", props as Record<string, unknown>);
  if (!initialized) return;
  posthog.capture("mint_clicked", props);
}

export function captureMintConfirmed(payload: {
  drop_slug?: string;
  tx_hash: string;
  product?: "raffle" | "ags";
}): void {
  if (typeof window === "undefined") return;
  initProductAnalytics();
  const props = { ...marketingAttributionRecord(), ...payload };
  sentryBreadcrumb("mint_confirmed", props as Record<string, unknown>);
  if (!initialized) return;
  posthog.capture("mint_confirmed", props);
}

export function captureShareClicked(payload: {
  channel: "warpcast" | "twitter" | "native" | "copy";
  context?: "campaign" | "drop";
  drop_slug?: string;
}): void {
  if (typeof window === "undefined") return;
  initProductAnalytics();
  const props = { ...marketingAttributionRecord(), ...payload };
  sentryBreadcrumb("share_clicked", props as Record<string, unknown>);
  if (!initialized) return;
  posthog.capture("share_clicked", props);
}
