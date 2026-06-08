import { randomUUID } from "node:crypto";
import pg from "pg";

let pool: pg.Pool | null = null;

function getPool(databaseUrl: string): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({ connectionString: databaseUrl, max: 4 });
  }
  return pool;
}

export type AgentTaskRow = {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  priority: number;
  status: string;
  assignedAgentId: string | null;
  budgetUsdCap: string | null;
  createdBy: string;
  outcomeId: string | null;
  errorMsg: string | null;
  createdAt: Date;
};

export type AgentOutcomeRow = {
  id: string;
  actionLogIds: string[];
  kpiSnapshot: Record<string, unknown> | null;
  rewardScore: number | null;
  learnings: string | null;
  createdAt: Date;
};

export async function insertAgentTask(
  databaseUrl: string,
  row: {
    type: string;
    payload?: Record<string, unknown>;
    priority?: number;
    assignedAgentId?: string;
    budgetUsdCap?: string;
    createdBy?: string;
  },
): Promise<string> {
  const p = getPool(databaseUrl);
  const id = randomUUID();
  await p.query(
    `INSERT INTO "AgentTask" ("id","type","payload","priority","status","assignedAgentId","budgetUsdCap","createdBy","createdAt","updatedAt")
     VALUES ($1,$2,$3::jsonb,$4,'pending',$5,$6,$7,NOW(),NOW())`,
    [
      id,
      row.type,
      JSON.stringify(row.payload ?? {}),
      row.priority ?? 0,
      row.assignedAgentId ?? null,
      row.budgetUsdCap ?? null,
      row.createdBy ?? "ceo-orchestrator-0",
    ],
  );
  return id;
}

export async function fetchPendingTasks(
  databaseUrl: string,
  limit = 5,
): Promise<AgentTaskRow[]> {
  const p = getPool(databaseUrl);
  const res = await p.query<{
    id: string;
    type: string;
    payload: Record<string, unknown> | null;
    priority: number;
    status: string;
    assignedAgentId: string | null;
    budgetUsdCap: string | null;
    createdBy: string;
    outcomeId: string | null;
    errorMsg: string | null;
    createdAt: Date;
  }>(
    `SELECT "id","type","payload","priority","status","assignedAgentId","budgetUsdCap","createdBy","outcomeId","errorMsg","createdAt"
     FROM "AgentTask"
     WHERE "status" = 'pending'
     ORDER BY "priority" DESC, "createdAt" ASC
     LIMIT $1`,
    [limit],
  );
  return res.rows;
}

export async function updateAgentTaskStatus(
  databaseUrl: string,
  taskId: string,
  status: "running" | "completed" | "failed" | "cancelled",
  errorMsg?: string | null,
): Promise<void> {
  const p = getPool(databaseUrl);
  const now = new Date();
  if (status === "running") {
    await p.query(
      `UPDATE "AgentTask" SET "status"=$2,"startedAt"=$3,"updatedAt"=$3 WHERE "id"=$1`,
      [taskId, status, now],
    );
    return;
  }
  await p.query(
    `UPDATE "AgentTask" SET "status"=$2,"completedAt"=$3,"errorMsg"=$4,"updatedAt"=$3 WHERE "id"=$1`,
    [taskId, status, now, errorMsg ?? null],
  );
}

export async function countPendingTasksByType(
  databaseUrl: string,
  type: string,
): Promise<number> {
  const p = getPool(databaseUrl);
  const res = await p.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM "AgentTask" WHERE "type"=$1 AND "status" IN ('pending','running')`,
    [type],
  );
  return Number(res.rows[0]?.n ?? 0);
}

export async function fetchRecentOutcomes(
  databaseUrl: string,
  days = 7,
  limit = 10,
): Promise<AgentOutcomeRow[]> {
  const p = getPool(databaseUrl);
  const res = await p.query<{
    id: string;
    actionLogIds: unknown;
    kpiSnapshot: Record<string, unknown> | null;
    rewardScore: number | null;
    learnings: string | null;
    createdAt: Date;
  }>(
    `SELECT "id","actionLogIds","kpiSnapshot","rewardScore","learnings","createdAt"
     FROM "AgentOutcome"
     WHERE "createdAt" >= NOW() - ($1 || ' days')::interval
     ORDER BY "createdAt" DESC
     LIMIT $2`,
    [String(days), limit],
  );
  return res.rows.map((r) => ({
    id: r.id,
    actionLogIds: Array.isArray(r.actionLogIds) ? (r.actionLogIds as string[]) : [],
    kpiSnapshot: r.kpiSnapshot,
    rewardScore: r.rewardScore,
    learnings: r.learnings,
    createdAt: r.createdAt,
  }));
}

export async function insertAgentOutcome(
  databaseUrl: string,
  row: {
    actionLogIds?: string[];
    kpiSnapshot?: Record<string, unknown>;
    rewardScore?: number;
    learnings?: string;
    periodStart?: Date;
    periodEnd?: Date;
  },
): Promise<string> {
  const p = getPool(databaseUrl);
  const id = randomUUID();
  await p.query(
    `INSERT INTO "AgentOutcome" ("id","actionLogIds","kpiSnapshot","rewardScore","learnings","periodStart","periodEnd","createdAt")
     VALUES ($1,$2::jsonb,$3::jsonb,$4,$5,$6,$7,NOW())`,
    [
      id,
      JSON.stringify(row.actionLogIds ?? []),
      row.kpiSnapshot ? JSON.stringify(row.kpiSnapshot) : null,
      row.rewardScore ?? null,
      row.learnings ?? null,
      row.periodStart ?? null,
      row.periodEnd ?? null,
    ],
  );
  return id;
}

export async function getDailySpend(
  databaseUrl: string,
  agentId: string,
  spendDate: string,
): Promise<{ apiUsd: number; gasEth: number; deployUsd: number }> {
  const p = getPool(databaseUrl);
  const res = await p.query<{ apiUsd: string; gasEth: string; deployUsd: string }>(
    `SELECT "apiUsd","gasEth","deployUsd" FROM "AgentDailySpend" WHERE "agentId"=$1 AND "spendDate"=$2`,
    [agentId, spendDate],
  );
  const row = res.rows[0];
  return {
    apiUsd: Number(row?.apiUsd ?? 0),
    gasEth: Number(row?.gasEth ?? 0),
    deployUsd: Number(row?.deployUsd ?? 0),
  };
}

export async function addDailySpend(
  databaseUrl: string,
  agentId: string,
  spendDate: string,
  delta: { apiUsd?: number; gasEth?: number; deployUsd?: number },
): Promise<void> {
  const p = getPool(databaseUrl);
  const id = randomUUID();
  await p.query(
    `INSERT INTO "AgentDailySpend" ("id","agentId","spendDate","apiUsd","gasEth","deployUsd","createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())
     ON CONFLICT ("agentId","spendDate") DO UPDATE SET
       "apiUsd" = (COALESCE("AgentDailySpend"."apiUsd",'0')::numeric + $4::numeric)::text,
       "gasEth" = (COALESCE("AgentDailySpend"."gasEth",'0')::numeric + $5::numeric)::text,
       "deployUsd" = (COALESCE("AgentDailySpend"."deployUsd",'0')::numeric + $6::numeric)::text,
       "updatedAt" = NOW()`,
    [
      id,
      agentId,
      spendDate,
      String(delta.apiUsd ?? 0),
      String(delta.gasEth ?? 0),
      String(delta.deployUsd ?? 0),
    ],
  );
}

export async function getActivePrompt(
  databaseUrl: string,
  agentId: string,
): Promise<string | null> {
  const p = getPool(databaseUrl);
  const res = await p.query<{ systemPrompt: string }>(
    `SELECT "systemPrompt" FROM "AgentPromptVersion"
     WHERE "agentId"=$1 AND "active"=true
     ORDER BY "version" DESC LIMIT 1`,
    [agentId],
  );
  return res.rows[0]?.systemPrompt ?? null;
}

export async function insertPromptVersion(
  databaseUrl: string,
  agentId: string,
  systemPrompt: string,
  activate = false,
): Promise<number> {
  const p = getPool(databaseUrl);
  const verRes = await p.query<{ max: number | null }>(
    `SELECT MAX("version") AS max FROM "AgentPromptVersion" WHERE "agentId"=$1`,
    [agentId],
  );
  const version = (verRes.rows[0]?.max ?? 0) + 1;
  const id = randomUUID();
  if (activate) {
    await p.query(`UPDATE "AgentPromptVersion" SET "active"=false WHERE "agentId"=$1`, [agentId]);
  }
  await p.query(
    `INSERT INTO "AgentPromptVersion" ("id","agentId","version","systemPrompt","active","createdAt")
     VALUES ($1,$2,$3,$4,$5,NOW())`,
    [id, agentId, version, systemPrompt, activate],
  );
  return version;
}

export async function upsertCorpusChunk(
  databaseUrl: string,
  source: string,
  content: string,
  title?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const p = getPool(databaseUrl);
  const existing = await p.query<{ id: string }>(
    `SELECT "id" FROM "AgentCorpusChunk" WHERE "source"=$1 LIMIT 1`,
    [source],
  );
  if (existing.rows[0]) {
    await p.query(
      `UPDATE "AgentCorpusChunk" SET "content"=$2,"title"=$3,"metadata"=$4::jsonb,"updatedAt"=NOW() WHERE "id"=$1`,
      [existing.rows[0].id, content, title ?? null, metadata ? JSON.stringify(metadata) : null],
    );
    return;
  }
  await p.query(
    `INSERT INTO "AgentCorpusChunk" ("id","source","title","content","metadata","createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5::jsonb,NOW(),NOW())`,
    [randomUUID(), source, title ?? null, content, metadata ? JSON.stringify(metadata) : null],
  );
}

export async function fetchCorpusExcerpt(
  databaseUrl: string,
  limit = 5,
): Promise<{ source: string; title: string | null; content: string }[]> {
  const p = getPool(databaseUrl);
  const res = await p.query<{ source: string; title: string | null; content: string }>(
    `SELECT "source","title","content" FROM "AgentCorpusChunk" ORDER BY "updatedAt" DESC LIMIT $1`,
    [limit],
  );
  return res.rows;
}

export async function fetchTaskQueueSummary(databaseUrl: string): Promise<{
  pending: number;
  running: number;
  completed24h: number;
  failed24h: number;
}> {
  const p = getPool(databaseUrl);
  const res = await p.query<{ status: string; n: string }>(
    `SELECT "status", COUNT(*)::text AS n FROM "AgentTask"
     WHERE "createdAt" >= NOW() - interval '24 hours' OR "status" IN ('pending','running')
     GROUP BY "status"`,
  );
  let pending = 0;
  let running = 0;
  let completed24h = 0;
  let failed24h = 0;
  for (const row of res.rows) {
    const n = Number(row.n);
    if (row.status === "pending") pending = n;
    else if (row.status === "running") running = n;
    else if (row.status === "completed") completed24h = n;
    else if (row.status === "failed") failed24h = n;
  }
  const pendingRes = await p.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM "AgentTask" WHERE "status"='pending'`,
  );
  pending = Number(pendingRes.rows[0]?.n ?? pending);
  return { pending, running, completed24h, failed24h };
}

export async function fetchDailySpendSummary(
  databaseUrl: string,
  spendDate: string,
): Promise<{ agentId: string; apiUsd: string; gasEth: string; deployUsd: string }[]> {
  const p = getPool(databaseUrl);
  const res = await p.query<{ agentId: string; apiUsd: string; gasEth: string; deployUsd: string }>(
    `SELECT "agentId","apiUsd","gasEth","deployUsd" FROM "AgentDailySpend" WHERE "spendDate"=$1`,
    [spendDate],
  );
  return res.rows;
}
