import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BASE_USDC,
  BASE_WETH,
  encodeUsdcToBccPath,
  encodeV3Path,
  minAmountOut,
  resolveBccPoolFee,
} from "./swap.js";
import { BCC_SWAP_TOKEN } from "./swap.js";

describe("minAmountOut", () => {
  it("applies slippage bps", () => {
    assert.equal(minAmountOut(10_000n, 50), 9_950n);
    assert.equal(minAmountOut(10_000n, 0), 10_000n);
  });
});

describe("encodeV3Path", () => {
  it("packs USDC WETH BCC path", () => {
    const path = encodeV3Path(
      [BASE_USDC, BASE_WETH, BCC_SWAP_TOKEN],
      [500, 10_000],
    );
    assert.ok(path.startsWith("0x"));
    assert.equal(path.length, 2 + 40 + 6 + 40 + 6 + 40);
  });
});

describe("encodeUsdcToBccPath", () => {
  it("uses default fee tiers", () => {
    const path = encodeUsdcToBccPath();
    const manual = encodeV3Path([BASE_USDC, BASE_WETH, BCC_SWAP_TOKEN], [500, 10_000]);
    assert.equal(path, manual);
  });
});

describe("resolveBccPoolFee", () => {
  it("returns first matching tier", async () => {
    const fee = await resolveBccPoolFee(async (_a, _b, f) =>
      f === 3_000 ? ("0xabc" as const) : null,
    );
    assert.equal(fee, 3_000);
  });

  it("defaults to 10000 when no pool found", async () => {
    const fee = await resolveBccPoolFee(async () => null);
    assert.equal(fee, 10_000);
  });
});
