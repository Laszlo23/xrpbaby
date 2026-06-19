import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CREDENTIAL_CATALOG, credentialBySlug } from "./credential-catalog.ts";

describe("credential-catalog", () => {
  it("defines seven credential types", () => {
    assert.equal(CREDENTIAL_CATALOG.length, 7);
  });

  it("finds builder credential by slug", () => {
    const c = credentialBySlug("builder");
    assert.ok(c);
    assert.equal(c.name, "Builder Credential");
  });
});
