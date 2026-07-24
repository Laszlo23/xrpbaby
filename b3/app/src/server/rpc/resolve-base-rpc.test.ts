import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { resolveBaseRpcUrl } from "@/server/rpc/resolve-base-rpc";

describe("resolveBaseRpcUrl", () => {
  const snapshot = { ...process.env };

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in snapshot)) delete process.env[key];
    }
    for (const [key, value] of Object.entries(snapshot)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("prefers explicit non-public BASE_RPC_URL", () => {
    process.env.BASE_RPC_URL = "https://base-mainnet.g.alchemy.com/v2/test-key";
    delete process.env.VITE_BASE_RPC_URL;
    delete process.env.ALCHEMY_API_KEY;
    assert.equal(resolveBaseRpcUrl(), "https://base-mainnet.g.alchemy.com/v2/test-key");
  });

  it("builds Alchemy URL from ALCHEMY_API_KEY when only public RPC is set", () => {
    process.env.VITE_BASE_RPC_URL = "https://mainnet.base.org";
    delete process.env.BASE_RPC_URL;
    process.env.ALCHEMY_API_KEY = "abc123";
    assert.equal(resolveBaseRpcUrl(), "https://base-mainnet.g.alchemy.com/v2/abc123");
  });

  it("falls back to public Base RPC", () => {
    delete process.env.BASE_RPC_URL;
    delete process.env.ALCHEMY_API_KEY;
    process.env.VITE_BASE_RPC_URL = "https://mainnet.base.org";
    assert.equal(resolveBaseRpcUrl(), "https://mainnet.base.org");
  });
});
