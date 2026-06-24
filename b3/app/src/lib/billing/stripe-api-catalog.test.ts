import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getStripeApiSku,
  listStripeApiSkus,
  usdPriceToCents,
} from "@/lib/billing/stripe-api-catalog";
import { extractStripePurchaseId } from "@/server/billing/stripe-api-purchases";

describe("stripe-api-catalog", () => {
  it("lists core SKUs with positive cents", () => {
    const skus = listStripeApiSkus();
    assert.ok(skus.length >= 10);
    for (const entry of skus) {
      assert.ok(entry.usdCents > 0, entry.sku);
      assert.match(entry.apiPath, /^\/api\//);
    }
  });

  it("usdPriceToCents parses dollar strings", () => {
    assert.equal(usdPriceToCents("$0.05"), 5);
    assert.equal(usdPriceToCents("0.25"), 25);
  });

  it("getStripeApiSku finds research brief", () => {
    const sku = getStripeApiSku("buildchain_research_brief_v1");
    assert.ok(sku);
    assert.equal(sku?.apiPath, "/api/agents/research");
  });
});

describe("extractStripePurchaseId", () => {
  it("reads query param", () => {
    const req = new Request("https://x.test/api/agents/research?q=hi&stripe_purchase_id=abc123");
    assert.equal(extractStripePurchaseId(req), "abc123");
  });

  it("reads header", () => {
    const req = new Request("https://x.test/api/trading/quote", {
      headers: { "x-stripe-purchase-id": "hdr456" },
    });
    assert.equal(extractStripePurchaseId(req), "hdr456");
  });
});
