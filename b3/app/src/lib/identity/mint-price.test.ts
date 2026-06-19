import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatIdentityMintPrice,
  formatIdentityMintPriceNativeOnly,
  IDENTITY_MINT_LADDER_RANGE_LABEL,
} from "./mint-price.ts";

describe("formatIdentityMintPrice", () => {
  it("formats BNB with network id bsc", () => {
    const wei = 1_850_000_000_000_000n;
    const label = formatIdentityMintPrice(wei, { networkId: "bsc", tierUsd: 0.56 });
    assert.match(label, /BNB/);
    assert.match(label, /\$0\.56/);
  });

  it("formats ETH for base with ladder range fallback", () => {
    const wei = 23_333_333_333_333n;
    const label = formatIdentityMintPriceNativeOnly(wei, { networkId: "base" });
    assert.match(label, /ETH/);
  });

  it("shows ladder range when wei undefined", () => {
    const label = formatIdentityMintPrice(undefined, { networkId: "base" });
    assert.match(label, new RegExp(IDENTITY_MINT_LADDER_RANGE_LABEL.replace(/\$/g, "\\$")));
  });
});
