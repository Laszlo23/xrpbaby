import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SiweMessage } from "siwe";

import { consumeNonceIfValid, createWalletAuthNonce, rememberNonce } from "@/server/world/nonce-store";
import { requireSiweAuth } from "./siwe.ts";

describe("requireSiweAuth", () => {
  it("rejects when nonce was not issued", async () => {
    const nonce = createWalletAuthNonce();
    const msg = new SiweMessage({
      domain: "localhost",
      address: "0x0000000000000000000000000000000000000001",
      statement: "test",
      uri: "http://localhost:5173",
      version: "1",
      chainId: 8453,
      nonce,
    });
    const prepared = msg.prepareMessage();
    const result = await requireSiweAuth({
      address: "0x0000000000000000000000000000000000000001",
      message: prepared,
      signature: "0x" + "00".repeat(65),
    });
    assert.ok("error" in result);
    assert.equal(result.error, "invalid_signature");
  });

  it("rejects consumed nonce", async () => {
    const nonce = createWalletAuthNonce();
    rememberNonce(nonce);
    assert.equal(consumeNonceIfValid(nonce), true);
    const again = consumeNonceIfValid(nonce);
    assert.equal(again, false);
  });
});
