import { createThirdwebClient, type ThirdwebClient } from "thirdweb";
import { getContract } from "thirdweb";
import { getAllValidListings } from "thirdweb/extensions/marketplace";
import { defineChain } from "thirdweb";

import {
  getMarketplaceChainId,
  getMarketplaceContractAddress,
} from "@/server/market/env";

export function getMarketThirdwebClient(): ThirdwebClient | null {
  const secret = process.env.THIRDWEB_SECRET_KEY?.trim();
  if (secret) return createThirdwebClient({ secretKey: secret });
  const clientId =
    process.env.VITE_THIRDWEB_CLIENT_ID?.trim() || process.env.THIRDWEB_CLIENT_ID?.trim();
  if (clientId) return createThirdwebClient({ clientId });
  return null;
}

export type MarketListingRow = {
  listingId: string;
  assetContractAddress: string;
  tokenId: string;
  currencyContractAddress: string;
  pricePerToken: string;
  currencySymbol: string;
  title: string | null;
  image: string | null;
  type: string;
};

function listingRow(l: {
  id: bigint;
  assetContractAddress: string;
  tokenId: bigint;
  currencyContractAddress: string;
  currencyValuePerToken: { displayValue: string; symbol: string };
  asset?: { metadata?: { name?: string; image?: string } };
  type: string;
}): MarketListingRow {
  return {
    listingId: l.id.toString(),
    assetContractAddress: l.assetContractAddress,
    tokenId: l.tokenId.toString(),
    currencyContractAddress: l.currencyContractAddress,
    pricePerToken: l.currencyValuePerToken.displayValue,
    currencySymbol: l.currencyValuePerToken.symbol,
    title: l.asset?.metadata?.name ?? null,
    image: l.asset?.metadata?.image ?? null,
    type: l.type,
  };
}

export async function fetchMarketListings(opts: {
  limit?: number;
  collection?: string;
}): Promise<{ ok: true; listings: MarketListingRow[] } | { ok: false; error: string }> {
  const client = getMarketThirdwebClient();
  const marketplace = getMarketplaceContractAddress();
  if (!client) {
    return { ok: false, error: "thirdweb_not_configured" };
  }
  if (!marketplace) {
    return { ok: false, error: "marketplace_not_configured" };
  }

  const chainId = getMarketplaceChainId();
  const count = BigInt(Math.min(Math.max(opts.limit ?? 50, 1), 100));
  const contract = getContract({
    client,
    chain: defineChain(chainId),
    address: marketplace,
  });

  try {
    const raw = await getAllValidListings({ contract, count });
    let rows = raw.map(listingRow);
    const collection = opts.collection?.trim().toLowerCase();
    if (collection === "pit" || collection === "featured") {
      const pit = process.env.VITE_PIT_NFT_CONTRACT_ADDRESS?.trim().toLowerCase()
        ?? process.env.VITE_BASE_PRIMARY_CONTRACT_ADDRESS?.trim().toLowerCase();
      if (pit) {
        rows = rows.filter((r) => r.assetContractAddress.toLowerCase() === pit);
      }
    }
    return { ok: true, listings: rows };
  } catch (e) {
    const message = e instanceof Error ? e.message : "marketplace_fetch_failed";
    return { ok: false, error: message };
  }
}
