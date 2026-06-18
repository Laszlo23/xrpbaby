import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GRANT_AGENT_BCC_PRICE, GRANT_AGENT_BCC_PRICE_WEI } from "@/lib/grant-agent-config";

const grantBodySchema = {
  parse(input: unknown) {
    const body = input as Record<string, unknown>;
    const brief = String(body.brief ?? "");
    const txHash = String(body.txHash ?? "");
    const walletAddress = String(body.walletAddress ?? "");
    const ok =
      brief.length >= 20 &&
      brief.length <= 4000 &&
      /^0x[a-fA-F0-9]{64}$/.test(txHash) &&
      /^0x[a-fA-F0-9]{40}$/.test(walletAddress);
    return ok ? { success: true as const } : { success: false as const };
  },
};

describe("grant agent backtest", () => {
  it("published price matches config", () => {
    assert.equal(GRANT_AGENT_BCC_PRICE, 100);
    assert.equal(GRANT_AGENT_BCC_PRICE_WEI, 100n * 10n ** 18n);
  });

  it("rejects brief shorter than 20 chars", () => {
    const parsed = grantBodySchema.parse({
      brief: "too short",
      txHash: "0x" + "a".repeat(64),
      walletAddress: "0x" + "b".repeat(40),
    });
    assert.equal(parsed.success, false);
  });

  it("rejects invalid tx hash", () => {
    const parsed = grantBodySchema.parse({
      brief: "A valid grant brief with enough characters for the agent.",
      txHash: "0xdead",
      walletAddress: "0x" + "b".repeat(40),
    });
    assert.equal(parsed.success, false);
  });

  it("accepts valid grant request body", () => {
    const parsed = grantBodySchema.parse({
      brief: "We are building community-owned housing with on-chain grant proof.",
      txHash: "0x" + "a".repeat(64),
      walletAddress: "0x" + "b".repeat(40),
    });
    assert.equal(parsed.success, true);
  });
});
