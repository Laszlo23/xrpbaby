import pg from "pg";

export type LedgerRow = {
  action: string;
  params: unknown;
  createdAt: Date;
  status: string;
};

export async function fetchMonthlyMintTransferRows(databaseUrl: string, agentId?: string): Promise<LedgerRow[]> {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 2 });
  try {
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    const agentClause = agentId ? ` AND "agentId" = $3` : "";
    const params: unknown[] = ["chain.ags_mint_transfer", start];
    if (agentId) params.push(agentId);
    const res = await pool.query<{
      action: string;
      params: unknown;
      createdAt: Date;
      status: string;
    }>(
      `SELECT "action", "params", "createdAt", "status"
       FROM "AgentActionLog"
       WHERE "action" = $1 AND "createdAt" >= $2${agentClause}`,
      params,
    );
    return res.rows.map((r) => ({
      action: r.action,
      params: r.params,
      createdAt: new Date(r.createdAt),
      status: r.status,
    }));
  } finally {
    await pool.end();
  }
}

export async function countAgentMonthlySuccessfulMints(databaseUrl: string, agentId: string): Promise<number> {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 2 });
  try {
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    const res = await pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM "AgentActionLog"
       WHERE "agentId" = $1 AND "action" = $2 AND "status" = 'ok' AND "createdAt" >= $3`,
      [agentId, "chain.ags_mint_transfer", start],
    );
    return Number(res.rows[0]?.n ?? 0);
  } finally {
    await pool.end();
  }
}
