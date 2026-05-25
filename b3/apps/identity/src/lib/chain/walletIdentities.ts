import { parseAbiItem, type Address } from "viem";
import { cultureLayerIdentityAbi } from "@/lib/contracts/identityAbi";
import { identityContractAddress, isContractConfigured } from "./config";
import { publicClient } from "./publicClient";
import { fetchIdentityByTokenId } from "./identityContract";
import { tldIdToLabel } from "./tlds";
import { getStoredIdentities } from "@/lib/identityStorage";

const CONTRACT_DEPLOY_BLOCK = 46_074_520n;

const identityMintedEvent = parseAbiItem(
  "event IdentityMinted(address indexed minter, uint256 indexed tokenId, string handle, uint8 tldId, bool isFounding)",
);

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
);

export type WalletIdentity = {
  fullName: string;
  tokenId: bigint;
};

async function tokenIdsFromLogs(address: Address): Promise<bigint[]> {
  if (!isContractConfigured) return [];

  const [minted, received] = await Promise.all([
    publicClient.getLogs({
      address: identityContractAddress,
      event: identityMintedEvent,
      args: { minter: address },
      fromBlock: CONTRACT_DEPLOY_BLOCK,
      toBlock: "latest",
    }),
    publicClient.getLogs({
      address: identityContractAddress,
      event: transferEvent,
      args: { to: address },
      fromBlock: CONTRACT_DEPLOY_BLOCK,
      toBlock: "latest",
    }),
  ]);

  const ids = new Set<bigint>();
  for (const log of minted) {
    if (log.args.tokenId !== undefined) ids.add(log.args.tokenId);
  }
  for (const log of received) {
    if (log.args.tokenId !== undefined) ids.add(log.args.tokenId);
  }
  return [...ids];
}

async function resolveOwnedIdentities(address: Address): Promise<WalletIdentity[]> {
  const tokenIds = await tokenIdsFromLogs(address);
  const owned: WalletIdentity[] = [];

  for (const tokenId of tokenIds) {
    try {
      const owner = await publicClient.readContract({
        address: identityContractAddress,
        abi: cultureLayerIdentityAbi,
        functionName: "ownerOf",
        args: [tokenId],
      });
      if (owner.toLowerCase() !== address.toLowerCase()) continue;
      const identity = await fetchIdentityByTokenId(tokenId);
      if (identity) {
        owned.push({ fullName: identity.fullName, tokenId });
      }
    } catch {
      // burned or invalid
    }
  }

  return owned;
}

export async function fetchWalletIdentities(address: Address): Promise<{
  identities: WalletIdentity[];
  primary: WalletIdentity | null;
}> {
  const stored = getStoredIdentities(address);
  const onchain = await resolveOwnedIdentities(address);

  const byName = new Map<string, WalletIdentity>();
  for (const id of onchain) {
    byName.set(id.fullName.toLowerCase(), id);
  }
  for (const name of stored) {
    if (!byName.has(name.toLowerCase())) {
      byName.set(name.toLowerCase(), { fullName: name, tokenId: 0n });
    }
  }

  const identities = [...byName.values()];
  const primary =
    identities.find((i) => stored[0] && i.fullName.toLowerCase() === stored[0]) ??
    identities[0] ??
    null;

  return { identities, primary };
}
