import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";

/** Stub — wire payment verification against `/api/x402/premium` settlement + MRR tracking in Postgres. */
export async function runX402MonetizerTick(agent: OpsAgentRecord): Promise<LedgerInsert> {
  const base =
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    process.env.VITE_PUBLIC_APP_ORIGIN?.trim() ||
    "";
  let probe: { ok: boolean; status: number } | null = null;
  if (base) {
    try {
      const u = `${base.replace(/\/$/, "")}/api/x402/premium`;
      const res = await fetch(u, { method: "HEAD", redirect: "manual" });
      probe = { ok: res.ok, status: res.status };
    } catch {
      probe = { ok: false, status: 0 };
    }
  }
  return {
    agentId: agent.id,
    action: "monetize.x402_stub",
    params: {
      note: "Implement settlement replay + entitlement cache + MRR table",
      appOrigin: base || null,
      premiumProbe: probe,
    },
    dryRun: true,
    status: "skipped",
    txHash: null,
    errorMsg: null,
    costUsd: null,
  };
}
