import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { resolveSocialMediaPath } from "@/server/x/resolve-social-media";

test("resolveSocialMediaPath accepts valid social webp", () => {
  const sample = "/social/building-culture-hero.webp";
  const resolved = resolveSocialMediaPath(sample);
  assert.equal(resolved.ok, true);
  if (resolved.ok) {
    assert.ok(fs.existsSync(resolved.absPath));
    assert.ok(
      resolved.absPath.endsWith(path.join("public", "social", "building-culture-hero.webp")),
    );
  }
});

test("resolveSocialMediaPath rejects path traversal", () => {
  const resolved = resolveSocialMediaPath("/social/../meta/home-meta-og.png");
  assert.equal(resolved.ok, false);
  if (!resolved.ok) assert.equal(resolved.error, "invalid_image_path");
});

test("resolveSocialMediaPath rejects paths outside /social/", () => {
  const resolved = resolveSocialMediaPath("/landing/old.webp");
  assert.equal(resolved.ok, false);
});
