import assert from "node:assert/strict";
import test from "node:test";

import { ledgerHasDailyCheckInToday, utcDayString } from "./daily-checkin-credit";

test("utcDayString uses ISO UTC date", () => {
  const d = new Date("2026-06-11T23:59:00.000Z");
  assert.equal(utcDayString(d), "2026-06-11");
});

test("ledgerHasDailyCheckInToday matches metadata dayUTC", () => {
  assert.equal(
    ledgerHasDailyCheckInToday(
      [{ metadata: { dayUTC: "2026-06-11" } }, { metadata: { dayUTC: "2026-06-10" } }],
      "2026-06-11",
    ),
    true,
  );
  assert.equal(
    ledgerHasDailyCheckInToday([{ metadata: { dayUTC: "2026-06-10" } }], "2026-06-11"),
    false,
  );
});
