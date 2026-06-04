import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getIdentityNetwork, listIdentityNetworks } from "./networks.ts";

describe("identity networks", () => {
  it("lists base and bsc", () => {
    const nets = listIdentityNetworks();
    assert.equal(nets.length, 2);
    assert.equal(nets[0]?.id, "base");
    assert.equal(nets[1]?.id, "bsc");
  });

  it("base mainnet chain id defaults to 8453", () => {
    assert.equal(getIdentityNetwork("base").chainId, 8453);
    assert.equal(getIdentityNetwork("base").nativeSymbol, "ETH");
  });

  it("bsc chain id defaults to 56", () => {
    assert.equal(getIdentityNetwork("bsc").chainId, 56);
    assert.equal(getIdentityNetwork("bsc").nativeSymbol, "BNB");
  });
});
