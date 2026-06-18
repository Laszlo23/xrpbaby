import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { agentAccessFromBccBalance, agentAccessLabel } from "./bcc-agent-access.ts";
import { BCC_AGENT_ACCESS_MIN_WEI } from "./grant-agent-config.ts";

describe("bcc-agent-access", () => {
  it("full tier at minimum access balance", () => {
    assert.equal(agentAccessFromBccBalance(BCC_AGENT_ACCESS_MIN_WEI), "full");
  });

  it("paid_only tier with small balance", () => {
    assert.equal(agentAccessFromBccBalance(1n * 10n ** 18n), "paid_only");
  });

  it("locked tier with zero balance", () => {
    assert.equal(agentAccessFromBccBalance(0n), "locked");
  });

  it("returns label for each tier", () => {
    assert.ok(agentAccessLabel("full").includes("Premium"));
    assert.ok(agentAccessLabel("locked").includes("Earn BCC"));
  });
});
