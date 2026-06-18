import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GRANT_AGENT_BCC_PRICE_WEI } from "@/lib/grant-agent-config";
import { TREASURY_SAFE_ADDRESS } from "@/lib/treasury-revenue-rules";

/** Pure helpers mirrored from payment verification logic for backtest replay. */
function matchesTreasuryTransfer(input: {
  from: string;
  to: string;
  value: bigint;
  expectedFrom: string;
  minAmountWei: bigint;
}): boolean {
  return (
    input.from.toLowerCase() === input.expectedFrom.toLowerCase() &&
    input.to.toLowerCase() === TREASURY_SAFE_ADDRESS.toLowerCase() &&
    input.value >= input.minAmountWei
  );
}

describe("bcc-payment-verify backtest", () => {
  const wallet = "0x1111111111111111111111111111111111111111";
  const other = "0x2222222222222222222222222222222222222222";

  it("accepts valid treasury transfer at grant price", () => {
    assert.equal(
      matchesTreasuryTransfer({
        from: wallet,
        to: TREASURY_SAFE_ADDRESS,
        value: GRANT_AGENT_BCC_PRICE_WEI,
        expectedFrom: wallet,
        minAmountWei: GRANT_AGENT_BCC_PRICE_WEI,
      }),
      true,
    );
  });

  it("rejects wrong recipient", () => {
    assert.equal(
      matchesTreasuryTransfer({
        from: wallet,
        to: other,
        value: GRANT_AGENT_BCC_PRICE_WEI,
        expectedFrom: wallet,
        minAmountWei: GRANT_AGENT_BCC_PRICE_WEI,
      }),
      false,
    );
  });

  it("rejects insufficient amount", () => {
    assert.equal(
      matchesTreasuryTransfer({
        from: wallet,
        to: TREASURY_SAFE_ADDRESS,
        value: GRANT_AGENT_BCC_PRICE_WEI - 1n,
        expectedFrom: wallet,
        minAmountWei: GRANT_AGENT_BCC_PRICE_WEI,
      }),
      false,
    );
  });

  it("rejects wrong sender", () => {
    assert.equal(
      matchesTreasuryTransfer({
        from: other,
        to: TREASURY_SAFE_ADDRESS,
        value: GRANT_AGENT_BCC_PRICE_WEI,
        expectedFrom: wallet,
        minAmountWei: GRANT_AGENT_BCC_PRICE_WEI,
      }),
      false,
    );
  });
});
