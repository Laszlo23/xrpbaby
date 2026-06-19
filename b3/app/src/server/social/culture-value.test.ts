import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeCultureValue, CULTURE_VALUE_CAP } from "./culture-value.ts";

describe("computeCultureValue", () => {
  it("never exceeds cap", () => {
    const { cultureValue, breakdown } = computeCultureValue(
      {
        actionType: "original",
        text: "x".repeat(200),
        mentionsOk: true,
        hasAppLink: true,
        hasHashtag: true,
        hasMedia: true,
        agentBonus: 999,
      },
      "x",
    );
    assert.equal(breakdown.agentBonus, 40);
    assert.ok(cultureValue <= CULTURE_VALUE_CAP);
  });

  it("scores quote higher than repost on X", () => {
    const repost = computeCultureValue(
      {
        actionType: "repost",
        text: "",
        mentionsOk: false,
        hasAppLink: false,
        hasHashtag: false,
        hasMedia: false,
      },
      "x",
    );
    const quote = computeCultureValue(
      {
        actionType: "quote",
        text: "Building culture with @bihary41418",
        mentionsOk: true,
        hasAppLink: true,
        hasHashtag: true,
        hasMedia: false,
      },
      "x",
    );
    assert.ok(quote.cultureValue > repost.cultureValue);
  });

  it("adds mention and link bonuses", () => {
    const base = computeCultureValue(
      {
        actionType: "original",
        text: "short",
        mentionsOk: false,
        hasAppLink: false,
        hasHashtag: false,
        hasMedia: false,
      },
      "farcaster",
    );
    const boosted = computeCultureValue(
      {
        actionType: "original",
        text: "short",
        mentionsOk: true,
        hasAppLink: true,
        hasHashtag: true,
        hasMedia: false,
      },
      "farcaster",
    );
    assert.equal(boosted.breakdown.mentions - base.breakdown.mentions, 15);
    assert.equal(boosted.breakdown.link - base.breakdown.link, 10);
    assert.equal(boosted.breakdown.hashtag - base.breakdown.hashtag, 5);
  });
});
