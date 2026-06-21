import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROMO_MIN_LEN,
  RESERVED_MAX_LEN,
  handlePolicyUserMessage,
  premiumHandleTier,
  validateHandleForPromoMint,
} from "./handle-policy.ts";

describe("handle-policy", () => {
  it("1–3 chars are reserved", () => {
    assert.equal(premiumHandleTier(1), "reserved");
    assert.equal(premiumHandleTier(3), "reserved");
    const r = validateHandleForPromoMint("abc");
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.error, "reserved_team");
  });

  it("4+ chars pass promo validation", () => {
    const r = validateHandleForPromoMint("abcd");
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.tier, "promo");
  });

  it("team bypass allows 1-char handles", () => {
    const r = validateHandleForPromoMint("a", { teamWallet: true });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.tier, "reserved");
  });

  it("promo min length constant", () => {
    assert.equal(PROMO_MIN_LEN, 4);
    assert.equal(RESERVED_MAX_LEN, 3);
  });

  it("user messages for policy errors", () => {
    assert.match(handlePolicyUserMessage("reserved_team"), /reserved/i);
    assert.match(handlePolicyUserMessage("handle_too_short"), /4 characters/i);
  });
});
