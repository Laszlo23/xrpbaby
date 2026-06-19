import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { merchReserveTtlMinutes } from "@/server/marketplace/merch-orders";

describe("merch-orders reservation config", () => {
  it("merchReserveTtlMinutes defaults to 30", () => {
    const prev = process.env.MERCH_RESERVE_TTL_MINUTES;
    delete process.env.MERCH_RESERVE_TTL_MINUTES;
    assert.equal(merchReserveTtlMinutes(), 30);
    if (prev) process.env.MERCH_RESERVE_TTL_MINUTES = prev;
  });

  it("merchReserveTtlMinutes respects env override", () => {
    const prev = process.env.MERCH_RESERVE_TTL_MINUTES;
    process.env.MERCH_RESERVE_TTL_MINUTES = "45";
    assert.equal(merchReserveTtlMinutes(), 45);
    if (prev) process.env.MERCH_RESERVE_TTL_MINUTES = prev;
    else delete process.env.MERCH_RESERVE_TTL_MINUTES;
  });
});
