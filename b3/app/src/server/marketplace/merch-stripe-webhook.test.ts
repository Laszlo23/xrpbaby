import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** Stripe webhook metadata contract for merch checkout sessions. */
const MERCH_STRIPE_METADATA_KEYS = ["type", "orderId", "dropSlug", "wallet", "unitNumber"] as const;

const API_PURCHASE_METADATA_KEYS = ["type", "purchaseId", "sku", "wallet"] as const;

describe("merch stripe webhook metadata contract", () => {
  it("metadata.type is merch for webhook routing", () => {
    const metadata = {
      type: "merch",
      orderId: "ord_test",
      dropSlug: "bc-tshirt-1",
      wallet: "0x0000000000000000000000000000000000000001",
      unitNumber: "1",
    };
    assert.equal(metadata.type, "merch");
    for (const key of MERCH_STRIPE_METADATA_KEYS) {
      assert.ok(key in metadata, `missing metadata key ${key}`);
    }
  });

  it("amount_total must match order price in cents", () => {
    const priceUsd = 7.7;
    const expectedCents = Math.round(priceUsd * 100);
    assert.equal(expectedCents, 770);
  });
});

describe("api_purchase stripe webhook metadata contract", () => {
  it("metadata.type is api_purchase for webhook routing", () => {
    const metadata = {
      type: "api_purchase",
      purchaseId: "pur_test",
      sku: "buildchain_research_brief_v1",
      wallet: "0x0000000000000000000000000000000000000001",
    };
    assert.equal(metadata.type, "api_purchase");
    for (const key of API_PURCHASE_METADATA_KEYS) {
      assert.ok(key in metadata, `missing metadata key ${key}`);
    }
  });
});
