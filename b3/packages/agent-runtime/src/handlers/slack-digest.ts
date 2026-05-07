import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { ledgerActionCounts24h } from "../ledger-stats.js";
import { postSlackMessage } from "../slack.js";
import { agentsPaused, econLive } from "../env.js";

export async function runSlackDigestTick(agent: OpsAgentRecord, databaseUrl: string): Promise<LedgerInsert> {
  const url = process.env.SLACK_WEBHOOK_URL?.trim() || process.env.AGENT_SLACK_WEBHOOK_URL?.trim();
  const rows = await ledgerActionCounts24h(databaseUrl);
  const lines = rows.map((r) => `• ${r.action}: ${r.n}`).join("\n") || "• (no rows)";
  const body = [
    `*Agent fleet digest (24h)* — ${agent.id}`,
    `AGENTS_PAUSED=${agentsPaused()} · ECON_LIVE=${econLive()}`,
    "```",
    lines,
    "```",
  ].join("\n");

  if (!url) {
    return {
      agentId: agent.id,
      action: "ops.slack_digest",
      params: { skipped: "no_slack_webhook", preview: lines },
      dryRun: true,
      status: "skipped",
      txHash: null,
      errorMsg: null,
      costUsd: null,
    };
  }

  await postSlackMessage(url, body);
  return {
    agentId: agent.id,
    action: "ops.slack_digest",
    params: { rows: rows.length },
    dryRun: false,
    status: "ok",
    txHash: null,
    costUsd: null,
  };
}
