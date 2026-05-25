import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { consumeNonceIfValid, createWalletAuthNonce, rememberNonce } from "./nonce-store.ts";

describe("nonce-store", () => {
  it("creates alphanumeric nonces without hyphens", () => {
    const n = createWalletAuthNonce();
    assert.ok(n.length >= 16);
    assert.ok(!n.includes("-"));
  });

  it("consumes a nonce once", () => {
    const n = createWalletAuthNonce();
    rememberNonce(n);
    assert.equal(consumeNonceIfValid(n), true);
    assert.equal(consumeNonceIfValid(n), false);
  });
});
