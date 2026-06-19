import { runInference } from "@/server/llm/inference";
import type { ShareActionType } from "@/server/social/culture-value";

export type AgentShareScoreResult = {
  agentScored: boolean;
  agentBonus: number;
  effort?: number;
  authentic?: boolean;
  reason?: string;
};

type AgentJson = {
  effort?: number;
  authentic?: boolean;
  reason?: string;
};

function parseAgentJson(text: string): AgentJson | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as AgentJson;
  } catch {
    return null;
  }
}

function effortToBonus(effort: number, authentic: boolean): number {
  if (!authentic) return 0;
  const clamped = Math.max(1, Math.min(5, Math.round(effort)));
  return Math.round(((clamped - 1) / 4) * 40);
}

/** Optional LLM quality pass for original / quote shares. Degrades to 0 bonus on failure. */
export async function scoreShareWithAgent(
  actionType: ShareActionType,
  text: string,
  platform: "farcaster" | "x",
): Promise<AgentShareScoreResult> {
  if (actionType !== "original" && actionType !== "quote") {
    return { agentScored: false, agentBonus: 0 };
  }

  const result = await runInference([
    {
      role: "system",
      content:
        'You score social posts for a culture-building quest. Reply with JSON only: {"effort":1-5,"authentic":boolean,"reason":"short"}. effort=1 is lazy repost text; 5 is thoughtful original advocacy. authentic=false for spam or unrelated content.',
    },
    {
      role: "user",
      content: `Platform: ${platform}\nAction: ${actionType}\nPost text:\n${text.slice(0, 2000)}`,
    },
  ]);

  if (!result.ok || !result.text) {
    return { agentScored: false, agentBonus: 0, reason: result.error };
  }

  const parsed = parseAgentJson(result.text);
  if (!parsed || parsed.effort == null) {
    return { agentScored: false, agentBonus: 0 };
  }

  const authentic = parsed.authentic !== false;
  const bonus = effortToBonus(parsed.effort, authentic);

  return {
    agentScored: true,
    agentBonus: bonus,
    effort: parsed.effort,
    authentic,
    reason: parsed.reason,
  };
}
