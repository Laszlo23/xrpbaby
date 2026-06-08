import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { publicAppOrigin, slackWebhookUrl } from "../env.js";
import { postSlackMessage } from "../slack.js";

type SettlementRow = {
  id: string;
  amountUsd: string | null;
  createdAt: Date;
};

export async function runX402MonetizerTick(
  agent: OpsAgentRecord,
  databaseUrl: string,
): Promise<LedgerInsert> {
  const base =
    publicAppOrigin() ||
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    process.env.VITE_PUBLIC_APP_ORIGIN?.trim() ||
    "";

  let probe: { ok: boolean; status: number } | null = null;
  if (base) {
    try {
      const u = `${base.replace(/\/$/, "")}/api/x402/premium`;
      const res = await fetch(u, { method: "HEAD", redirect: "manual" });
      probe = { ok: res.ok || res.status === 405, status: res.status };
    } catch {
      probe = { ok: false, status: 0 };
    }
  }

  let mrrEstimateUsd = 0;
  let settlementCount24h = 0;
  try {
    const pg = await import("pg");
    const pool = new pg.default.Pool({ connectionString: databaseUrl, max: 2 });
    const res = await pool.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM "AgentActionLog"
       WHERE "action" LIKE 'x402.%' AND "status"='ok'
         AND "createdAt" > NOW() - INTERVAL '24 hours'`,
    );
    settlementCount24h = Number(res.rows[0]?.c ?? 0);
    mrrEstimateUsd = settlementCount24h * Number(process.env.X402_PRICE?.replace("$", "") ?? "0.25") * 30;
    await pool.end();
  } catch {
    /* table may not have x402 rows yet */
  }

  const hook = slackWebhookUrl();
  if (hook) {
    const msg = [
      `*[x402-monetizer]* MRR estimate ~$${mrrEstimateUsd.toFixed(2)}`,
      `• settlements (24h): ${settlementCount24h}`,
      `• premium endpoint: ${probe ? `${probe.status} ${probe.ok ? "ok" : "degraded"}` : "unprobed"}`,
    ].join("\n");
    try {
      await postSlackMessage(hook, msg);
    } catch {
      /* ignore */
    }
  }

  return {
    agentId: agent.id,
    action: "monetize.x402_report",
    params: {
      appOrigin: base || null,
      premiumProbe: probe,
      settlementCount24h,
      mrrEstimateUsd,
    },
    dryRun: false,
    status: probe?.ok ? "ok" : "skipped",
    txHash: null,
    errorMsg: probe?.ok ? null : "premium_endpoint_degraded",
    costUsd: null,
  };
}
