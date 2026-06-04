import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatIdentityMintPrice,
  formatIdentityMintPriceNativeOnly,
  IDENTITY_MINT_TARGET_USD,
} from "./mint-price.ts";

describe("formatIdentityMintPrice", () => {
  it("formats BNB with network id bsc", () => {
    const wei = 1_850_000_000_000_000n;
    const label = formatIdentityMintPrice(wei, { networkId: "bsc" });
    assert.match(label, /BNB/);
    assert.match(label, new RegExp(`\\$${IDENTITY_MINT_TARGET_USD}`));
  });

  it("formats ETH for base", () => {
    const wei = 370_000_000_000_000n;
    const label = formatIdentityMintPriceNativeOnly(wei, { networkId: "base" });
    assert.match(label, /ETH/);
  });
});
