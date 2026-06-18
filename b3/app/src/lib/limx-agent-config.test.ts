import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  LIMX_AGENT_WALLET_ADDRESS,
  limxAgentWalletAddress,
  x402LimxPrice,
} from "./limx-agent-config.ts";

describe("limx-agent-config", () => {
  it("defaults Limx wallet address", () => {
    assert.equal(limxAgentWalletAddress(), LIMX_AGENT_WALLET_ADDRESS);
  });

  it("defaults Limx x402 price", () => {
    assert.equal(x402LimxPrice(), "$0.25");
  });
});
