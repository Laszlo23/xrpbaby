/**
 * Client-only Sentry bootstrap. Set `VITE_SENTRY_DSN` in the deploying environment.
 * @see docs/OBSERVABILITY.md
 */
export async function initClientSentry(): Promise<void> {
  if (typeof window === "undefined") return;
  const dsn =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SENTRY_DSN?.trim()) || "";
  if (!dsn) return;

  const Sentry = await import("@sentry/react");
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true }),
    ],
    tracesSampleRate: 0.08,
    replaysSessionSampleRate: 0.02,
    replaysOnErrorSampleRate: 0.5,
    environment: import.meta.env?.MODE ?? "development",
  });
}

/** Report section-level failures when Sentry is configured. */
export async function captureClientException(
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  if (typeof window === "undefined") return;
  const dsn =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SENTRY_DSN?.trim()) || "";
  if (!dsn) return;
  const Sentry = await import("@sentry/react");
  Sentry.captureException(error, { extra: context });
}
