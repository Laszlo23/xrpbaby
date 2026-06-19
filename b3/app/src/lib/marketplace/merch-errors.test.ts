import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { merchErrorMessage } from "./merch-errors.ts";

describe("merch-errors", () => {
  it("maps known codes", () => {
    assert.match(merchErrorMessage("sold_out"), /sold out/i);
    assert.match(merchErrorMessage("culture_identity_required"), /Culture ID/i);
  });

  it("falls back for unknown codes", () => {
    assert.equal(merchErrorMessage("custom_code"), "custom code");
  });
});
