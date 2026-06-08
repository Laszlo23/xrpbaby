import { fetchRecentOutcomes } from "../agent-db.js";
import { postSlackMessage } from "../slack.js";
import { slackWebhookUrl } from "../env.js";

export async function buildWeeklyLearningsBrief(databaseUrl: string): Promise<string> {
  const outcomes = await fetchRecentOutcomes(databaseUrl, 7, 14);
  if (outcomes.length === 0) {
    return "No agent outcomes recorded in the last 7 days. CEO will prioritize smoke checks and Grove ticks.";
  }

  const lines = ["*Weekly agent learnings (7d)*"];
  for (const o of outcomes.slice(0, 5)) {
    const score = o.rewardScore != null ? o.rewardScore.toFixed(1) : "n/a";
    const learning = o.learnings?.slice(0, 120) ?? "(no learnings text)";
    lines.push(`• score ${score}: ${learning}`);
  }

  const avg =
    outcomes
      .map((o) => o.rewardScore)
      .filter((s): s is number => s != null)
      .reduce((a, b, _, arr) => a + b / arr.length, 0) || 0;

  lines.push(`\nAvg reward score: ${avg.toFixed(1)}`);
  lines.push("CEO adjusts task mix and prompt versions from this brief.");

  return lines.join("\n");
}

export async function postWeeklyLearningsBrief(databaseUrl: string): Promise<{ posted: boolean }> {
  const hook = slackWebhookUrl();
  if (!hook) return { posted: false };
  const text = await buildWeeklyLearningsBrief(databaseUrl);
  await postSlackMessage(hook, text);
  return { posted: true };
}
