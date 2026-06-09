export {
  generateRuleInsights,
  generateRuleRecommendations,
  buildDailyReportMarkdown,
  type AnalysisInput,
  type RuleInsight,
  type RuleRecommendation,
  type EventAggregate,
} from "./analyze.js";

export {
  analyzeFunnelFromSessions,
  DEFAULT_ECOSYSTEM_FUNNEL,
  type DefaultFunnelTemplate,
  type FunnelAnalysisResult,
  type FunnelStepDef,
  type FunnelStepResult,
} from "./funnels.js";

export {
  buildClickHeatmap,
  type HeatmapCell,
  type HeatmapPoint,
} from "./heatmap.js";

export {
  ECOSYSTEM_APPS,
  type GrowthAppSeed,
  type GrowthEventInput,
  type GrowthEventKind,
  type GrowthIngestBatch,
  type GrowthInsightKind,
  type GrowthRecommendationPriority,
  type GrowthRecommendationStatus,
} from "../types.js";
