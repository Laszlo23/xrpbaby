import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { createPublicClient, http, isAddress, type Address } from "viem";
import { base } from "viem/chains";
import { baseRpcUrl } from "../env.js";
import { postSlackMessage } from "../slack.js";

function watchAddresses(): Address[] {
  const raw =
    process.env.AGENT_TREASURY_WATCH_ADDRESSES?.trim() ||
    process.env.TREASURY_WATCH_ADDRESSES?.trim() ||
    "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => isAddress(s)) as Address[];
}

export async function runTreasuryGuardianTick(agent: OpsAgentRecord): Promise<LedgerInsert> {
  const addrs = watchAddresses();
  if (addrs.length === 0) {
    return {
      agentId: agent.id,
      action: "chain.treasury_balances",
      params: { skipped: "no_AGENT_TREASURY_WATCH_ADDRESSES" },
      dryRun: true,
      status: "skipped",
      txHash: null,
      errorMsg: null,
      costUsd: null,
    };
  }

  const publicClient = createPublicClient({ chain: base, transport: http(baseRpcUrl()) });
  const balances: Record<string, string> = {};
  for (const a of addrs) {
    balances[a] = (await publicClient.getBalance({ address: a })).toString();
  }

  const minWei = BigInt(process.env.AGENT_TREASURY_MIN_WEI_ALERT?.trim() || "0");
  let alert = false;
  if (minWei > 0n) {
    for (const a of addrs) {
      if (BigInt(balances[a] ?? "0") < minWei) alert = true;
    }
  }

  const webhook = process.env.SLACK_WEBHOOK_URL?.trim() || process.env.AGENT_SLACK_WEBHOOK_URL?.trim();
  if (webhook && alert) {
    await postSlackMessage(
      webhook,
      `*Treasury low balance* (${agent.id})\n\`\`\`${JSON.stringify(balances, null, 2)}\`\`\``,
    );
  }

  return {
    agentId: agent.id,
    action: "chain.treasury_balances",
    params: { balances, alert },
    dryRun: false,
    status: "ok",
    txHash: null,
    costUsd: null,
  };
}
