import { raffleTicketCampaignAbi, resolveRaffleCampaignAddress } from "@bc/contracts-sdk";
import { createPublicClient, http, isAddress, type Abi, type Address } from "viem";
import { base } from "viem/chains";
import type { OpsAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { contractsEnv, chainId, baseRpcUrl } from "../env.js";
import { postSlackMessage } from "../slack.js";
import pg from "pg";

let pool: pg.Pool | null = null;
function qPool(db: string) {
  if (!pool) pool = new pg.Pool({ connectionString: db, max: 2 });
  return pool;
}

async function lastSnapshot(db: string, agentId: string): Promise<Record<string, unknown> | null> {
  const p = qPool(db);
  const r = await p.query<{ params: unknown }>(
    `SELECT params FROM "AgentActionLog"
     WHERE "agentId" = $1 AND "action" = $2 AND "status" = 'ok'
     ORDER BY "createdAt" DESC LIMIT 1`,
    [agentId, "chain.raffle_snapshot"],
  );
  const row = r.rows[0]?.params as Record<string, unknown> | undefined;
  return row ?? null;
}

export async function runRaffleWatcherTick(agent: OpsAgentRecord, databaseUrl: string): Promise<LedgerInsert> {
  const env = contractsEnv();
  const cid = chainId();
  const addr = resolveRaffleCampaignAddress(cid, env);
  if (!addr || !isAddress(addr)) {
    return {
      agentId: agent.id,
      action: "chain.raffle_snapshot",
      params: { error: "no_raffle_address" },
      dryRun: true,
      status: "skipped",
      txHash: null,
      errorMsg: "Raffle address unresolved",
      costUsd: null,
    };
  }

  const transport = http(baseRpcUrl());
  const publicClient = createPublicClient({ chain: base, transport });

  const abi = raffleTicketCampaignAbi as Abi;

  try {
    const [phase, drawCommitment, entropyBlock, winningTokenId, totalSupply] = await Promise.all([
      publicClient.readContract({
        address: addr as Address,
        abi,
        functionName: "phase",
      }),
      publicClient.readContract({
        address: addr as Address,
        abi,
        functionName: "drawCommitment",
      }),
      publicClient.readContract({
        address: addr as Address,
        abi,
        functionName: "entropyBlock",
      }),
      publicClient.readContract({
        address: addr as Address,
        abi,
        functionName: "winningTokenId",
      }),
      publicClient.readContract({
        address: addr as Address,
        abi,
        functionName: "totalSupply",
      }),
    ]);

    const eb = BigInt(entropyBlock as bigint | number | string);
    const winId = BigInt(winningTokenId as bigint | number | string);
    const supply = BigInt(totalSupply as bigint | number | string);

    const snap = {
      phase: Number(phase),
      drawCommitment,
      entropyBlock: eb.toString(),
      winningTokenId: winId.toString(),
      totalSupply: supply.toString(),
      campaign: addr,
    };

    const prev = await lastSnapshot(databaseUrl, agent.id);
    const changed =
      prev &&
      (Number(prev.phase) !== snap.phase ||
        String(prev.drawCommitment) !== String(snap.drawCommitment) ||
        String(prev.entropyBlock) !== snap.entropyBlock);

    const webhook = process.env.SLACK_WEBHOOK_URL?.trim() || process.env.AGENT_SLACK_WEBHOOK_URL?.trim();
    if (webhook && changed) {
      await postSlackMessage(
        webhook,
        [
          `*Raffle state change* (${agent.id})`,
          `\`phase\` ${prev?.phase} → ${snap.phase}`,
          `drawCommitment: \`${String(drawCommitment).slice(0, 18)}…\``,
          `entropyBlock: ${snap.entropyBlock} · supply: ${snap.totalSupply}`,
        ].join("\n"),
      );
    }

    return {
      agentId: agent.id,
      action: "chain.raffle_snapshot",
      params: snap,
      dryRun: false,
      status: "ok",
      txHash: null,
      costUsd: null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      agentId: agent.id,
      action: "chain.raffle_snapshot",
      params: { campaign: addr, error: msg },
      dryRun: true,
      status: "skipped",
      txHash: null,
      errorMsg: msg.slice(0, 2000),
      costUsd: null,
    };
  }
}
