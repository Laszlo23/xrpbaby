/**
 * Join PostHog funnel metrics into KPI snapshots when POSTHOG_PERSONAL_API_KEY is configured.
 */
export type PostHogFunnelSnapshot = {
  agentAttributedJoins7d: number | null;
  source: "posthog" | "unconfigured";
};

export async function fetchPostHogAgentAttribution(): Promise<PostHogFunnelSnapshot> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim();
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim();
  if (!apiKey || !projectId) {
    return { agentAttributedJoins7d: null, source: "unconfigured" };
  }

  try {
    const res = await fetch(
      `https://app.posthog.com/api/projects/${projectId}/insights/trend/?events=[{"id":"wallet_connected","properties":[{"key":"agent_ref","operator":"is_set"}]}]&date_from=-7d`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(30_000),
      },
    );
    if (!res.ok) {
      return { agentAttributedJoins7d: null, source: "posthog" };
    }
    const json = (await res.json()) as { result?: { count?: number }[] };
    const count = json.result?.[0]?.count;
    return {
      agentAttributedJoins7d: typeof count === "number" ? count : null,
      source: "posthog",
    };
  } catch {
    return { agentAttributedJoins7d: null, source: "posthog" };
  }
}

export async function enrichKpiWithPostHog(
  snapshot: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const ph = await fetchPostHogAgentAttribution();
  return { ...snapshot, posthog: ph };
}
