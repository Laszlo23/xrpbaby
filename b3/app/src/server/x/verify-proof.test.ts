import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { tweetSatisfiesXProofTask } from "./verify-proof.ts";

describe("tweetSatisfiesXProofTask", () => {
  const target = "100";

  it("accepts retweet of target", () => {
    assert.ok(
      tweetSatisfiesXProofTask("x-retweet-official", target, [{ type: "retweeted", id: "100" }]),
    );
  });

  it("rejects retweet of wrong id", () => {
    assert.equal(
      tweetSatisfiesXProofTask("x-retweet-official", target, [{ type: "retweeted", id: "999" }]),
      false,
    );
  });

  it("accepts quote of target", () => {
    assert.ok(
      tweetSatisfiesXProofTask("x-quote-official", target, [{ type: "quoted", id: "100" }]),
    );
  });

  it("accepts reply to target", () => {
    assert.ok(
      tweetSatisfiesXProofTask("x-reply-official", target, [{ type: "replied_to", id: "100" }]),
    );
  });

  it("replies require replied_to not quoted", () => {
    assert.equal(
      tweetSatisfiesXProofTask("x-reply-official", target, [{ type: "quoted", id: "100" }]),
      false,
    );
  });

  it("empty refs fails", () => {
    assert.equal(tweetSatisfiesXProofTask("x-reply-official", target, []), false);
    assert.equal(tweetSatisfiesXProofTask("x-reply-official", target, undefined), false);
  });
});
