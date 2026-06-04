import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BCC_ADDRESS } from "./index.ts";
import { buildJumperSolToBccUrl, buildSolanaToBccRoutes } from "./solana.ts";

describe("buildJumperSolToBccUrl", () => {
  it("targets Base BCC from SOL", () => {
    const url = buildJumperSolToBccUrl("SOL");
    assert.match(url, /jumper\.exchange/);
    assert.match(url, new RegExp(BCC_ADDRESS.slice(2, 10), "i"));
    assert.match(url, /toChain=8453/);
  });
});

describe("buildSolanaToBccRoutes", () => {
  it("returns jumper as first route", () => {
    const routes = buildSolanaToBccRoutes();
    assert.ok(routes.length >= 3);
    assert.equal(routes[0]?.id, "jumper-sol");
  });
});
