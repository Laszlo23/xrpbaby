import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { onboardingCompleteBodySchema } from "./schemas.ts";

describe("onboardingCompleteBodySchema", () => {
  it("accepts valid body shape", () => {
    const parsed = onboardingCompleteBodySchema.safeParse({
      address: "0x0000000000000000000000000000000000000001",
      intent: "explore",
      message: "sign-in-with-ethereum message",
      signature: "0x" + "ab".repeat(65),
    });
    assert.equal(parsed.success, true);
  });

  it("rejects bad address", () => {
    const parsed = onboardingCompleteBodySchema.safeParse({
      address: "not-an-address",
      message: "sign-in-with-ethereum message",
      signature: "0x" + "ab".repeat(65),
    });
    assert.equal(parsed.success, false);
  });

  it("rejects unknown intent", () => {
    const parsed = onboardingCompleteBodySchema.safeParse({
      address: "0x0000000000000000000000000000000000000001",
      intent: "invest",
      message: "sign-in-with-ethereum message",
      signature: "0x" + "ab".repeat(65),
    });
    assert.equal(parsed.success, false);
  });

  it("rejects short signature", () => {
    const parsed = onboardingCompleteBodySchema.safeParse({
      address: "0x0000000000000000000000000000000000000001",
      message: "sign-in-with-ethereum message",
      signature: "0xab",
    });
    assert.equal(parsed.success, false);
  });
});
