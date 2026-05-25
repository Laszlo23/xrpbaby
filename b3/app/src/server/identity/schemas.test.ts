import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { verifyCultureNameBodySchema } from "./schemas.ts";

describe("verifyCultureNameBodySchema", () => {
  it("accepts culture name and auth fields", () => {
    const parsed = verifyCultureNameBodySchema.safeParse({
      cultureName: "laszlo.culture",
      address: "0x0000000000000000000000000000000000000001",
      message: "sign-in-with-ethereum message",
      signature: "0x" + "ab".repeat(65),
    });
    assert.equal(parsed.success, true);
  });

  it("rejects invalid culture name", () => {
    const parsed = verifyCultureNameBodySchema.safeParse({
      cultureName: "Bad_Name",
      address: "0x0000000000000000000000000000000000000001",
      message: "msg",
      signature: "0x" + "ab".repeat(65),
    });
    assert.equal(parsed.success, false);
  });
});
