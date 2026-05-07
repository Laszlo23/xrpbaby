import { randomUUID } from "node:crypto";
import pg from "pg";

export type LedgerInsert = {
  id?: string;
  agentId: string;
  action: string;
  params?: Record<string, unknown>;
  dryRun: boolean;
  txHash?: string | null;
  status: "ok" | "error" | "skipped";
  errorMsg?: string | null;
  costUsd?: string | null;
};

let pool: pg.Pool | null = null;

function getPool(databaseUrl: string): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({ connectionString: databaseUrl, max: 4 });
  }
  return pool;
}

export async function insertAgentActionLog(databaseUrl: string, row: LedgerInsert): Promise<string> {
  const p = getPool(databaseUrl);
  const id = row.id ?? randomUUID();
  const res = await p.query<{ id: string }>(
    `INSERT INTO "AgentActionLog" ("id","agentId","createdAt","action","params","dryRun","txHash","status","errorMsg","costUsd")
     VALUES ($1, $2, NOW(), $3, $4::jsonb, $5, $6, $7, $8, $9)
     RETURNING "id"`,
    [
      id,
      row.agentId,
      row.action,
      JSON.stringify(row.params ?? {}),
      row.dryRun,
      row.txHash ?? null,
      row.status,
      row.errorMsg ?? null,
      row.costUsd ?? null,
    ],
  );
  return res.rows[0]?.id ?? id;
}

export async function closeLedgerPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
