import type { Address, PublicClient } from "viem";
import { parseAbiItem } from "viem";
import { getCampaignFromBlock } from "@/lib/campaign";

const mintedEvent = parseAbiItem("event Minted(address indexed to, uint256 indexed tokenId)");

export type MintEventRow = {
  txHash: string;
  blockNumber: bigint;
  minter: Address;
  tokenId: bigint;
};

/** Lightweight client indexer: scans `Minted` logs (no subgraph). */
export async function fetchMintedEvents(
  publicClient: PublicClient,
  campaign: Address,
): Promise<MintEventRow[]> {
  const fromBlock = getCampaignFromBlock();
  const logs = await publicClient.getLogs({
    address: campaign,
    event: mintedEvent,
    fromBlock,
    toBlock: "latest",
  });

  return logs
    .map((log) => {
      const { transactionHash, blockNumber } = log;
      const to = log.args.to as Address;
      const tokenId = log.args.tokenId as bigint;
      return { txHash: transactionHash, blockNumber, minter: to, tokenId };
    })
    .sort((a, b) => Number(a.blockNumber - b.blockNumber));
}

/** Unique wallets that minted at least once. */
export function uniqueMinters(rows: MintEventRow[]): Address[] {
  const set = new Set<string>();
  for (const r of rows) set.add(r.minter.toLowerCase());
  return [...set] as Address[];
}

/** Mint counts per wallet (lowercase key). */
export function mintCountsByWallet(rows: MintEventRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = r.minter.toLowerCase();
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}
