import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import {
  hubAbi,
  hubAddress,
  isHubConfigured,
  type ArtworkSlug,
  editionIds,
} from "@/modules/art/lib/contracts";

export function useEdition(slug: ArtworkSlug) {
  const editionId = editionIds[slug];

  const { data, isLoading, isError, refetch } = useReadContract({
    address: hubAddress,
    abi: hubAbi,
    functionName: "getEdition",
    args: [editionId],
    query: {
      enabled: isHubConfigured,
      refetchInterval: 12_000,
    },
  });

  const row = Array.isArray(data) ? data : undefined;

  const [onChainSlug, ticketPriceWei, maxSupply, sold, , active, drawn, winner, winningTokenId] =
    row ?? [];

  return {
    isConfigured: isHubConfigured,
    isLoading: isHubConfigured && isLoading,
    isError,
    refetch,
    editionId,
    slug: onChainSlug as string | undefined,
    ticketPriceWei: ticketPriceWei as bigint | undefined,
    ticketPriceEth:
      ticketPriceWei != null && typeof ticketPriceWei === "bigint"
        ? formatEther(ticketPriceWei)
        : undefined,
    maxSupply: maxSupply != null ? Number(maxSupply) : undefined,
    sold: sold != null ? Number(sold) : undefined,
    active: active as boolean | undefined,
    drawn: drawn as boolean | undefined,
    winner: winner as `0x${string}` | undefined,
    winningTokenId: winningTokenId as bigint | undefined,
    percentSold:
      maxSupply != null && sold != null && Number(maxSupply) > 0
        ? Math.round((Number(sold) / Number(maxSupply)) * 100)
        : undefined,
  };
}
