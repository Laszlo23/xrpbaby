import type { OpsAgentRecord, ProductAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { upsertCorpusChunk } from "../agent-db.js";
import { publicAppOrigin } from "../env.js";

export async function runFraudWatchTick(
  agent: OpsAgentRecord,
  databaseUrl: string,
): Promise<LedgerInsert> {
  let anomalyCount = 0;
  try {
    const pg = await import("pg");
    const pool = new pg.default.Pool({ connectionString: databaseUrl, max: 2 });
    const res = await pool.query<{ toAddress: string; n: string }>(
      `SELECT "toAddress", COUNT(*)::text AS n FROM "ChainMintEvent"
       WHERE "createdAt" > NOW() - INTERVAL '24 hours'
       GROUP BY "toAddress"
       HAVING COUNT(*) > $1`,
      [Number(process.env.FRAUD_MINT_THRESHOLD ?? "10")],
    );
    anomalyCount = res.rows.length;
    await pool.end();
  } catch {
    /* ignore */
  }

  return {
    agentId: agent.id,
    action: "security.fraud_watch",
    params: {
      anomalyWallets24h: anomalyCount,
      threshold: Number(process.env.FRAUD_MINT_THRESHOLD ?? "10"),
      note: "IP/wallet rate limits enforced in Strapi middleware",
    },
    dryRun: false,
    status: anomalyCount > 0 ? "error" : "ok",
    errorMsg: anomalyCount > 0 ? `high_velocity_mints:${anomalyCount}` : null,
    txHash: null,
    costUsd: null,
  };
}

export async function runEliasConciergeTick(
  agent: ProductAgentRecord,
  databaseUrl: string,
): Promise<LedgerInsert> {
  const origin = publicAppOrigin();
  let corpusSynced = 0;

  if (origin) {
    try {
      const res = await fetch(`${origin.replace(/\/$/, "")}/api/pulse/metrics`);
      if (res.ok) {
        const metrics = await res.text();
        await upsertCorpusChunk(
          databaseUrl,
          "pulse:metrics",
          metrics.slice(0, 8000),
          "Pulse metrics snapshot",
        );
        corpusSynced += 1;
      }
    } catch {
      /* ignore */
    }
  }

  return {
    agentId: agent.id,
    action: "elias.corpus_sync",
    params: { corpusSynced, origin: origin || null },
    dryRun: false,
    status: "ok",
    txHash: null,
    costUsd: null,
  };
}
