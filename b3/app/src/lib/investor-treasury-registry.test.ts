import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getInvestorTreasuryWalletDefinitions } from "./investor-treasury-registry.ts";
import { getXrplNetwork, isXrplExecutionAllowed, xrpExecutionEnabledFlag } from "./xrpl-env.ts";

describe("investor-treasury-registry", () => {
  it("includes protocol treasury Safe on Base", () => {
    const wallets = getInvestorTreasuryWalletDefinitions();
    const safe = wallets.find((w) => w.id === "treasury-safe");
    assert.ok(safe);
    assert.equal(safe.kind, "evm");
    assert.equal(safe.network, "mainnet");
    assert.ok(safe.trackUsdc);
    assert.ok(safe.trackBcc);
  });
});

describe("xrpl-env execution guard", () => {
  it("blocks mainnet execution when flag is set", () => {
    const prevNetwork = process.env.XRPL_NETWORK;
    const prevExec = process.env.XRPL_EXECUTION_ENABLED;
    process.env.XRPL_NETWORK = "mainnet";
    process.env.XRPL_EXECUTION_ENABLED = "1";
    assert.equal(getXrplNetwork(), "mainnet");
    assert.equal(xrpExecutionEnabledFlag(), true);
    assert.equal(isXrplExecutionAllowed(), false);
    process.env.XRPL_NETWORK = prevNetwork;
    process.env.XRPL_EXECUTION_ENABLED = prevExec;
  });

  it("allows testnet execution when flag is set", () => {
    const prevNetwork = process.env.XRPL_NETWORK;
    const prevExec = process.env.XRPL_EXECUTION_ENABLED;
    process.env.XRPL_NETWORK = "testnet";
    process.env.XRPL_EXECUTION_ENABLED = "1";
    assert.equal(isXrplExecutionAllowed(), true);
    process.env.XRPL_NETWORK = prevNetwork;
    process.env.XRPL_EXECUTION_ENABLED = prevExec;
  });
});
