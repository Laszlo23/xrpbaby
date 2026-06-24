import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cultureMonthlyProductId,
  STRIPE_CULTURE_MONTHLY_PRODUCT_ID_DEFAULT,
} from "@/server/billing/stripe-subscription-config";

describe("stripe subscription config", () => {
  it("defaults Culture Monthly product id", () => {
    assert.equal(cultureMonthlyProductId(), STRIPE_CULTURE_MONTHLY_PRODUCT_ID_DEFAULT);
    assert.equal(STRIPE_CULTURE_MONTHLY_PRODUCT_ID_DEFAULT, "prod_UkgYq7gPcfRC7q");
  });
});
