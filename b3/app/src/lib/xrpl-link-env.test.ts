import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { xrplLinkTestBypassEnabled } from "@/lib/xrpl-link-env";

describe("xrpl-link-env production guard", () => {
  const env = process.env;

  it("disables test bypass in production even when env flag is set", () => {
    process.env = { ...env, NODE_ENV: "production", XRPL_LINK_TEST_BYPASS: "1" };
    assert.equal(xrplLinkTestBypassEnabled(), false);
    process.env = env;
  });

  it("allows test bypass in non-production when flag set", () => {
    process.env = { ...env, NODE_ENV: "test", XRPL_LINK_TEST_BYPASS: "1" };
    assert.equal(xrplLinkTestBypassEnabled(), true);
    process.env = env;
  });
});
