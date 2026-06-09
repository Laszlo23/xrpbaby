export type GrowthEventKind =
  | "page_view"
  | "click"
  | "scroll"
  | "mousemove"
  | "rage_click"
  | "dead_click"
  | "hover"
  | "form_focus"
  | "form_submit"
  | "custom";

export type GrowthEventInput = {
  kind: GrowthEventKind;
  pathname: string;
  selector?: string;
  x?: number;
  y?: number;
  scrollDepth?: number;
  viewportW?: number;
  viewportH?: number;
  meta?: Record<string, unknown>;
  ts?: number;
};

export type GrowthIngestBatch = {
  sessionId: string;
  events: GrowthEventInput[];
  walletAddress?: string;
  memberId?: string;
};

export type GrowthAppSeed = {
  slug: string;
  name: string;
  domain?: string;
  tier: "free" | "pro" | "business" | "enterprise";
};

export const ECOSYSTEM_APPS: GrowthAppSeed[] = [
  { slug: "bc-id", name: "Building Culture ID", domain: "buildingcultureid.space", tier: "enterprise" },
  { slug: "bc-app", name: "Building Culture App", domain: "app.buildingculture.capital", tier: "business" },
  { slug: "ankommen", name: "Ankommen Österreich", tier: "pro" },
  { slug: "kinderstimme", name: "KinderStimme Österreich", tier: "pro" },
  { slug: "community-funding", name: "Community Funding Platform", tier: "business" },
  { slug: "rwa-marketplace", name: "RWA Marketplace", tier: "business" },
  { slug: "wohnai", name: "WohnAI", domain: "wohnai.buildingcultureid.space", tier: "pro" },
];

export type GrowthInsightKind = "daily" | "weekly";

export type GrowthRecommendationPriority = "low" | "medium" | "high" | "critical";

export type GrowthRecommendationStatus = "open" | "in_progress" | "done" | "dismissed";
