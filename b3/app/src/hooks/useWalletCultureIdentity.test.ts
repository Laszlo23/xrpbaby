import { describe, expect, it } from "vitest";
import { resolveVerifiedCultureIdentity } from "./useWalletCultureIdentity";

describe("resolveVerifiedCultureIdentity", () => {
  const wallet = "0xabc0000000000000000000000000000000000001";

  it("returns verified identity when owner matches wallet", () => {
    const result = resolveVerifiedCultureIdentity({
      address: wallet,
      candidate: "laszlo.culture",
      tokenId: 42n,
      owner: wallet,
    });

    expect(result.primaryName).toBe("laszlo.culture");
    expect(result.profilePath).toBe("/id/laszlo.culture");
    expect(result.isVerified).toBe(true);
  });

  it("rejects stale localStorage when owner mismatches", () => {
    const result = resolveVerifiedCultureIdentity({
      address: wallet,
      candidate: "laszlo.culture",
      tokenId: 42n,
      owner: "0xdef0000000000000000000000000000000000002",
    });

    expect(result.primaryName).toBeNull();
    expect(result.isVerified).toBe(false);
  });
});
