import type { GrowthRecommendationPriority } from "../types.js";

export type EventAggregate = {
  kind: string;
  count: number;
  pathname?: string;
  selector?: string;
};

export type AnalysisInput = {
  appName: string;
  windowLabel: string;
  totalSessions: number;
  totalEvents: number;
  rageClicks: number;
  topPages: { pathname: string; views: number }[];
  topClicks: { selector: string; count: number }[];
  dropoffPages: { pathname: string; exits: number }[];
};

export type RuleInsight = {
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
};

export type RuleRecommendation = {
  problem: string;
  rootCause: string;
  solution: string;
  impactEstimate: string;
  effort: "low" | "medium" | "high";
  priority: GrowthRecommendationPriority;
};

export function generateRuleInsights(input: AnalysisInput): RuleInsight[] {
  const insights: RuleInsight[] = [];

  if (input.totalSessions > 0) {
    const rageRate = input.rageClicks / input.totalSessions;
    if (rageRate > 0.15) {
      insights.push({
        title: "High frustration signals",
        body: `${Math.round(rageRate * 100)}% of sessions show rage clicks. Users are clicking repeatedly without response.`,
        severity: "critical",
      });
    }
  }

  if (input.topPages[0]) {
    insights.push({
      title: "Highest traffic page",
      body: `${input.topPages[0].pathname} received ${input.topPages[0].views} views in ${input.windowLabel}.`,
      severity: "info",
    });
  }

  if (input.dropoffPages[0]) {
    insights.push({
      title: "Highest dropoff page",
      body: `Users exit most often from ${input.dropoffPages[0].pathname} (${input.dropoffPages[0].exits} session ends).`,
      severity: "warning",
    });
  }

  if (input.topClicks[0]) {
    insights.push({
      title: "Most clicked element",
      body: `"${input.topClicks[0].selector}" was clicked ${input.topClicks[0].count} times.`,
      severity: "info",
    });
  }

  return insights;
}

export function generateRuleRecommendations(input: AnalysisInput): RuleRecommendation[] {
  const recs: RuleRecommendation[] = [];

  if (input.rageClicks > 5 && input.topClicks[0]) {
    recs.push({
      problem: "Users rage-click on interactive elements",
      rootCause: `Element ${input.topClicks[0].selector} may be unresponsive or slow`,
      solution: "Add loading state, debounce handler, and verify click target receives events",
      impactEstimate: "+12–20% completion on affected flows",
      effort: "low",
      priority: "high",
    });
  }

  if (input.dropoffPages[0]) {
    recs.push({
      problem: `High exit rate on ${input.dropoffPages[0].pathname}`,
      rootCause: "Page may lack clear next step or trust signals",
      solution: "Add progressive disclosure, social proof, and a single primary CTA",
      impactEstimate: "+8–15% funnel conversion",
      effort: "medium",
      priority: "high",
    });
  }

  if (input.topClicks[0]?.selector.includes("reputation")) {
    recs.push({
      problem: "Users click reputation score without detail view",
      rootCause: "Reputation is visible but not explorable",
      solution: "Create Reputation Detail Page with history and badges",
      impactEstimate: "+18% engagement",
      effort: "medium",
      priority: "high",
    });
  }

  if (recs.length === 0 && input.totalEvents > 0) {
    recs.push({
      problem: "Insufficient signal for automated recommendations",
      rootCause: "Need more session volume or funnel configuration",
      solution: "Enable SDK on more pages and define funnel steps in admin",
      impactEstimate: "Baseline established",
      effort: "low",
      priority: "low",
    });
  }

  return recs;
}

export function buildDailyReportMarkdown(input: AnalysisInput, insights: RuleInsight[]): string {
  const lines = [
    `# Daily Growth Intelligence — ${input.appName}`,
    "",
    `**Window:** ${input.windowLabel}`,
    "",
    "## Overview",
    `- Sessions: ${input.totalSessions}`,
    `- Events: ${input.totalEvents}`,
    `- Rage clicks: ${input.rageClicks}`,
    "",
    "## Insights",
  ];

  for (const i of insights) {
    lines.push(`- **${i.title}** (${i.severity}): ${i.body}`);
  }

  lines.push("", "## Top pages");
  for (const p of input.topPages.slice(0, 5)) {
    lines.push(`- ${p.pathname}: ${p.views} views`);
  }

  return lines.join("\n");
}
