import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyStakingBoost,
  buildWeeklyClaimIdempotencyKey,
  weekIdForNow,
} from "@/lib/weekly-claim-policy";

import {
  isAddressOnBccPayoutWhitelist,
  isBccPayoutWhitelistActive,
  parseBccPayoutWhitelist,
} from "@/server/wallet/bcc-treasury-transfer";

describe("weekly BCC claim", () => {
  it("applies staking boost multipliers", () => {
    const base = 1_000_000_000_000_000_000n;
    assert.equal(applyStakingBoost(base, 0), base);
    assert.equal(applyStakingBoost(base, 1), (base * 11_500n) / 10_000n);
    assert.equal(applyStakingBoost(base, 2), (base * 12_500n) / 10_000n);
  });

  it("generates stable week buckets", () => {
    const week = weekIdForNow(604800_000);
    assert.match(week, /^\d+$/);
  });

  it("buildWeeklyClaimIdempotencyKey is derived from signer address", () => {
    const addr = "0xAbCd012345678901234567890123456789012345";
    const key = buildWeeklyClaimIdempotencyKey(addr, 1_700_000_000_000);
    assert.match(key, /^weekly:0xabcd012345678901234567890123456789012345:\d+$/);
  });

  it("payout whitelist blocks non-listed addresses when active", () => {
    const listed = "0x1111111111111111111111111111111111111111";
    const other = "0x2222222222222222222222222222222222222222";
    process.env.BCC_PAYOUT_WHITELIST = listed;
    assert.equal(isBccPayoutWhitelistActive(), true);
    assert.equal(parseBccPayoutWhitelist().size, 1);
    assert.equal(isAddressOnBccPayoutWhitelist(listed), true);
    assert.equal(isAddressOnBccPayoutWhitelist(other), false);
    delete process.env.BCC_PAYOUT_WHITELIST;
    assert.equal(isBccPayoutWhitelistActive(), false);
    assert.equal(isAddressOnBccPayoutWhitelist(other), true);
  });
});
