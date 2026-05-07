import { agentsPaused, databaseUrl } from "./env.js";
import { loadAgentsFile, findAgent } from "./load-agents.js";
import { insertAgentActionLog, type LedgerInsert } from "./ledger-pg.js";
import type { AgentRecord } from "./types.js";
import { HANDLER_REGISTRY } from "./handlers/registry.js";

export type DispatchResult = { agentId: string; logIds: string[]; skipped?: string };

function normalizeRows(r: LedgerInsert | LedgerInsert[]): LedgerInsert[] {
  return Array.isArray(r) ? r : [r];
}

export async function dispatchAgent(agent: AgentRecord, dbUrl: string): Promise<DispatchResult> {
  const logIds: string[] = [];
  const handler = HANDLER_REGISTRY[agent.handler];
  if (!handler) {
    const row: LedgerInsert = {
      agentId: agent.id,
      action: "runtime.unknown_handler",
      params: { handler: agent.handler, message: "No HANDLER_REGISTRY entry" },
      dryRun: true,
      status: "skipped",
      txHash: null,
      errorMsg: null,
      costUsd: null,
    };
    logIds.push(await insertAgentActionLog(dbUrl, row));
    return { agentId: agent.id, logIds };
  }

  const rows = normalizeRows(await handler(agent, dbUrl));
  for (const row of rows) {
    const dryRun = row.dryRun ?? false;
    logIds.push(await insertAgentActionLog(dbUrl, { ...row, dryRun }));
  }
  return { agentId: agent.id, logIds };
}

export async function runTick(opts: { agent?: string; configPath?: string }): Promise<DispatchResult[]> {
  if (agentsPaused()) {
    const db = databaseUrl();
    if (db) {
      await insertAgentActionLog(db, {
        agentId: "_system",
        action: "runtime.paused",
        params: { AGENTS_PAUSED: true },
        dryRun: true,
        status: "skipped",
        txHash: null,
        errorMsg: "AGENTS_PAUSED",
        costUsd: null,
      });
    }
    return [{ agentId: "_system", logIds: [], skipped: "AGENTS_PAUSED" }];
  }

  const dbUrl = databaseUrl();
  if (!dbUrl) {
    throw new Error("DATABASE_URL is required for agent runtime ledger");
  }

  const agents = await loadAgentsFile(opts.configPath);
  const target = opts.agent?.trim();
  const toRun =
    !target || target === "all" ? agents : agents.filter((a) => a.id === target);
  if (toRun.length === 0) {
    throw new Error(target ? `Agent not found: ${target}` : "No agents to run");
  }

  const results: DispatchResult[] = [];
  for (const agent of toRun) {
    results.push(await dispatchAgent(agent, dbUrl));
  }
  return results;
}

export async function runTickForAgentId(agentId: string, configPath?: string): Promise<DispatchResult> {
  if (agentsPaused()) {
    return { agentId, logIds: [], skipped: "AGENTS_PAUSED" };
  }
  const dbUrl = databaseUrl();
  if (!dbUrl) throw new Error("DATABASE_URL is required");
  const agents = await loadAgentsFile(configPath);
  const agent = findAgent(agents, agentId);
  if (!agent) throw new Error(`Agent not found: ${agentId}`);
  return dispatchAgent(agent, dbUrl);
}
