import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bccDiscountedUsd, getBccDiscountBps } from "./bcc-config.ts";

describe("bcc-config", () => {
  it("default discount bps is 1111", () => {
    assert.equal(getBccDiscountBps(), 1111);
  });

  it("bccDiscountedUsd applies 11.11% off", () => {
    assert.equal(bccDiscountedUsd(10), 8.89);
  });
});
