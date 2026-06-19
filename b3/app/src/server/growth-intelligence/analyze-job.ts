import type { PrismaClient } from "@prisma/client";
import {
  buildDailyReportMarkdown,
  generateRuleInsights,
  generateRuleRecommendations,
  type AnalysisInput,
  type RuleRecommendation,
} from "@bc/growth-intelligence/server";

import { computeFunnelAnalysis } from "./funnels";
import { generateLlmInsights } from "./llm-insights";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayId(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export async function runDailyAnalysisForApp(
  prisma: PrismaClient,
  appId: string,
  appName: string,
): Promise<{ insights: number; recommendations: number; report: string }> {
  const since = new Date(Date.now() - DAY_MS);
  const id = dayId();

  const [sessions, events, rageClicks, pageViews, clicks, lastEvents] = await Promise.all([
    prisma.growthSession.count({ where: { appId, startedAt: { gte: since } } }),
    prisma.growthEvent.count({ where: { appId, occurredAt: { gte: since } } }),
    prisma.growthEvent.count({
      where: { appId, kind: "rage_click", occurredAt: { gte: since } },
    }),
    prisma.growthEvent.groupBy({
      by: ["pathname"],
      where: { appId, kind: "page_view", occurredAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.growthEvent.groupBy({
      by: ["selector"],
      where: {
        appId,
        kind: { in: ["click", "rage_click"] },
        occurredAt: { gte: since },
        selector: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.growthEvent.findMany({
      where: { appId, occurredAt: { gte: since } },
      select: { sessionId: true, pathname: true, occurredAt: true },
      orderBy: { occurredAt: "desc" },
      take: 5000,
    }),
  ]);

  const exitCounts = new Map<string, number>();
  const lastBySession = new Map<string, string>();
  for (const ev of lastEvents) {
    if (!lastBySession.has(ev.sessionId)) {
      lastBySession.set(ev.sessionId, ev.pathname);
    }
  }
  for (const pathname of lastBySession.values()) {
    exitCounts.set(pathname, (exitCounts.get(pathname) ?? 0) + 1);
  }
  const dropoffPages = [...exitCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pathname, exits]) => ({ pathname, exits }));

  const input: AnalysisInput = {
    appName,
    windowLabel: "last 24h",
    totalSessions: sessions,
    totalEvents: events,
    rageClicks,
    topPages: pageViews.map((p) => ({ pathname: p.pathname, views: p._count.id })),
    topClicks: clicks
      .filter((c) => c.selector)
      .map((c) => ({ selector: c.selector!, count: c._count.id })),
    dropoffPages,
  };

  const funnel = await computeFunnelAnalysis(prisma, appId, 1);

  const insights = generateRuleInsights(input);
  const recommendations: RuleRecommendation[] = [...generateRuleRecommendations(input)];

  if (funnel?.biggestLeak && funnel.biggestLeak.dropoffPct >= 25) {
    recommendations.unshift({
      problem: `Funnel leak at "${funnel.biggestLeak.label}"`,
      rootCause: `${funnel.biggestLeak.dropoffPct}% of users drop between this step and the next`,
      solution: `Simplify the ${funnel.biggestLeak.label} step — reduce fields, add progress indicator, surface trust signals`,
      impactEstimate: "+10–22% funnel completion",
      effort: "medium",
      priority: funnel.biggestLeak.dropoffPct >= 50 ? "critical" : "high",
    });
  }

  const llmInsights = await generateLlmInsights(input, funnel);
  const allInsights = [
    ...insights,
    ...llmInsights.map((i) => ({
      title: i.title,
      body: i.body,
      severity: i.severity,
    })),
  ];

  const report = buildDailyReportMarkdown(input, allInsights);

  for (const insight of allInsights) {
    await prisma.growthInsight.upsert({
      where: {
        appId_kind_dayId_title: {
          appId,
          kind: "daily",
          dayId: id,
          title: insight.title,
        },
      },
      create: {
        appId,
        kind: "daily",
        dayId: id,
        title: insight.title,
        body: insight.body,
        severity: insight.severity,
        metrics: { sessions, events, rageClicks, funnel: funnel?.biggestLeak ?? null },
      },
      update: {
        body: insight.body,
        severity: insight.severity,
        metrics: { sessions, events, rageClicks, funnel: funnel?.biggestLeak ?? null },
      },
    });
  }

  for (const rec of recommendations) {
    const existing = await prisma.growthRecommendation.findFirst({
      where: { appId, problem: rec.problem, status: "open" },
    });
    if (existing) {
      await prisma.growthRecommendation.update({
        where: { id: existing.id },
        data: {
          rootCause: rec.rootCause,
          solution: rec.solution,
          impactEstimate: rec.impactEstimate,
          effort: rec.effort,
          priority: rec.priority,
          dayId: id,
        },
      });
    } else {
      await prisma.growthRecommendation.create({
        data: {
          appId,
          problem: rec.problem,
          rootCause: rec.rootCause,
          solution: rec.solution,
          impactEstimate: rec.impactEstimate,
          effort: rec.effort,
          priority: rec.priority,
          dayId: id,
        },
      });
    }
  }

  return {
    insights: allInsights.length,
    recommendations: recommendations.length,
    report,
  };
}

export async function runDailyAnalysisAll(prisma: PrismaClient): Promise<void> {
  const apps = await prisma.growthApp.findMany({ select: { id: true, name: true, slug: true } });
  for (const app of apps) {
    const result = await runDailyAnalysisForApp(prisma, app.id, app.name);
    console.log(`[gi] ${app.slug}: ${result.insights} insights, ${result.recommendations} recs`);
  }
}
