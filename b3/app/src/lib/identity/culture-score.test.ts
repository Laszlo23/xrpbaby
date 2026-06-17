import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeCultureScore } from "../../lib/identity/culture-score.ts";
import type { CultureIdentityGraph } from "../../lib/identity/identity-graph-types.ts";

const sampleGraph: CultureIdentityGraph = {
  ok: true,
  source: "web3bio",
  primaryNode: {
    id: "farcaster:0xlaszlo",
    platform: "farcaster",
    identity: "0xlaszlo",
    address: "0xa82082380585489b0456e15343c23809bc334709",
    displayName: "Laszlo",
    avatar: "https://example.com/a.png",
    description: "builder",
    followerCount: 1500,
    links: { farcaster: { link: "https://farcaster.xyz/0xlaszlo", handle: "0xlaszlo" } },
  },
  graph: [
    {
      id: "farcaster:0xlaszlo",
      platform: "farcaster",
      identity: "0xlaszlo",
      address: "0xa82082380585489b0456e15343c23809bc334709",
      displayName: "Laszlo",
      avatar: null,
      description: null,
      followerCount: 1500,
      links: {},
    },
    {
      id: "ens:laszlo.eth",
      platform: "ens",
      identity: "laszlo.eth",
      address: "0xa82082380585489b0456e15343c23809bc334709",
      displayName: "laszlo.eth",
      avatar: null,
      description: null,
      followerCount: null,
      links: { twitter: { link: "https://x.com/laszlo", handle: "laszlo" } },
    },
  ],
  wallets: ["0xa82082380585489b0456e15343c23809bc334709"],
  platformCounts: { farcaster: 1, ens: 1 },
  totalFollowers: 1500,
  verifiedLinkCount: 2,
  fetchedAt: "2026-06-17T00:00:00.000Z",
};

describe("computeCultureScore", () => {
  it("returns score between 0 and 10 with six dimensions", () => {
    const result = computeCultureScore({
      resolved: {
        ok: true,
        configured: true,
        status: "claimed",
        fullName: "laszlo.culture",
        handle: "laszlo",
        tld: "culture",
        isFounding: true,
        tokenId: "1",
        mintedAt: "2024-01-01T00:00:00.000Z",
      },
      graph: sampleGraph,
      nftCount: 5,
      txCount: 10,
      member: { farcasterUsername: "0xlaszlo", supportScore: 1200, culturePoints: 200, supporterTier: "founding" },
    });

    assert.ok(result.score >= 0 && result.score <= 10);
    assert.equal(result.dimensions.length, 6);
    assert.ok(result.note.length > 0);
    assert.ok(result.rank.label.length > 0);
  });

  it("handles missing graph gracefully", () => {
    const result = computeCultureScore({
      resolved: {
        ok: true,
        configured: true,
        status: "claimed",
        fullName: "test.culture",
      },
      graph: null,
    });
    assert.ok(result.score >= 0);
    assert.equal(result.note, "from onchain identity");
  });
});
