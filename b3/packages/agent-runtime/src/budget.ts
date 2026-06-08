import type { AgentRecord } from "./types.js";
import { addDailySpend, getDailySpend } from "./agent-db.js";

export function utcSpendDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function checkApiBudget(
  databaseUrl: string,
  agent: AgentRecord,
  estimatedCostUsd = 0,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const cap = agent.dailyApiBudgetUsd;
  if (cap === undefined || cap === 0) return { ok: true };
  const spend = await getDailySpend(databaseUrl, agent.id, utcSpendDate());
  if (spend.apiUsd + estimatedCostUsd > cap) {
    return { ok: false, reason: `daily_api_budget_exceeded:${spend.apiUsd}/${cap}` };
  }
  return { ok: true };
}

export async function recordApiSpend(
  databaseUrl: string,
  agentId: string,
  costUsd: number,
): Promise<void> {
  if (costUsd <= 0) return;
  await addDailySpend(databaseUrl, agentId, utcSpendDate(), { apiUsd: costUsd });
}

export async function checkGasCap(
  databaseUrl: string,
  agentId: string,
  capEth: number,
  deltaEth: number,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const spend = await getDailySpend(databaseUrl, agentId, utcSpendDate());
  if (spend.gasEth + deltaEth > capEth) {
    return { ok: false, reason: `daily_gas_cap_exceeded:${spend.gasEth}/${capEth}` };
  }
  return { ok: true };
}

export async function recordGasSpend(
  databaseUrl: string,
  agentId: string,
  gasEth: number,
): Promise<void> {
  if (gasEth <= 0) return;
  await addDailySpend(databaseUrl, agentId, utcSpendDate(), { gasEth });
}

export async function checkDeployCap(
  databaseUrl: string,
  agentId: string,
  capUsd: number,
  deltaUsd: number,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const spend = await getDailySpend(databaseUrl, agentId, utcSpendDate());
  if (spend.deployUsd + deltaUsd > capUsd) {
    return { ok: false, reason: `daily_deploy_cap_exceeded:${spend.deployUsd}/${capUsd}` };
  }
  return { ok: true };
}

export async function recordDeploySpend(
  databaseUrl: string,
  agentId: string,
  deployUsd: number,
): Promise<void> {
  if (deployUsd <= 0) return;
  await addDailySpend(databaseUrl, agentId, utcSpendDate(), { deployUsd });
}
