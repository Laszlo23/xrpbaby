import type { Address } from "viem";
import { appChain, identityContractAddress } from "@/lib/chain/config";
import type { NftHolding, SocialProviderResult } from "./types";

function alchemyKey(): string | null {
  const key = process.env.ALCHEMY_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

function alchemyNetwork(): string {
  return appChain.id === 8453 ? "base-mainnet" : "base-sepolia";
}

type AlchemyNft = {
  contract?: { address?: string };
  tokenId?: string;
  name?: string;
  image?: { cachedUrl?: string; originalUrl?: string };
  media?: Array<{ gateway?: string }>;
};

export async function fetchWalletHoldings(
  owner: Address,
  cultureTokenId?: bigint,
  cultureFullName?: string,
): Promise<SocialProviderResult<NftHolding[]>> {
  const holdings: NftHolding[] = [];

  if (cultureTokenId !== undefined && cultureFullName) {
    holdings.push({
      contractAddress: identityContractAddress,
      tokenId: cultureTokenId.toString(),
      name: cultureFullName,
      isCultureLayer: true,
    });
  }

  const key = alchemyKey();
  if (!key) {
    return { ok: true, data: holdings };
  }

  try {
    const url = new URL(
      `https://${alchemyNetwork()}.g.alchemy.com/nft/v3/${key}/getNFTsForOwner`,
    );
    url.searchParams.set("owner", owner);
    url.searchParams.set("withMetadata", "true");
    url.searchParams.set("pageSize", "20");

    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) {
      return { ok: true, data: holdings };
    }

    const json = (await res.json()) as { ownedNfts?: AlchemyNft[] };
    const contractLower = identityContractAddress.toLowerCase();

    for (const nft of json.ownedNfts || []) {
      const contract = nft.contract?.address?.toLowerCase();
      if (!contract || contract === contractLower) continue;

      const imageUrl =
        nft.image?.cachedUrl ||
        nft.image?.originalUrl ||
        nft.media?.[0]?.gateway;

      holdings.push({
        contractAddress: nft.contract!.address!,
        tokenId: nft.tokenId || "0",
        name: nft.name || "NFT",
        imageUrl,
      });

      if (holdings.length >= 7) break;
    }

    return { ok: true, data: holdings };
  } catch {
    return { ok: true, data: holdings };
  }
}
