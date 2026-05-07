import pg from "pg";

let pool: pg.Pool | null = null;

function getPool(databaseUrl: string): pg.Pool {
  if (!pool) pool = new pg.Pool({ connectionString: databaseUrl, max: 2 });
  return pool;
}

export async function ledgerActionCounts24h(
  databaseUrl: string,
): Promise<{ action: string; n: string }[]> {
  const p = getPool(databaseUrl);
  const r = await p.query<{ action: string; n: string }>(
    `SELECT "action", COUNT(*)::text AS n FROM "AgentActionLog"
     WHERE "createdAt" > NOW() - INTERVAL '24 hours'
     GROUP BY "action" ORDER BY COUNT(*) DESC`,
  );
  return r.rows;
}

export async function chainMintStats(databaseUrl: string): Promise<{
  total: number;
  topRecipients: { toAddress: string; n: number }[];
} | null> {
  const p = getPool(databaseUrl);
  try {
    const totalR = await p.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM "ChainMintEvent"`);
    const topR = await p.query<{ toAddress: string; n: string }>(
      `SELECT "toAddress", COUNT(*)::text AS n FROM "ChainMintEvent"
       GROUP BY "toAddress" ORDER BY COUNT(*) DESC LIMIT 10`,
    );
    return {
      total: Number(totalR.rows[0]?.c ?? 0),
      topRecipients: topR.rows.map((row) => ({
        toAddress: row.toAddress,
        n: Number(row.n),
      })),
    };
  } catch {
    return null;
  }
}

/** Daily on-chain check-in points task — approximates “streak leaders” via last-30d award count. */
export async function checkInLeadersLast30d(
  databaseUrl: string,
): Promise<{ address: string; awards: number }[] | null> {
  const p = getPool(databaseUrl);
  try {
    const r = await p.query<{ address: string; n: string }>(
      `SELECT w.address, COUNT(*)::text AS n
       FROM "PointLedger" pl
       JOIN "Wallet" w ON w.id = pl."walletId"
       WHERE pl."taskSlug" = $1
         AND pl."createdAt" > NOW() - INTERVAL '30 days'
       GROUP BY w.address
       ORDER BY COUNT(*) DESC
       LIMIT 15`,
      ["daily-checkin-onchain"],
    );
    return r.rows.map((row) => ({
      address: row.address,
      awards: Number(row.n),
    }));
  } catch {
    return null;
  }
}
