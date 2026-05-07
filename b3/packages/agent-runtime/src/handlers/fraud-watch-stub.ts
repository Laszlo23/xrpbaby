import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";

/** Live throttling runs in Strapi (`global::rate-limit-wallet`). This agent only records a heartbeat. */
export async function runFraudWatchStubTick(agent: OpsAgentRecord): Promise<LedgerInsert> {
  return {
    agentId: agent.id,
    action: "security.fraud_watch_heartbeat",
    params: {
      note: "IP /wallet rate limits enforced in Strapi (`wallet-rate-limit` middleware) — see `docs/STRAPI_HARDENING.md`",
    },
    dryRun: false,
    status: "ok",
    txHash: null,
    costUsd: null,
  };
}
