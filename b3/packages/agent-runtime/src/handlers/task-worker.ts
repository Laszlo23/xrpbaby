import type { AgentTaskRow } from "../agent-db.js";
import { loadAgentsFile, findAgent } from "../load-agents.js";
import { dispatchAgent } from "../dispatcher.js";
import { runTool } from "../tools/registry.js";
import { checkDeployCap, recordDeploySpend } from "../budget.js";
import { agentDailyDeployCapUsd } from "../env.js";
import { runGroveMarketingTick } from "./grove-marketing.js";
import { runSocialScoutTick } from "./social-scout.js";
import { runSeoPublisherTick } from "./seo-publisher.js";
import { runDeployAppTick } from "./deploy-app.js";
import { runDeployContractsTick } from "./deploy-contracts.js";
import { runPropertyVerificationHandler } from "./property-verification.js";
import type { OpsAgentRecord } from "../types.js";

export type TaskWorkerResult = {
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
  dryRun?: boolean;
  costUsd?: number;
};

const TASK_TOOL_MAP: Record<string, string> = {
  smoke_verify: "smoke.production",
  git_sync: "git.pull",
  deploy_app: "deploy.app",
  deploy_contract: "deploy.contracts",
};

export async function processAgentTask(
  task: AgentTaskRow,
  databaseUrl: string,
  ceoAgentId: string,
): Promise<TaskWorkerResult> {
  const payload = task.payload ?? {};

  if (task.type === "grove_tick") {
    const agents = await loadAgentsFile();
    const grove = findAgent(agents, "grove-marketing-1");
    if (!grove) return { ok: false, error: "grove_agent_not_found" };
    const rows = await runGroveMarketingTick(grove as OpsAgentRecord);
    const row = Array.isArray(rows) ? rows[0] : rows;
    return {
      ok: row?.status === "ok",
      data: { action: row?.action, params: row?.params },
      error: row?.errorMsg ?? undefined,
      dryRun: row?.dryRun,
    };
  }

  if (task.type === "social_burst") {
    const agents = await loadAgentsFile();
    const scout = findAgent(agents, "social-scout-1");
    if (!scout) return { ok: false, error: "social_scout_not_found" };
    const row = await runSocialScoutTick(scout as OpsAgentRecord);
    return {
      ok: row.status === "ok",
      data: { action: row.action, params: row.params },
      error: row.errorMsg ?? undefined,
      dryRun: row.dryRun,
    };
  }

  if (task.type === "seo_publish") {
    const agents = await loadAgentsFile();
    const seo = findAgent(agents, "seo-publisher-1");
    if (!seo) return { ok: false, error: "seo_agent_not_found" };
    const row = await runSeoPublisherTick(seo as OpsAgentRecord);
    return {
      ok: row.status === "ok",
      data: { action: row.action, params: row.params },
      error: row.errorMsg ?? undefined,
      dryRun: row.dryRun,
    };
  }

  if (task.type === "deploy_app") {
    const cap = await checkDeployCap(databaseUrl, ceoAgentId, agentDailyDeployCapUsd(), 10);
    if (!cap.ok) return { ok: false, error: cap.reason, dryRun: true };
    const agents = await loadAgentsFile();
    const ceo = findAgent(agents, ceoAgentId) ?? findAgent(agents, "ceo-orchestrator-0");
    if (!ceo) return { ok: false, error: "ceo_agent_not_found" };
    const rows = await runDeployAppTick(ceo as OpsAgentRecord, databaseUrl);
    const row = rows[0];
    if (row?.status === "ok") await recordDeploySpend(databaseUrl, ceoAgentId, 10);
    return {
      ok: row?.status === "ok",
      data: row?.params as Record<string, unknown>,
      error: row?.errorMsg ?? undefined,
      dryRun: row?.dryRun,
      costUsd: 10,
    };
  }

  if (task.type === "deploy_contract") {
    const agents = await loadAgentsFile();
    const ceo = findAgent(agents, ceoAgentId) ?? findAgent(agents, "ceo-orchestrator-0");
    if (!ceo) return { ok: false, error: "ceo_agent_not_found" };
    const rows = await runDeployContractsTick(ceo as OpsAgentRecord, databaseUrl, payload);
    const row = rows[0];
    return {
      ok: row?.status === "ok",
      data: row?.params as Record<string, unknown>,
      error: row?.errorMsg ?? undefined,
      dryRun: row?.dryRun,
    };
  }

  if (task.type === "property_verification") {
    const result = runPropertyVerificationHandler({
      listingId: String(payload.listingId ?? ""),
      metadata: (payload.metadata as Record<string, unknown>) ?? {},
      photoCount: Number(payload.photoCount ?? 0),
      documents: (payload.documents as { docKind: string }[]) ?? [],
    });
    return {
      ok: result.pass || result.needsHuman,
      data: result as unknown as Record<string, unknown>,
      error: result.pass ? undefined : result.gaps.join("; "),
    };
  }

  if (task.type === "executive_review") {
    return { ok: true, data: { reviewed: true, payload } };
  }

  if (task.type === "weekly_learnings") {
    return { ok: true, data: { note: "handled_by_ceo_tick" } };
  }

  const toolId = TASK_TOOL_MAP[task.type];
  if (toolId) {
    const agents = await loadAgentsFile();
    const ceo = findAgent(agents, ceoAgentId) ?? findAgent(agents, "ceo-orchestrator-0");
    if (!ceo) return { ok: false, error: "ceo_agent_not_found" };
    const result = await runTool(ceo, databaseUrl, toolId, payload);
    return {
      ok: result.ok,
      data: result.data,
      error: result.error,
      costUsd: result.costUsd,
    };
  }

  return { ok: false, error: `unknown_task_type:${task.type}` };
}
