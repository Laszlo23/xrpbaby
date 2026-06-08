import { describe, it, expect } from "vitest";
import { enforceToolAcl } from "./acl.js";
import type { OpsAgentRecord } from "../types.js";

const baseAgent: OpsAgentRecord = {
  id: "test-1",
  handler: "newsWriter",
  fleet: "ops",
  role: "content",
  systemPrompt: "test",
  tools: ["ops.slack.post", "chain.read_stats"],
};

describe("enforceToolAcl", () => {
  it("allows listed tools", () => {
    expect(enforceToolAcl(baseAgent, "ops.slack.post")).toEqual({ ok: true });
  });

  it("denies unlisted tools", () => {
    const r = enforceToolAcl(baseAgent, "deploy.app");
    expect(r.ok).toBe(false);
  });

  it("blocks treasury.safe", () => {
    const ceo: OpsAgentRecord = { ...baseAgent, tools: ["*"] };
    const r = enforceToolAcl(ceo, "treasury.safe");
    expect(r.ok).toBe(false);
  });

  it("allows wildcard except blocked", () => {
    const ceo: OpsAgentRecord = { ...baseAgent, tools: ["*"] };
    expect(enforceToolAcl(ceo, "deploy.app")).toEqual({ ok: true });
  });
});
