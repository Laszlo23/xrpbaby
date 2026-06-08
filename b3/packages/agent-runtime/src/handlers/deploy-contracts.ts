import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { agentWeeklyContractDeployCap, econLive, agentDailyDeployCapUsd } from "../env.js";
import { countPendingTasksByType } from "../agent-db.js";
import { checkDeployCap, recordDeploySpend } from "../budget.js";
import { runTool } from "../tools/registry.js";

export async function runDeployContractsTick(
  agent: OpsAgentRecord,
  databaseUrl: string,
  payload?: Record<string, unknown>,
): Promise<LedgerInsert[]> {
  if (!econLive()) {
    return [
      {
        agentId: agent.id,
        action: "deploy.contracts",
        params: { skipped: "ECON_LIVE_off" },
        dryRun: true,
        status: "skipped",
        errorMsg: "ECON_LIVE=0",
        txHash: null,
      },
    ];
  }

  const capCheck = await checkDeployCap(databaseUrl, agent.id, agentDailyDeployCapUsd(), 5);
  if (!capCheck.ok) {
    return [
      {
        agentId: agent.id,
        action: "deploy.contracts",
        params: { skipped: capCheck.reason },
        dryRun: true,
        status: "skipped",
        errorMsg: capCheck.reason,
        txHash: null,
      },
    ];
  }

  const weeklyCap = agentWeeklyContractDeployCap();
  const recentDeploys = await countPendingTasksByType(databaseUrl, "deploy_contract");
  if (recentDeploys >= weeklyCap) {
    return [
      {
        agentId: agent.id,
        action: "deploy.contracts",
        params: { skipped: "weekly_cap", weeklyCap },
        dryRun: true,
        status: "skipped",
        errorMsg: "weekly_contract_deploy_cap",
        txHash: null,
      },
    ];
  }

  const script = String(payload?.script ?? "script/DeployAgentId.s.sol:DeployAgentId");
  const result = await runTool(agent, databaseUrl, "deploy.contracts", { script });

  if (result.ok && result.costUsd) {
    await recordDeploySpend(databaseUrl, agent.id, result.costUsd);
  }

  return [
    {
      agentId: agent.id,
      action: "deploy.contracts",
      params: { script, ...result.data, error: result.error },
      dryRun: !econLive(),
      status: result.ok ? "ok" : "error",
      errorMsg: result.error ?? null,
      txHash: null,
      costUsd: result.costUsd != null ? String(result.costUsd) : null,
    },
  ];
}
