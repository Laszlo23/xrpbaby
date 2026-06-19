import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { warpcastComposeUrl } from "../campaign-share.ts";
import { dnaHueFromAddress } from "./dna.ts";
import { groveOriginStory, GROVE_INVITE_TARGET } from "./story.ts";
import { GROVE_ELDER_THRESHOLD } from "./types.ts";

describe("culture-grove dna", () => {
  it("derives stable hue from address", () => {
    const a = dnaHueFromAddress("0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863");
    const b = dnaHueFromAddress("0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863");
    assert.equal(a, b);
    assert.ok(a >= 0 && a < 360);
  });
});

describe("culture-grove story", () => {
  it("targets two direct invites", () => {
    assert.equal(GROVE_INVITE_TARGET, 2);
  });

  it("evolves copy with progress", () => {
    assert.match(groveOriginStory(0, 0), /single seed/i);
    assert.match(groveOriginStory(2, 2), /Twin Bloom/i);
    assert.match(groveOriginStory(2, GROVE_ELDER_THRESHOLD, true), /Grove Elder/i);
  });
});

describe("warpcastComposeUrl", () => {
  it("includes embeds when provided", () => {
    const url = warpcastComposeUrl("hello grove", ["https://app.example/join"]);
    assert.match(url, /text=hello/);
    assert.match(url, /embeds/);
    assert.match(url, /app\.example/);
  });
});
