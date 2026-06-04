import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BCC_DISCOUNT_BPS,
  BCC_PAY_BPS,
  bccDiscountedAmount,
  bccDiscountedUsd,
} from "./index.ts";

describe("bccDiscountedAmount", () => {
  it("applies 11.11% discount (8889/10000)", () => {
    const full = 10_000n;
    assert.equal(bccDiscountedAmount(full), 8889n);
    assert.equal(BCC_PAY_BPS, 8889);
    assert.equal(BCC_DISCOUNT_BPS, 1111);
  });

  it("floors fractional wei", () => {
    assert.equal(bccDiscountedAmount(370_000_000_000_000n), 328_893_000_000_000n);
  });
});

describe("bccDiscountedUsd", () => {
  it("applies discount to USD", () => {
    assert.equal(bccDiscountedUsd(1.11), 0.99);
    assert.equal(bccDiscountedUsd(7), 6.22);
  });
});
