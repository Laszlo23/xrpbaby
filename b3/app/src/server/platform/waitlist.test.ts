import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readJsonBody } from "./rate-limit.ts";
import { waitlistBodySchema } from "./schemas.ts";

describe("waitlistBodySchema", () => {
  it("accepts valid email", () => {
    const parsed = waitlistBodySchema.safeParse({
      email: "hello@example.com",
      source: "landing",
    });
    assert.equal(parsed.success, true);
  });

  it("rejects invalid email", () => {
    const parsed = waitlistBodySchema.safeParse({ email: "not-an-email" });
    assert.equal(parsed.success, false);
  });

  it("rejects oversized name", () => {
    const parsed = waitlistBodySchema.safeParse({
      email: "a@b.com",
      name: "x".repeat(201),
    });
    assert.equal(parsed.success, false);
  });
});

describe("waitlist readJsonBody", () => {
  it("returns 413 for oversized payload", async () => {
    const req = new Request("http://localhost/api/platform/waitlist", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", name: "x".repeat(20_000) }),
    });
    const raw = await readJsonBody(req, 4096);
    assert.equal(raw.ok, false);
    if (!raw.ok) {
      assert.equal(raw.status, 413);
      assert.equal(raw.error, "payload_too_large");
    }
  });

  it("returns 400 for invalid json", async () => {
    const req = new Request("http://localhost/api/platform/waitlist", {
      method: "POST",
      body: "{not-json",
    });
    const raw = await readJsonBody(req, 4096);
    assert.equal(raw.ok, false);
    if (!raw.ok) {
      assert.equal(raw.status, 400);
      assert.equal(raw.error, "invalid_json");
    }
  });
});
