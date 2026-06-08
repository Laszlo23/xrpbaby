import assert from "node:assert/strict";
import test from "node:test";

import { voiceCheck } from "./copy";

test("voiceCheck rejects hype phrases", () => {
  assert.equal(voiceCheck("Join our airdrop now").ok, false);
  assert.equal(voiceCheck("to the moon").ok, false);
});

test("voiceCheck accepts forest copy", () => {
  assert.equal(
    voiceCheck("Grove 🌲 — forest update. Verify → https://example.com/signal").ok,
    true,
  );
});
