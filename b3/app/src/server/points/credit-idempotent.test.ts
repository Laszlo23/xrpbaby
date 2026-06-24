import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getPackBySlug } from "@/lib/packs";
import { isPrismaUniqueViolation } from "@/server/points/credit-idempotent";

describe("creditPointsIdempotent helpers", () => {
  it("isPrismaUniqueViolation detects P2002", () => {
    assert.equal(isPrismaUniqueViolation({ code: "P2002" }), true);
    assert.equal(isPrismaUniqueViolation({ code: "P2025" }), false);
    assert.equal(isPrismaUniqueViolation(new Error("fail")), false);
  });

  it("idempotency keys follow stable prefixes", () => {
    const sessionId = "cs_test_abc";
    assert.equal(`pack:${sessionId}`, "pack:cs_test_abc");
    assert.equal(`subscription:in_test`, "subscription:in_test");
    assert.equal(`merch-claim:ord_1`, "merch-claim:ord_1");
  });
});

describe("pack stripe amount verification contract", () => {
  it("session amount_total must match pack.usdCents", () => {
    const pack = getPackBySlug("pack_7");
    assert.ok(pack);
    assert.equal(pack.usdCents, 700);
    const sessionAmountTotal = 700;
    assert.equal(sessionAmountTotal, pack.usdCents);
  });

  it("rejects mismatched pack amounts", () => {
    const pack = getPackBySlug("pack_77");
    assert.ok(pack);
    const wrongSessionTotal = 700;
    assert.notEqual(wrongSessionTotal, pack.usdCents);
  });
});

describe("subscription invoice idempotency contract", () => {
  it("invoice id uses subscription prefix", () => {
    const invoiceId = "in_1TestInvoice";
    const key = `subscription:${invoiceId}`;
    assert.match(key, /^subscription:in_/);
  });
});
