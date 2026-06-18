/**
 * Live ecosystem activity feed — template-based one-liners (no LLM cost).
 *
 * Sources: BCC token transfers from Blockscout + recent on-chain mints already
 * indexed into Postgres (`ChainMintEvent`).
 */
import { BCC_ADDRESS, BCC_CHAIN_ID } from "@bc/bcc-kit";

import { fetchBsTokenTransfers } from "@/server/explorer/blockscout";
import { describeTokenTransfer, shortAddress } from "@/server/explorer/interpret";
import { getPrisma } from "@/server/db/prisma";

export type FeedItem = {
  id: string;
  kind: "bcc-transfer" | "mint";
  summary: string;
  txHash: string | null;
  address: string | null;
  timestamp: string;
  ecosystemTag: string;
};

export type ExplorerFeed = {
  ok: boolean;
  updatedAt: string;
  items: FeedItem[];
};

let cachedFeed: { at: number; feed: ExplorerFeed } | null = null;
const FEED_CACHE_MS = 20_000;

async function fetchBccTransferItems(): Promise<FeedItem[]> {
  const transfers = await fetchBsTokenTransfers(BCC_ADDRESS);
  return transfers.slice(0, 25).map((t, i) => ({
    id: `bcc:${t.transaction_hash ?? "?"}:${t.log_index ?? i}`,
    kind: "bcc-transfer" as const,
    summary: describeTokenTransfer(t, BCC_CHAIN_ID),
    txHash: t.transaction_hash ?? null,
    address: null,
    timestamp: t.timestamp ?? new Date().toISOString(),
    ecosystemTag: "BCC",
  }));
}

async function fetchMintItems(): Promise<FeedItem[]> {
  const prisma = getPrisma();
  if (!prisma) return [];
  try {
    const mints = await prisma.chainMintEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    });
    return mints.map((m) => ({
      id: `mint:${m.chainId}:${m.txHash}:${m.logIndex}`,
      kind: "mint" as const,
      summary: `${shortAddress(m.toAddress)} minted token #${m.tokenId} in the Building Culture ecosystem`,
      txHash: m.txHash,
      address: m.toAddress,
      timestamp: m.createdAt.toISOString(),
      ecosystemTag: "Mint",
    }));
  } catch {
    return [];
  }
}

export async function getExplorerFeed(): Promise<ExplorerFeed> {
  if (cachedFeed && Date.now() - cachedFeed.at < FEED_CACHE_MS) return cachedFeed.feed;

  const [bcc, mints] = await Promise.all([fetchBccTransferItems(), fetchMintItems()]);
  const items = [...bcc, ...mints]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30);

  const feed: ExplorerFeed = {
    ok: items.length > 0,
    updatedAt: new Date().toISOString(),
    items,
  };
  cachedFeed = { at: Date.now(), feed };
  return feed;
}
