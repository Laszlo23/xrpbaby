import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ConnectedWallet } from "@privy-io/react-auth";

import {
  findEmbeddedSmartWallet,
  findWalletByAddress,
  isPrivySmartWalletClientType,
  resolveStableSessionAddress,
  resolveWalletDisplayLabel,
  resolveWasConnected,
  walletKindFromClientType,
  walletKindLabelFromClientType,
} from "./wallet-session-utils.ts";

describe("wallet session utils", () => {
  it("classifies privy embedded wallets as smart", () => {
    assert.equal(isPrivySmartWalletClientType("privy"), true);
    assert.equal(isPrivySmartWalletClientType("privy-v2"), true);
    assert.equal(walletKindFromClientType("metamask"), "external");
    assert.equal(walletKindLabelFromClientType("privy"), "Smart wallet");
    assert.equal(walletKindLabelFromClientType("metamask"), "MetaMask");
  });

  it("prefers culture name in display label", () => {
    assert.equal(
      resolveWalletDisplayLabel({
        primaryName: "laszlo.culture",
        address: "0x502ce9fb1814cb03843967ec5e0d8f6aa3a3c2e1",
      }),
      "laszlo.culture",
    );
    assert.equal(
      resolveWalletDisplayLabel({
        primaryName: null,
        address: "0x502ce9fb1814cb03843967ec5e0d8f6aa3a3c2e1",
      }),
      "0x502c…c2e1",
    );
  });

  it("latches address while authenticated during sync gaps", () => {
    assert.equal(
      resolveStableSessionAddress({
        liveAddress: undefined,
        latchedAddress: "0xabc0000000000000000000000000000000000001",
        authenticated: true,
      }),
      "0xabc0000000000000000000000000000000000001",
    );
    assert.equal(
      resolveStableSessionAddress({
        liveAddress: undefined,
        latchedAddress: "0xabc0000000000000000000000000000000000001",
        authenticated: false,
      }),
      undefined,
    );
  });

  it("tracks wasConnected with latch", () => {
    assert.equal(
      resolveWasConnected({
        authenticated: true,
        address: undefined,
        latchedAddress: "0xabc0000000000000000000000000000000000001",
      }),
      true,
    );
    assert.equal(
      resolveWasConnected({
        authenticated: false,
        address: "0xabc0000000000000000000000000000000000001",
      }),
      false,
    );
  });

  it("finds embedded and address-matched wallets", () => {
    const wallets = [
      {
        type: "ethereum" as const,
        address: "0x1111111111111111111111111111111111111111",
        walletClientType: "metamask" as const,
      },
      {
        type: "ethereum" as const,
        address: "0x2222222222222222222222222222222222222222",
        walletClientType: "privy" as const,
      },
    ] as ConnectedWallet[];

    assert.equal(findEmbeddedSmartWallet(wallets)?.address, "0x2222222222222222222222222222222222222222");
    assert.equal(
      findWalletByAddress(wallets, "0x1111111111111111111111111111111111111111")?.walletClientType,
      "metamask",
    );
  });
});
