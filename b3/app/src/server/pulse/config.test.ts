import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { envFlag } from "./config";

describe("pulse config", () => {
  it("envFlag respects true/false", () => {
    const prev = process.env.FACEBOOK_STREAM;
    process.env.FACEBOOK_STREAM = "true";
    assert.equal(envFlag("FACEBOOK_STREAM"), true);
    process.env.FACEBOOK_STREAM = "false";
    assert.equal(envFlag("FACEBOOK_STREAM"), false);
    if (prev === undefined) delete process.env.FACEBOOK_STREAM;
    else process.env.FACEBOOK_STREAM = prev;
  });
});
