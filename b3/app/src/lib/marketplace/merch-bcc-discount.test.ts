import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  applyMerchBccDiscount,
  merchBccDiscountLabel,
  merchBccHolderDiscountBps,
} from "./merch-bcc-discount.ts";

describe("merch-bcc-discount", () => {
  it("applyMerchBccDiscount reduces price", () => {
    const out = applyMerchBccDiscount(100, 777);
    assert.equal(out, 92.23);
  });

  it("zero bps leaves price unchanged", () => {
    assert.equal(applyMerchBccDiscount(50, 0), 50);
  });

  it("label formats bps", () => {
    assert.match(merchBccDiscountLabel(777), /7\.77%/);
  });

  it("env bps defaults to 0 when unset", () => {
    const prev = process.env.MERCH_BCC_HOLDER_DISCOUNT_BPS;
    delete process.env.MERCH_BCC_HOLDER_DISCOUNT_BPS;
    assert.equal(merchBccHolderDiscountBps(), 0);
    if (prev) process.env.MERCH_BCC_HOLDER_DISCOUNT_BPS = prev;
  });
});
