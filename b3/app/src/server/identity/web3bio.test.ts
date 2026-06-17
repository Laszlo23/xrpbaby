import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCultureIdentityGraph,
  normalizeWeb3BioProfiles,
  type Web3BioRawProfile,
} from "./web3bio.ts";

const FIXTURE: Web3BioRawProfile[] = [
  {
    address: "0xa82082380585489b0456e15343c23809bc334709",
    identity: "4fans.linea.eth",
    platform: "linea",
    displayName: "4fans.linea.eth",
    links: {
      twitter: { link: "https://x.com/laszloleonardo", handle: "laszloleonardo" },
    },
    social: { follower: 34, following: 0 },
  },
  {
    address: "0xa82082380585489b0456e15343c23809bc334709",
    identity: "0xlaszlo",
    platform: "farcaster",
    displayName: "Laszlo Bihary",
    avatar: "https://example.com/avatar.png",
    description: "Just Love Blockchain",
    links: {
      farcaster: { link: "https://farcaster.xyz/0xlaszlo", handle: "0xlaszlo" },
    },
    social: { uid: 20713, follower: 168, following: 96 },
  },
  {
    address: "0xa82082380585489b0456e15343c23809bc334709",
    identity: "0xlaszlo",
    platform: "farcaster",
    displayName: "Duplicate should lose",
    social: { follower: 1, following: 0 },
  },
  {
    address: "0x981808b4a50f7f33b81fa166aaec1bcd90c61a88",
    identity: "laszloleonardo.eth",
    platform: "ens",
    displayName: "laszloleonardo.eth",
    avatar: "https://euc.li/laszloleonardo.eth",
  },
];

describe("normalizeWeb3BioProfiles", () => {
  it("dedupes by platform+identity and prefers richer nodes", () => {
    const graph = normalizeWeb3BioProfiles(FIXTURE);
    const fc = graph.find((n) => n.platform === "farcaster" && n.identity === "0xlaszlo");
    assert.ok(fc);
    assert.equal(fc.displayName, "Laszlo Bihary");
    assert.equal(fc.avatar, "https://example.com/avatar.png");
    assert.equal(fc.followerCount, 168);
    assert.equal(graph.length, 3);
  });
});

describe("buildCultureIdentityGraph", () => {
  it("builds graph summary with wallets and platform counts", () => {
    const result = buildCultureIdentityGraph(FIXTURE, "2026-06-17T00:00:00.000Z");
    assert.equal(result.ok, true);
    assert.equal(result.source, "web3bio");
    assert.equal(result.graph.length, 3);
    assert.equal(result.platformCounts.linea, 1);
    assert.equal(result.platformCounts.farcaster, 1);
    assert.equal(result.platformCounts.ens, 1);
    assert.equal(result.wallets.length, 2);
    assert.equal(result.totalFollowers, 34 + 168);
    assert.equal(result.verifiedLinkCount, 2);
    assert.ok(result.primaryNode);
    assert.equal(result.primaryNode?.platform, "farcaster");
  });
});
