import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildXtExchangeOffer, x402XtMarketPrice } from "@/lib/xt-exchange-offer";
import { workerQueryFromRequest } from "@/server/xt-exchange";

describe("buildXtExchangeOffer", () => {
  it("advertises xt product and paths", () => {
    const offer = buildXtExchangeOffer();
    assert.equal(offer.product, "buildchain_xt_exchange_v1");
    assert.equal(offer.exchange, "xt.com");
    assert.ok(offer.paths.spotTicker.includes("/api/trading/xt/spot/ticker"));
    assert.ok(offer.paths.manifest.includes("/api/trading/xt/manifest"));
  });
});

describe("x402XtMarketPrice", () => {
  it("defaults to $0.03", () => {
    const prev = process.env.X402_XT_MARKET_PRICE;
    delete process.env.X402_XT_MARKET_PRICE;
    assert.equal(x402XtMarketPrice(), "$0.03");
    if (prev !== undefined) process.env.X402_XT_MARKET_PRICE = prev;
  });
});

describe("workerQueryFromRequest", () => {
  it("forwards query string", () => {
    const req = new Request("http://localhost/api/trading/xt/spot/ticker?symbol=bcc_usdt&limit=5");
    assert.equal(workerQueryFromRequest(req), "?symbol=bcc_usdt&limit=5");
  });
});
