import type { PrismaClient } from "@prisma/client";
import {
  analyzeFunnelFromSessions,
  DEFAULT_ECOSYSTEM_FUNNEL,
  type FunnelAnalysisResult,
  type FunnelStepDef,
} from "@bc/growth-intelligence/server";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function ensureDefaultFunnels(prisma: PrismaClient, appId: string): Promise<void> {
  const existing = await prisma.growthFunnel.findFirst({
    where: { appId, name: DEFAULT_ECOSYSTEM_FUNNEL.name },
  });
  if (existing) return;

  await prisma.growthFunnel.create({
    data: {
      appId,
      name: DEFAULT_ECOSYSTEM_FUNNEL.name,
      steps: DEFAULT_ECOSYSTEM_FUNNEL.steps,
      active: true,
    },
  });
}

export async function computeFunnelAnalysis(
  prisma: PrismaClient,
  appId: string,
  days = 7,
): Promise<FunnelAnalysisResult | null> {
  const since = new Date(Date.now() - days * DAY_MS);

  const funnel = await prisma.growthFunnel.findFirst({
    where: { appId, active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!funnel) return null;

  const steps = funnel.steps as FunnelStepDef[];
  if (!Array.isArray(steps) || steps.length === 0) return null;

  const sessions = await prisma.growthSession.findMany({
    where: { appId, startedAt: { gte: since } },
    select: { id: true },
  });
  if (sessions.length === 0) {
    return analyzeFunnelFromSessions(funnel.name, steps, new Map());
  }

  const sessionIds = sessions.map((s) => s.id);
  const events = await prisma.growthEvent.findMany({
    where: { appId, sessionId: { in: sessionIds }, occurredAt: { gte: since } },
    select: { sessionId: true, kind: true, pathname: true, selector: true },
    orderBy: { occurredAt: "asc" },
  });

  const bySession = new Map<
    string,
    { kind: string; pathname: string; selector: string | null }[]
  >();
  for (const sid of sessionIds) bySession.set(sid, []);
  for (const ev of events) {
    bySession.get(ev.sessionId)?.push({
      kind: ev.kind,
      pathname: ev.pathname,
      selector: ev.selector,
    });
  }

  return analyzeFunnelFromSessions(funnel.name, steps, bySession);
}
