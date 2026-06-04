import { useMemo } from "react";
import { usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { parseAbiItem } from "viem";
import { artworkTitles } from "@/modules/art/data/artworks";
import { hubAddress, isHubConfigured } from "@/modules/art/lib/contracts";
import { targetChainId } from "@/modules/art/lib/chains";

export type ActivityItem = {
  wallet: string;
  action: string;
  artwork: string;
  time: string;
  txHash: `0x${string}`;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

const ticketsMintedEvent = parseAbiItem(
  "event TicketsMinted(uint256 indexed editionId, address indexed buyer, uint256 quantity, uint256 firstTokenId)",
);

export function useTicketActivity() {
  const publicClient = usePublicClient({ chainId: targetChainId });

  const { data, isLoading } = useQuery({
    queryKey: ["ticket-activity", hubAddress, targetChainId],
    enabled: isHubConfigured && !!publicClient,
    refetchInterval: 15_000,
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!publicClient) return [];

      const latest = await publicClient.getBlockNumber();
      const deployBlock = import.meta.env.VITE_DEPLOYMENT_BLOCK
        ? BigInt(import.meta.env.VITE_DEPLOYMENT_BLOCK)
        : latest > 500_000n
          ? latest - 500_000n
          : 0n;

      const logs = await publicClient.getLogs({
        address: hubAddress,
        event: ticketsMintedEvent,
        fromBlock: deployBlock,
        toBlock: latest,
      });

      const recent = logs.slice(-12).reverse();
      const items: ActivityItem[] = [];

      for (const log of recent) {
        const { editionId, buyer, quantity } = log.args;
        if (editionId == null || !buyer || quantity == null) continue;

        const slug =
          editionId === 0n ? "horizon" : editionId === 1n ? "storm" : `edition-${editionId}`;
        const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
        const time = formatDistanceToNowStrict(new Date(Number(block.timestamp) * 1000), {
          addSuffix: false,
        });

        items.push({
          wallet: shortenAddress(buyer),
          action: `minted ${quantity.toString()} ticket${quantity > 1n ? "s" : ""}`,
          artwork: artworkTitles[slug as keyof typeof artworkTitles] ?? slug,
          time: time.replace(" seconds", "s").replace(" minutes", "m").replace(" hours", "h"),
          txHash: log.transactionHash,
        });
      }
      return items;
    },
  });

  const feed = useMemo(() => data ?? [], [data]);

  return { feed, isLoading, hasContract: isHubConfigured };
}
