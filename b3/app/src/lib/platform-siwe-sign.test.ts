import assert from "node:assert/strict";
import test from "node:test";

import type { ConnectedWallet } from "@privy-io/react-auth";
import type { Address } from "viem";

import { signPlatformSiweMessage } from "./platform-siwe-sign.ts";

const ADDRESS = "0x1111111111111111111111111111111111111111" as Address;
const PREPARED = "sign-in-message";

function mockWallet(address: string): ConnectedWallet {
  return {
    address,
    sign: async () => "0xsigned",
    getEthereumProvider: async () => {
      throw new Error("provider_unavailable");
    },
  } as unknown as ConnectedWallet;
}

test("signPlatformSiweMessage uses Privy signMessage first when authenticated", async () => {
  let called = false;
  const { signature, address } = await signPlatformSiweMessage({
    prepared: PREPARED,
    address: ADDRESS,
    wallets: [],
    getWallets: () => [],
    privyAuthenticated: true,
    privySignMessage: async () => {
      called = true;
      return { signature: "0xprivy" };
    },
    signMessageAsync: async () => "0xwagmi",
  });

  assert.equal(called, true);
  assert.equal(signature, "0xprivy");
  assert.equal(address, ADDRESS);
});

test("signPlatformSiweMessage falls back to connected Privy wallet", async () => {
  const wallet = mockWallet(ADDRESS);
  const { signature } = await signPlatformSiweMessage({
    prepared: PREPARED,
    address: ADDRESS,
    wallets: [wallet],
    getWallets: () => [wallet],
    privyAuthenticated: true,
    signMessageAsync: async () => "0xwagmi",
  });

  assert.equal(signature, "0xsigned");
});

test("signPlatformSiweMessage throws when no signer is available", async () => {
  await assert.rejects(
    () =>
      signPlatformSiweMessage({
        prepared: PREPARED,
        address: ADDRESS,
        wallets: [],
        getWallets: () => [],
        privyAuthenticated: false,
        signMessageAsync: async () => "0xwagmi",
      }),
    /wallet_not_ready/,
  );
});
