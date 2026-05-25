import { appChain, identityContractAddress } from "@/lib/chain/config";

export function openSeaAssetUrl(tokenId: bigint): string {
  const contract = identityContractAddress;
  const id = tokenId.toString();
  if (appChain.id === 84532) {
    return `https://testnets.opensea.io/assets/base-sepolia/${contract}/${id}`;
  }
  return `https://opensea.io/assets/base/${contract}/${id}`;
}

export function openSeaCollectionUrl(): string {
  const contract = identityContractAddress;
  if (appChain.id === 84532) {
    return `https://testnets.opensea.io/assets/base-sepolia/${contract}`;
  }
  return `https://opensea.io/assets/base/${contract}`;
}
