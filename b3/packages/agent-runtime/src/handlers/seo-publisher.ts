import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";

/** Phase 1: stub — wire Lighthouse + Strapi publish + Slack approval per roadmap. */
export async function runSeoPublisherTick(agent: OpsAgentRecord): Promise<LedgerInsert> {
  return {
    agentId: agent.id,
    action: "ops.seo_publish_stub",
    params: {
      note: "Extend: Lighthouse score ≥ threshold, Strapi duplicate slug check, Slack :white_check_mark: approval before publish",
      checklist: ["lighthouse_mobile", "canonical_url", "strapi_dedupe", "slack_approval"],
    },
    dryRun: true,
    status: "skipped",
    txHash: null,
    errorMsg: null,
    costUsd: null,
  };
}
