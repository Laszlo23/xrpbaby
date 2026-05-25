import { formatEther, type Address } from "viem";
import { cultureLayerIdentityAbi } from "@/lib/contracts/identityAbi";
import {
  identityContractAddress,
  isContractConfigured,
  chainLabel,
} from "./config";
import { publicClient } from "./publicClient";
import { parseIdentityFullName, tldIdToLabel, type TldLabel } from "./tlds";

export type OnchainIdentity = {
  tokenId: bigint;
  owner: Address;
  fullName: string;
  handle: string;
  tld: TldLabel;
  tldId: number;
  mintedAt: Date;
  isFounding: boolean;
  isTransferable: true;
  chainLabel: typeof chainLabel;
};

export function formatShortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function contractConfig() {
  if (!isContractConfigured) {
    throw new Error("Identity contract address is not configured");
  }
  return {
    address: identityContractAddress,
    abi: cultureLayerIdentityAbi,
  } as const;
}

export async function getMintPriceWei(): Promise<bigint> {
  if (!isContractConfigured) return 0n;
  return publicClient.readContract({
    ...contractConfig(),
    functionName: "mintPrice",
  });
}

export async function getMintPriceEth(): Promise<string> {
  const wei = await getMintPriceWei();
  const eth = formatEther(wei);
  const trimmed = eth.replace(/\.?0+$/, "");
  return trimmed || "0";
}

export async function checkAvailability(
  handle: string,
  tldId: number,
): Promise<boolean | null> {
  if (!isContractConfigured) return null;
  const clean = handle.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.length < 1) return null;
  try {
    return await publicClient.readContract({
      ...contractConfig(),
      functionName: "isAvailable",
      args: [clean, tldId],
    });
  } catch {
    return null;
  }
}

export async function fetchIdentityByTokenId(
  tokenId: bigint,
): Promise<OnchainIdentity | null> {
  if (!isContractConfigured || tokenId === 0n) return null;

  try {
    const [owner, handle, tldId, mintedAt, isFounding] = await publicClient.readContract({
      ...contractConfig(),
      functionName: "getIdentity",
      args: [tokenId],
    });

    const tld = tldIdToLabel(Number(tldId));
    if (!tld) return null;

    return {
      tokenId,
      owner: owner as Address,
      fullName: `${handle}.${tld}`,
      handle,
      tld,
      tldId: Number(tldId),
      mintedAt: new Date(Number(mintedAt) * 1000),
      isFounding,
      isTransferable: true,
      chainLabel,
    };
  } catch {
    return null;
  }
}

export async function fetchIdentityByName(
  fullName: string,
): Promise<OnchainIdentity | null> {
  if (!isContractConfigured) return null;

  const parsed = parseIdentityFullName(fullName);
  if (!parsed) return null;

  const tokenId = await publicClient.readContract({
    ...contractConfig(),
    functionName: "getTokenId",
    args: [parsed.handle, parsed.tldId],
  });

  if (tokenId === 0n) return null;

  const [owner, handle, tldId, mintedAt, isFounding] = await publicClient.readContract({
    ...contractConfig(),
    functionName: "getIdentity",
    args: [tokenId],
  });

  const tld = tldIdToLabel(Number(tldId));
  if (!tld) return null;

  return {
    tokenId,
    owner: owner as Address,
    fullName: `${handle}.${tld}`,
    handle,
    tld,
    tldId: Number(tldId),
    mintedAt: new Date(Number(mintedAt) * 1000),
    isFounding,
    isTransferable: true,
    chainLabel,
  };
}

export { isContractConfigured };
