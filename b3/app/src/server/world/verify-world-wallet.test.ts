import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createWalletAuthNonce, rememberNonce } from "./nonce-store.ts";
import { verifyWorldWalletAuthJson } from "./verify-world-wallet.ts";

describe("verifyWorldWalletAuthJson", () => {
  it("rejects non-object body", async () => {
    const r = await verifyWorldWalletAuthJson(null);
    assert.equal(r.ok, false);
    assert.equal(r.status, 400);
    assert.equal(r.json.error, "invalid_json");
  });

  it("rejects short nonce", async () => {
    const r = await verifyWorldWalletAuthJson({
      nonce: "short",
      walletAuth: {},
    });
    assert.equal(r.ok, false);
    assert.equal(r.status, 400);
    assert.equal(r.json.error, "invalid_nonce");
  });

  it("rejects unknown or expired nonce", async () => {
    const r = await verifyWorldWalletAuthJson({
      nonce: createWalletAuthNonce(),
      walletAuth: {},
    });
    assert.equal(r.ok, false);
    assert.equal(r.status, 401);
    assert.equal(r.json.error, "nonce_invalid_or_expired");
  });

  it("rejects missing walletAuth after nonce is accepted", async () => {
    const nonce = createWalletAuthNonce();
    rememberNonce(nonce);
    const r = await verifyWorldWalletAuthJson({
      nonce,
      walletAuth: undefined,
    });
    assert.equal(r.ok, false);
    assert.equal(r.status, 400);
    assert.equal(r.json.error, "missing_wallet_auth");
  });

  it("returns 401 when SIWE is invalid", async () => {
    const nonce = createWalletAuthNonce();
    rememberNonce(nonce);
    const r = await verifyWorldWalletAuthJson(
      {
        nonce,
        walletAuth: { stub: true },
      },
      {
        verifySiwe: async () => ({
          isValid: false,
          siweMessageData: undefined,
        }),
      },
    );
    assert.equal(r.ok, false);
    assert.equal(r.status, 401);
    assert.equal(r.json.error, "siwe_invalid");
  });

  it("returns address and chainId on valid SIWE", async () => {
    const nonce = createWalletAuthNonce();
    rememberNonce(nonce);
    const addr = "0x0000000000000000000000000000000000000001";
    const r = await verifyWorldWalletAuthJson(
      {
        nonce,
        walletAuth: { stub: true },
      },
      {
        verifySiwe: async () => ({
          isValid: true,
          siweMessageData: {
            address: addr,
            chain_id: 480,
          },
        }),
      },
    );
    assert.equal(r.ok, true);
    assert.equal(r.status, 200);
    assert.equal(r.json.ok, true);
    assert.equal(r.json.address, addr);
    assert.equal(r.json.chainId, 480);
  });

  it("maps SIWE verify errors to 401", async () => {
    const nonce = createWalletAuthNonce();
    rememberNonce(nonce);
    const r = await verifyWorldWalletAuthJson(
      {
        nonce,
        walletAuth: {},
      },
      {
        verifySiwe: async () => {
          throw new Error("boom");
        },
      },
    );
    assert.equal(r.ok, false);
    assert.equal(r.status, 401);
    assert.equal(r.json.error, "siwe_verify_failed");
  });
});
