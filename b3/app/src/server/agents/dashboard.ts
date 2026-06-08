import { getPrisma } from "@/server/db/prisma";

function stringifyParams(params: unknown): string | null {
  if (params === null || params === undefined) return null;
  try {
    return JSON.stringify(params, (_k, v) => (typeof v === "bigint" ? v.toString() : v));
  } catch {
    return null;
  }
}

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
  taskQueue: {
    pending: number;
    running: number;
    completed24h: number;
    failed24h: number;
  };
  dailySpend: {
    agentId: string;
    apiUsd: string;
    gasEth: string;
    deployUsd: string;
  }[];
  recentOutcomes: {
    id: string;
    rewardScore: number | null;
    learnings: string | null;
    createdAt: string;
  }[];
};

export async function getAgentFleetDashboard(): Promise<AgentFleetDashboard | null> {
  try {
    return await loadAgentFleetDashboard();
  } catch (e) {
    console.warn("getAgentFleetDashboard failed:", e);
    return null;
  }
}

async function loadAgentFleetDashboard(): Promise<AgentFleetDashboard | null> {
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
  const spendDate = new Date().toISOString().slice(0, 10);

  let recentLogs: Awaited<ReturnType<typeof prisma.agentActionLog.findMany>>;
  let agsMonthlyOkCount: number;
  let ledgerRowsLast24h: number;
  let eliasConciergeLedger24h: number;
  let taskPending = 0;
  let taskRunning = 0;
  let taskCompleted24h = 0;
  let taskFailed24h = 0;
  let dailySpend: {
    agentId: string;
    apiUsd: { toString(): string };
    gasEth: { toString(): string };
    deployUsd: { toString(): string };
  }[] = [];
  let recentOutcomes: {
    id: string;
    rewardScore: number | null;
    learnings: string | null;
    createdAt: Date;
  }[] = [];

  try {
    [
      recentLogs,
      agsMonthlyOkCount,
      ledgerRowsLast24h,
      eliasConciergeLedger24h,
      taskPending,
      taskRunning,
      taskCompleted24h,
      taskFailed24h,
      dailySpend,
      recentOutcomes,
    ] = await Promise.all([
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
      prisma.agentTask.count({ where: { status: "pending" } }),
      prisma.agentTask.count({ where: { status: "running" } }),
      prisma.agentTask.count({
        where: { status: "completed", updatedAt: { gte: dayAgo } },
      }),
      prisma.agentTask.count({
        where: { status: "failed", updatedAt: { gte: dayAgo } },
      }),
      prisma.agentDailySpend.findMany({
        where: { spendDate },
        select: { agentId: true, apiUsd: true, gasEth: true, deployUsd: true },
      }),
      prisma.agentOutcome.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, rewardScore: true, learnings: true, createdAt: true },
      }),
    ]);
  } catch (e) {
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
      params: stringifyParams(r.params),
    })),
    taskQueue: {
      pending: taskPending,
      running: taskRunning,
      completed24h: taskCompleted24h,
      failed24h: taskFailed24h,
    },
    dailySpend: dailySpend.map((s) => ({
      agentId: s.agentId,
      apiUsd: s.apiUsd.toString(),
      gasEth: s.gasEth.toString(),
      deployUsd: s.deployUsd.toString(),
    })),
    recentOutcomes: recentOutcomes.map((o) => ({
      id: o.id,
      rewardScore: o.rewardScore,
      learnings: o.learnings,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}
