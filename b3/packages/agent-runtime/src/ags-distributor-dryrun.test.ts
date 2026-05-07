import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EconAgentRecord } from "./types.js";

vi.mock("./strapi-profiles.js", () => ({
  fetchCommunityProfiles: vi.fn(async () => [
    {
      documentId: "doc-1",
      slug: "builder-1",
      displayName: "Builder",
      ownerAddress: "0x0000000000000000000000000000000000000b01",
    },
  ]),
}));

vi.mock("./ledger-query.js", () => ({
  fetchMonthlyMintTransferRows: vi.fn(async () => []),
  countAgentMonthlySuccessfulMints: vi.fn(async () => 0),
}));

vi.mock("./chain-ags.js", () => ({
  resolveCampaign: () => "0x0000000000000000000000000000000000000d02",
  readMintPriceWei: vi.fn(async () => 1n),
  readMintsToday: vi.fn(async () => 0n),
  readDailyMintCap: vi.fn(async () => 100n),
  createClients: vi.fn(() => ({ publicClient: {}, walletClient: null })),
}));

const agent = {
  id: "ags-distributor-1",
  fleet: "econ",
  role: "distribution",
  systemPrompt: "test",
  tools: ["chain.ags_mint_transfer", "strapi.read_profiles"],
  dailyApiBudgetUsd: 0,
  walletAddress: "",
  signerSource: "env_private_key",
  dailyGasCapWei: "0",
  perTxAgsCap: 5,
  monthlyAgsCap: 30,
  allowedContracts: ["AgentShareCampaign"],
  agentTypeId: 1,
  maxRecipientsPerTick: 5,
} as const satisfies EconAgentRecord;

describe("ags-distributor dry-run", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    process.env.ECON_LIVE = "false";
    process.env.STRAPI_URL = "http://127.0.0.1:1337";
    delete process.env.AGENT_AGS_DISTRIBUTOR_PRIVATE_KEY;
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it("logs ok intents with dryRun true and never sets txHash", async () => {
    const { runAgsDistributorTick } = await import("./handlers/ags-distributor.js");
    const rows = await runAgsDistributorTick(agent, "postgresql://unused:unused@127.0.0.1:5432/unused");
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(r.txHash).toBeNull();
      if (r.action === "chain.ags_mint_transfer" && r.status === "ok") {
        expect(r.dryRun).toBe(true);
        expect((r.params as { mode?: string }).mode).toBe("econ_live_false");
      }
    }
  });
});
