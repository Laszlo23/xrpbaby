import { insertPromptVersion, fetchRecentOutcomes } from "../agent-db.js";
import { computeRewardScore, captureKpiSnapshot } from "./scorer.js";

export async function maybePromotePrompt(
  databaseUrl: string,
  agentId: string,
  candidatePrompt: string,
  baselineScore: number,
): Promise<{ promoted: boolean; version?: number }> {
  const snapshot = await captureKpiSnapshot(databaseUrl, null, null);
  const score = computeRewardScore(snapshot);
  if (score <= baselineScore) {
    return { promoted: false };
  }
  const version = await insertPromptVersion(databaseUrl, agentId, candidatePrompt, true);
  return { promoted: true, version };
}

export async function getBaselineRewardScore(databaseUrl: string): Promise<number> {
  const outcomes = await fetchRecentOutcomes(databaseUrl, 7, 10);
  const scores = outcomes
    .map((o) => o.rewardScore)
    .filter((s): s is number => s != null && Number.isFinite(s));
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
