import pg from "pg";

export type ServiceOrderRow = {
  id: string;
  slug: string;
  wallet: string;
  status: string;
  threadId: string | null;
};

export async function fetchServiceOrderById(
  databaseUrl: string,
  orderId: string,
): Promise<ServiceOrderRow | null> {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 2 });
  try {
    const res = await pool.query<ServiceOrderRow>(
      `SELECT "id","slug","wallet","status","threadId" FROM "ServiceOrder" WHERE "id" = $1`,
      [orderId],
    );
    return res.rows[0] ?? null;
  } finally {
    await pool.end();
  }
}
