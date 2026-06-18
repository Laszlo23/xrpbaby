import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  LANDING_STAT_DISPLAY_FLOORS,
  LANDING_STAT_FLOOR,
  landingProofDisplay,
  landingProofLabel,
  landingProofValue,
} from "./landing-proof-display.ts";
import type { PublicProofStats } from "@/server/public/proof";

function mockProof(overrides: Partial<PublicProofStats> = {}): PublicProofStats {
  return {
    capturedAt: new Date().toISOString(),
    community: {
      members: 1,
      waitlist: 1,
      membersWithWallet: 0,
      membersWithFarcaster: 0,
    },
    bcc: {
      tokenAddress: "0x0",
      priceUsd: 0.001,
      marketCapUsd: 1000,
      liquidityUsd: 500,
      volume24hUsd: 50,
      holders: 42,
      holdersSource: "blockscout",
    },
    game: {
      raffleTicketsMinted: 10,
      agentShareTokensMinted: 5,
      culturePointsNet: 50,
      activity24h: 2,
    },
    market: { activeListings: 3 },
    social: { verifiedLinkedAccounts: 0 },
    commerce: { packPurchases: 0 },
    proofUrls: {
      traction: "/api/investors/traction",
      grantProof: "/grant-proof",
      dexScreener: "https://dexscreener.com",
      basescanToken: "https://basescan.org",
      blockscoutToken: "https://blockscout.com",
    },
    ...overrides,
  };
}

describe("landing-proof-display", () => {
  it("applies per-key floors below threshold", () => {
    const proof = mockProof();
    assert.equal(landingProofValue("members", proof, false), "333+");
    assert.equal(landingProofValue("membersWithWallet", proof, false), "127+");
    assert.equal(landingProofValue("activity24h", proof, false), "89+");
    assert.equal(landingProofValue("culturePoints", proof, false), "2,450+");
  });

  it("shows real count when at or above per-key floor", () => {
    const proof = mockProof({
      community: { members: 400, waitlist: 500, membersWithWallet: 350, membersWithFarcaster: 0 },
      game: { raffleTicketsMinted: 10, agentShareTokensMinted: 5, culturePointsNet: 3000, activity24h: 100 },
    });
    assert.equal(landingProofValue("members", proof, false), "400");
    assert.equal(landingProofValue("activity24h", proof, false), "100");
  });

  it("does not floor on-chain metrics without bespoke floor", () => {
    const proof = mockProof();
    assert.equal(landingProofValue("bccHolders", proof, false), "42");
    assert.ok(landingProofValue("bccPrice", proof, false).startsWith("$"));
  });

  it("shows real counts for non-floored integer stats", () => {
    const proof = mockProof();
    assert.equal(landingProofValue("raffleTickets", proof, false), "10");
    assert.equal(landingProofValue("agentShareMints", proof, false), "5");
  });

  it("returns ellipsis while loading", () => {
    assert.equal(landingProofValue("members", undefined, true), "…");
    assert.equal(landingProofDisplay("members", undefined, true).loading, true);
  });

  it("maps marketing labels", () => {
    assert.equal(landingProofLabel("members", "Members"), "Founding Members");
    assert.equal(landingProofLabel("bccPrice", "$BCC price"), "$BCC price");
  });

  it("exposes varied display floors", () => {
    assert.equal(LANDING_STAT_FLOOR, 333);
    assert.equal(LANDING_STAT_DISPLAY_FLOORS.members, 333);
    assert.notEqual(LANDING_STAT_DISPLAY_FLOORS.activity24h, LANDING_STAT_DISPLAY_FLOORS.members);
  });
});
