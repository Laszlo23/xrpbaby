import { fetchRecentOutcomes, insertAgentOutcome } from "../agent-db.js";
import { queryLedgerStats24h } from "../ledger-stats.js";

export type KpiSnapshot = {
  ledgerRows24h: number;
  topActions: { action: string; count: number }[];
  pulseOk: boolean | null;
  marketOk: boolean | null;
  avgRewardScore7d: number | null;
  capturedAt: string;
};

export async function captureKpiSnapshot(
  databaseUrl: string,
  pulseOk: boolean | null,
  marketOk: boolean | null,
): Promise<KpiSnapshot> {
  const stats = await queryLedgerStats24h(databaseUrl);
  const outcomes = await fetchRecentOutcomes(databaseUrl, 7, 20);
  const scores = outcomes
    .map((o) => o.rewardScore)
    .filter((s): s is number => s != null && Number.isFinite(s));
  const avgRewardScore7d =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  return {
    ledgerRows24h: stats.totalRows,
    topActions: stats.byAction.slice(0, 5),
    pulseOk,
    marketOk,
    avgRewardScore7d,
    capturedAt: new Date().toISOString(),
  };
}

export function computeRewardScore(snapshot: KpiSnapshot): number {
  let score = 0;
  if (snapshot.pulseOk) score += 25;
  if (snapshot.marketOk) score += 25;
  score += Math.min(snapshot.ledgerRows24h, 50);
  if (snapshot.avgRewardScore7d != null) {
    score += Math.min(snapshot.avgRewardScore7d, 25);
  }
  return Math.round(score * 10) / 10;
}

export async function recordOutcomeFromSnapshot(
  databaseUrl: string,
  snapshot: KpiSnapshot,
  actionLogIds: string[],
  learnings?: string,
): Promise<string> {
  const rewardScore = computeRewardScore(snapshot);
  return insertAgentOutcome(databaseUrl, {
    actionLogIds,
    kpiSnapshot: snapshot as unknown as Record<string, unknown>,
    rewardScore,
    learnings,
    periodEnd: new Date(),
    periodStart: new Date(Date.now() - 86400000),
  });
}
