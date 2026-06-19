import type { AnalysisInput } from "@bc/growth-intelligence/server";
import type { FunnelAnalysisResult } from "@bc/growth-intelligence/server";

import { runInference } from "@/server/llm/inference";

export type LlmGiInsight = {
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
};

export async function generateLlmInsights(
  input: AnalysisInput,
  funnel: FunnelAnalysisResult | null,
): Promise<LlmGiInsight[]> {
  const enabled =
    process.env.GI_LLM_ENABLED?.trim() === "1" ||
    process.env.GI_LLM_ENABLED?.trim()?.toLowerCase() === "true" ||
    process.env.GROVE_LLM_ENABLED?.trim() === "1";

  if (!enabled) return [];

  const funnelLine = funnel?.biggestLeak
    ? `Biggest funnel leak: ${funnel.biggestLeak.label} (${funnel.biggestLeak.dropoffPct}% dropoff).`
    : "No funnel leak data yet.";

  const prompt = `You are Growth Intelligence for Building Culture — proof-first product analytics.

App: ${input.appName}
Window: ${input.windowLabel}
Sessions: ${input.totalSessions}
Events: ${input.totalEvents}
Rage clicks: ${input.rageClicks}
Top page: ${input.topPages[0]?.pathname ?? "n/a"} (${input.topPages[0]?.views ?? 0} views)
Top click target: ${input.topClicks[0]?.selector ?? "n/a"}
${funnelLine}

Respond JSON only — array of 1-2 insights:
[{"title":"...","body":"...","severity":"info|warning|critical"}]

Rules: no airdrop/moon/hype. Actionable UX recommendations only. Cite only provided metrics.`;

  const result = await runInference([
    {
      role: "system",
      content: "Product intelligence analyst for Building Culture ecosystem apps.",
    },
    { role: "user", content: prompt },
  ]);

  if (!result.ok || !result.text) return [];

  try {
    const parsed = JSON.parse(result.text.replace(/```json|```/g, "").trim()) as LlmGiInsight[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i.title && i.body)
      .slice(0, 2)
      .map((i) => ({
        title: String(i.title).slice(0, 120),
        body: String(i.body).slice(0, 800),
        severity: i.severity === "critical" || i.severity === "warning" ? i.severity : "info",
      }));
  } catch {
    return [];
  }
}
