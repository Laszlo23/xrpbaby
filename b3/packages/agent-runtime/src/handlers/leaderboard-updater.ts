import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { chainMintStats, checkInLeadersLast30d } from "../ledger-stats.js";

export async function runLeaderboardUpdaterTick(
  agent: OpsAgentRecord,
  databaseUrl: string,
): Promise<LedgerInsert> {
  const stats = await chainMintStats(databaseUrl);
  const checkIns = await checkInLeadersLast30d(databaseUrl);
  if (!stats) {
    return {
      agentId: agent.id,
      action: "indexer.leaderboard_snapshot",
      params: {
        note: "ChainMintEvent table missing or empty — run `npm run chain:index` in frontend",
        checkInLeadersLast30d: checkIns,
      },
      dryRun: true,
      status: "skipped",
      txHash: null,
      errorMsg: null,
      costUsd: null,
    };
  }

  return {
    agentId: agent.id,
    action: "indexer.leaderboard_snapshot",
    params: {
      totalMintsIndexed: stats.total,
      topRecipients: stats.topRecipients,
      checkInLeadersLast30d: checkIns,
    },
    dryRun: false,
    status: "ok",
    txHash: null,
    costUsd: null,
  };
}
