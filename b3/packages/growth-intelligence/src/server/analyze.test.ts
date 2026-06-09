import assert from "node:assert/strict";
import { test } from "node:test";

import {
  generateRuleInsights,
  generateRuleRecommendations,
} from "./analyze.js";

const baseInput = {
  appName: "BC ID",
  windowLabel: "last 24h",
  totalSessions: 100,
  totalEvents: 5000,
  rageClicks: 20,
  topPages: [{ pathname: "/join", views: 400 }],
  topClicks: [{ selector: "button.connect", count: 120 }],
  dropoffPages: [{ pathname: "/join", exits: 80 }],
};

test("generateRuleInsights flags high rage rate", () => {
  const insights = generateRuleInsights({ ...baseInput, rageClicks: 20 });
  assert.ok(insights.some((i) => i.title.includes("frustration")));
});

test("generateRuleRecommendations suggests dropoff fix", () => {
  const recs = generateRuleRecommendations(baseInput);
  assert.ok(recs.some((r) => r.problem.includes("exit rate")));
});
