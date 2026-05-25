import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { chainlinkComplianceCopy } from "./chainlink-compliance-copy.ts";

describe("chainlinkComplianceCopy", () => {
  it("includes honest disclaimers", () => {
    assert.ok(chainlinkComplianceCopy.disclaimers.length >= 2);
    assert.match(chainlinkComplianceCopy.body, /permissioned/i);
    assert.match(chainlinkComplianceCopy.disclaimers.join(" "), /not Chainlink ACE certified/i);
  });
});
