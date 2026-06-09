import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseQuidliWebhook } from "@/server/quidli/parse-webhook";

describe("parseQuidliWebhook", () => {
  it("parses delivery.completed shape", () => {
    const parsed = parseQuidliWebhook({
      type: "delivery.completed",
      id: "evt_123",
      data: {
        platform: "twitter",
        username: "builder",
        amount_wei: "1000000000000000000",
        token_address: "0xb890a5289f789f1346032ccc1847939e855fab07",
        chain_id: "8453",
        reference: "del_456",
        task_slug: "quidli-grant-bounty",
      },
    });
    assert.ok(parsed);
    assert.equal(parsed.eventId, "evt_123");
    assert.equal(parsed.platform, "twitter");
    assert.equal(parsed.handle, "builder");
    assert.equal(parsed.status, "completed");
    assert.equal(parsed.quidliRef, "del_456");
    assert.equal(parsed.taskSlug, "quidli-grant-bounty");
  });

  it("infers failed status", () => {
    const parsed = parseQuidliWebhook({
      event: "delivery.failed",
      event_id: "evt_fail",
      data: { platform: "farcaster", handle: "alice", status: "failed" },
    });
    assert.ok(parsed);
    assert.equal(parsed.status, "failed");
    assert.equal(parsed.platform, "farcaster");
  });

  it("returns null for non-objects", () => {
    assert.equal(parseQuidliWebhook(null), null);
    assert.equal(parseQuidliWebhook("x"), null);
  });
});
