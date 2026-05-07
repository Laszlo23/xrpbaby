import { getPrisma } from "@/server/db/prisma";

export type AgentFleetDashboard = {
  agentsPaused: boolean;
  econLive: boolean;
  indexedMintEvents: number;
  ledgerRowsLast24h: number;
  /** AgentActionLog rows last 24h for `elias-concierge-1` */
  eliasConciergeLedger24h: number;
  recentLogs: {
    id: string;
    agentId: string;
    createdAt: string;
    action: string;
    dryRun: boolean;
    status: string;
    txHash: string | null;
    /** JSON string for TanStack server-fn serialization */
    params: string | null;
  }[];
  /** Successful chain.ags_mint_transfer rows this UTC month for ags-distributor-1 */
  agsMonthlyOkCount: number;
};

export async function getAgentFleetDashboard(): Promise<AgentFleetDashboard | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const agentsPaused =
    process.env.AGENTS_PAUSED?.trim().toLowerCase() === "1" ||
    process.env.AGENTS_PAUSED?.trim().toLowerCase() === "true";
  const econLive =
    process.env.ECON_LIVE?.trim().toLowerCase() === "1" ||
    process.env.ECON_LIVE?.trim().toLowerCase() === "true";

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const dayAgo = new Date(Date.now() - 86400000);

  let recentLogs: Awaited<ReturnType<typeof prisma.agentActionLog.findMany>>;
  let agsMonthlyOkCount: number;
  let ledgerRowsLast24h: number;
  let eliasConciergeLedger24h: number;
  try {
    [recentLogs, agsMonthlyOkCount, ledgerRowsLast24h, eliasConciergeLedger24h] =
      await Promise.all([
        prisma.agentActionLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 25,
        }),
        prisma.agentActionLog.count({
          where: {
            agentId: "ags-distributor-1",
            action: "chain.ags_mint_transfer",
            status: "ok",
            createdAt: { gte: startOfMonth },
          },
        }),
        prisma.agentActionLog.count({
          where: { createdAt: { gte: dayAgo } },
        }),
        prisma.agentActionLog.count({
          where: {
            agentId: "elias-concierge-1",
            createdAt: { gte: dayAgo },
          },
        }),
      ]);
  } catch (e) {
    // If Prisma can't initialize in the current SSR runtime, degrade gracefully.
    // The API route will return a 503 "database_unconfigured" shape when we return null.
    console.warn("agent dashboard unavailable:", e);
    return null;
  }

  let indexedMintEvents = 0;
  try {
    indexedMintEvents = await prisma.chainMintEvent.count();
  } catch {
    indexedMintEvents = 0;
  }

  return {
    agentsPaused,
    econLive,
    indexedMintEvents,
    ledgerRowsLast24h,
    eliasConciergeLedger24h,
    agsMonthlyOkCount,
    recentLogs: recentLogs.map((r) => ({
      id: r.id,
      agentId: r.agentId,
      createdAt: r.createdAt.toISOString(),
      action: r.action,
      dryRun: r.dryRun,
      status: r.status,
      txHash: r.txHash,
      params: r.params === null || r.params === undefined ? null : JSON.stringify(r.params),
    })),
  };
}
