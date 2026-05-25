/**
 * Index AgentShareCampaign `Minted` logs into Postgres (`ChainMintEvent`).
 *
 * Usage (from repo root):
 *   cd frontend && DATABASE_URL=... VITE_AGENT_SHARE_CAMPAIGN_ADDRESS=0x... npx tsx scripts/chain-index-events.ts
 *
 * Optional: INDEX_FROM_BLOCK (default: max indexed block + 1, or 0), BASE_RPC_URL, VITE_EVM_CHAIN_ID (8453).
 */
import { PrismaClient } from "@prisma/client";
import {
  createPublicClient,
  http,
  parseAbiItem,
  parseEventLogs,
  type Address,
  type Hex,
} from "viem";
import { base } from "viem/chains";
import {
  agentShareCampaignAbi,
  resolveAgentShareCampaignAddress,
  type EnvLike,
} from "@bc/contracts-sdk";

const prisma = new PrismaClient();

const mintedEvent = parseAbiItem(
  "event Minted(address indexed to, uint256 indexed tokenId, uint8 indexed agentTypeId, address referrer)",
);

function envLike(): EnvLike {
  return { ...process.env } as EnvLike;
}

function chainId(): number {
  const n = Number(process.env.VITE_EVM_CHAIN_ID ?? process.env.AGENT_CHAIN_ID ?? "8453");
  return Number.isFinite(n) ? n : 8453;
}

function rpcUrl(): string {
  return (
    process.env.BASE_RPC_URL?.trim() ||
    process.env.VITE_BASE_RPC_URL?.trim() ||
    process.env.AGENT_BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org"
  );
}

const CHUNK = 1500n;

async function main() {
  const cid = chainId();
  const env = envLike();
  const contract = resolveAgentShareCampaignAddress(cid, env);
  if (!contract) {
    throw new Error("Set VITE_AGENT_SHARE_CAMPAIGN_ADDRESS (or deployments JSON) for chain " + cid);
  }

  const transport = http(rpcUrl());
  const client =
    cid === base.id
      ? createPublicClient({ chain: base, transport })
      : createPublicClient({ transport });

  if (process.env.CHAIN_INDEX_SMOKE === "1") {
    const latest = await client.getBlockNumber();
    console.log(`[chain-index smoke] ok chain=${cid} contract=${contract} latestBlock=${latest}`);
    return;
  }

  const latest = await client.getBlockNumber();

  let fromBlock = 0n;
  const envFrom = process.env.INDEX_FROM_BLOCK?.trim();
  if (envFrom) {
    fromBlock = BigInt(envFrom);
  } else {
    const last = await prisma.chainMintEvent.findFirst({
      where: { chainId: cid },
      orderBy: { blockNumber: "desc" },
    });
    fromBlock = last ? BigInt(last.blockNumber) + 1n : 0n;
  }

  if (fromBlock > latest) {
    console.log(`Up to date (fromBlock ${fromBlock} > latest ${latest})`);
    return;
  }

  let inserted = 0;
  let cursor = fromBlock;

  while (cursor <= latest) {
    const to = cursor + CHUNK > latest ? latest : cursor + CHUNK;
    const logs = await client.getLogs({
      address: contract as Address,
      event: mintedEvent,
      fromBlock: cursor,
      toBlock: to,
    });

    const parsed = parseEventLogs({ abi: agentShareCampaignAbi, logs });

    for (const ev of parsed) {
      if (ev.eventName !== "Minted") continue;
      const {
        to: toAddress,
        tokenId,
        agentTypeId,
        referrer,
      } = ev.args as {
        to: Address;
        tokenId: bigint;
        agentTypeId: number;
        referrer: Address;
      };
      const txHash = ev.transactionHash as Hex;
      const logIndex = ev.logIndex;
      const blockNumber = ev.blockNumber;

      await prisma.chainMintEvent.upsert({
        where: {
          chainId_txHash_logIndex: {
            chainId: cid,
            txHash,
            logIndex,
          },
        },
        create: {
          chainId: cid,
          contractAddress: contract.toLowerCase(),
          blockNumber,
          txHash,
          logIndex,
          toAddress: toAddress.toLowerCase(),
          tokenId: tokenId.toString(),
          agentTypeId: Number(agentTypeId),
          referrer: referrer ? referrer.toLowerCase() : null,
        },
        update: {},
      });
      inserted += 1;
    }

    console.log(`Indexed blocks ${cursor}-${to}, cumulative rows upserted: ${inserted}`);
    cursor = to + 1n;
  }

  console.log(`Done. Upserted ${inserted} Minted logs for ${contract}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
