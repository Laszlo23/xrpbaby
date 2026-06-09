import assert from "node:assert/strict";
import { test } from "node:test";

import { analyzeFunnelFromSessions, DEFAULT_ECOSYSTEM_FUNNEL } from "./funnels.js";

test("analyzeFunnelFromSessions detects dropoff", () => {
  const sessions = new Map([
    [
      "s1",
      [
        { kind: "page_view", pathname: "/", selector: null },
        { kind: "page_view", pathname: "/join", selector: null },
        { kind: "click", pathname: "/join", selector: "button.connect" },
      ],
    ],
    [
      "s2",
      [
        { kind: "page_view", pathname: "/", selector: null },
        { kind: "page_view", pathname: "/join", selector: null },
      ],
    ],
  ]);

  const result = analyzeFunnelFromSessions(
    "test",
    DEFAULT_ECOSYSTEM_FUNNEL.steps.slice(0, 3),
    sessions,
  );
  assert.equal(result.totalSessions, 2);
  assert.equal(result.steps[0]!.sessions, 2);
  assert.equal(result.steps[2]!.sessions, 1);
  assert.ok(result.biggestLeak);
});
