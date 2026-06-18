import { Wallet } from "xrpl";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildXrplLinkMessage } from "./xrpl-link.ts";
import { verifyXrplMessageSignature } from "./xrpl-signature.ts";
import { sign } from "ripple-keypairs";
import { convertStringToHex } from "xrpl";

describe("buildXrplLinkMessage", () => {
  it("includes handle, address, and nonce", () => {
    const msg = buildXrplLinkMessage("alice.culture", "rPT1Sjq2YGrBMTttX4GZHjKu9q", "abc123");
    assert.match(msg, /alice\.culture/);
    assert.match(msg, /rPT1Sjq2YGrBMTttX4GZHjKu9q/);
    assert.match(msg, /abc123/);
  });
});

describe("verifyXrplMessageSignature", () => {
  it("validates a keypair signature over the link message", () => {
    const wallet = Wallet.generate();
    const message = buildXrplLinkMessage(wallet.address, wallet.address, "nonce1");
    const messageHex = convertStringToHex(message).toUpperCase();
    const signature = sign(messageHex, wallet.privateKey);
    assert.equal(
      verifyXrplMessageSignature({
        message,
        signature,
        publicKey: wallet.publicKey,
      }),
      true,
    );
  });
});
