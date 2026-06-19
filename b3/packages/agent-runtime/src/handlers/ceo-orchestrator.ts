import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { TASK_ROUTE_HINTS } from "@bc/bcd-orchestration";
import {
  countPendingTasksByType,
  fetchCorpusExcerpt,
  fetchPendingTasks,
  fetchRecentOutcomes,
  insertAgentTask,
  updateAgentTaskStatus,
} from "../agent-db.js";
import { publicAppOrigin } from "../env.js";
import { runAgentLlm } from "../llm/run.js";
import { captureKpiSnapshot, recordOutcomeFromSnapshot } from "../outcome/scorer.js";
import { enrichKpiWithPostHog } from "../outcome/posthog-join.js";
import { postWeeklyLearningsBrief } from "../outcome/learnings.js";
import { runTool } from "../tools/registry.js";
import { processAgentTask } from "./task-worker.js";

const CEO_TASK_TYPES = [
  "grove_tick",
  "smoke_verify",
  "social_burst",
  "deploy_app",
  "git_sync",
  "seo_publish",
  "executive_review",
  "weekly_learnings",
  "fulfill_service_order",
  "fulfill_merch_batch",
  "service_milestone_review",
  "sync_identity_mint_price",
] as const;

function utcHour(): number {
  return new Date().getUTCHours();
}

function utcDay(): number {
  return new Date().getUTCDay();
}

async function probeEndpoint(path: string): Promise<boolean> {
  const base = publicAppOrigin();
  if (!base) return false;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${path}`);
    return res.ok;
  } catch {
    return false;
  }
}

async function planTasksRuleBased(
  databaseUrl: string,
  snapshot: Awaited<ReturnType<typeof captureKpiSnapshot>>,
): Promise<string[]> {
  const planned: string[] = [];
  const hour = utcHour();

  if (!snapshot.pulseOk) planned.push("smoke_verify");
  if (!snapshot.marketOk) planned.push("smoke_verify");

  if (hour % 4 === 0) {
    const pending = await countPendingTasksByType(databaseUrl, "grove_tick");
    if (pending === 0) planned.push("grove_tick");
  }

  if (hour === 8 || hour === 16) {
    const pending = await countPendingTasksByType(databaseUrl, "social_burst");
    if (pending === 0) planned.push("social_burst");
  }

  if (utcDay() === 1 && hour === 9) {
    planned.push("weekly_learnings");
    planned.push("executive_review");
  }

  if (snapshot.ledgerRows24h < 3) {
    planned.push("git_sync");
  }

  if (hour % 6 === 0) {
    const pending = await countPendingTasksByType(databaseUrl, "sync_identity_mint_price");
    if (pending === 0) planned.push("sync_identity_mint_price");
  }

  return [...new Set(planned)];
}

async function planTasksWithLlm(
  databaseUrl: string,
  agent: OpsAgentRecord,
  snapshot: Awaited<ReturnType<typeof captureKpiSnapshot>>,
  outcomes: Awaited<ReturnType<typeof fetchRecentOutcomes>>,
  corpus: Awaited<ReturnType<typeof fetchCorpusExcerpt>>,
): Promise<string[]> {
  const corpusText = corpus.map((c) => `- ${c.source}: ${c.content.slice(0, 200)}`).join("\n");
  const outcomeText = outcomes
    .slice(0, 5)
    .map((o) => `score=${o.rewardScore} learnings=${o.learnings?.slice(0, 80) ?? ""}`)
    .join("\n");

  const prompt = `Given KPI snapshot: ${JSON.stringify(snapshot)}
Recent outcomes:
${outcomeText || "none"}

Corpus excerpt:
${corpusText || "empty"}

Available task types: ${CEO_TASK_TYPES.join(", ")}
Routing hints: ${JSON.stringify(TASK_ROUTE_HINTS)}

Respond with a JSON array of 1-4 task type strings to queue next. No markdown.`;

  const llm = await runAgentLlm(databaseUrl, agent, prompt);
  if (!llm.ok || !llm.text) {
    return planTasksRuleBased(databaseUrl, snapshot);
  }
  try {
    const parsed = JSON.parse(llm.text.replace(/```json|```/g, "").trim()) as string[];
    if (Array.isArray(parsed)) {
      return parsed.filter((t) => CEO_TASK_TYPES.includes(t as (typeof CEO_TASK_TYPES)[number]));
    }
  } catch {
    /* fallback */
  }
  return planTasksRuleBased(databaseUrl, snapshot);
}

export async function runCeoOrchestratorTick(
  agent: OpsAgentRecord,
  databaseUrl: string,
): Promise<LedgerInsert[]> {
  const out: LedgerInsert[] = [];
  const pulseOk = await probeEndpoint("/api/pulse/metrics");
  const marketOk = await probeEndpoint("/api/market/bcc");
  const snapshot = await captureKpiSnapshot(databaseUrl, pulseOk, marketOk);
  const outcomes = await fetchRecentOutcomes(databaseUrl, 7);
  const corpus = await fetchCorpusExcerpt(databaseUrl, 3);

  const taskTypes = await planTasksWithLlm(databaseUrl, agent, snapshot, outcomes, corpus);
  const createdTaskIds: string[] = [];

  for (const type of taskTypes) {
    const hint = TASK_ROUTE_HINTS[type];
    const taskId = await insertAgentTask(databaseUrl, {
      type,
      payload: { hint: hint?.notes ?? null, plannedBy: "ceo-orchestrator" },
      priority: type === "smoke_verify" ? 10 : type === "deploy_app" ? 5 : 3,
      createdBy: agent.id,
    });
    createdTaskIds.push(taskId);
  }

  out.push({
    agentId: agent.id,
    action: "ceo.plan_tasks",
    params: { taskTypes, createdTaskIds, snapshot },
    dryRun: false,
    status: "ok",
    txHash: null,
    costUsd: null,
  });

  const pending = await fetchPendingTasks(databaseUrl, 5);
  for (const task of pending) {
    await updateAgentTaskStatus(databaseUrl, task.id, "running");
    const workerResult = await processAgentTask(task, databaseUrl, agent.id);
    await updateAgentTaskStatus(
      databaseUrl,
      task.id,
      workerResult.ok ? "completed" : "failed",
      workerResult.error ?? null,
    );
    out.push({
      agentId: agent.id,
      action: `ceo.task.${task.type}`,
      params: { taskId: task.id, ...workerResult.data },
      dryRun: workerResult.dryRun ?? false,
      status: workerResult.ok ? "ok" : "error",
      errorMsg: workerResult.error ?? null,
      txHash: null,
      costUsd: workerResult.costUsd != null ? String(workerResult.costUsd) : null,
    });
  }

  if (taskTypes.includes("weekly_learnings")) {
    const brief = await postWeeklyLearningsBrief(databaseUrl);
    out.push({
      agentId: agent.id,
      action: "ceo.weekly_learnings",
      params: brief,
      dryRun: false,
      status: "ok",
      txHash: null,
    });
  }

  if (utcHour() === 0) {
    const enriched = await enrichKpiWithPostHog(snapshot as unknown as Record<string, unknown>);
    const outcomeId = await recordOutcomeFromSnapshot(
      databaseUrl,
      { ...snapshot, ...(enriched.posthog ? { posthog: enriched.posthog } : {}) } as typeof snapshot,
      createdTaskIds,
    );
    out.push({
      agentId: agent.id,
      action: "ceo.record_outcome",
      params: { outcomeId, rewardScore: snapshot },
      dryRun: false,
      status: "ok",
      txHash: null,
    });
  }

  return out;
}
