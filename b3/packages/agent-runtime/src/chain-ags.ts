import {
  agentShareCampaignAbi,
  BASE_MAINNET_CHAIN_ID,
  resolveAgentShareCampaignAddress,
  type EnvLike,
} from "@bc/contracts-sdk";
import {
  type Address,
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import type { EconAgentRecord } from "./types.js";

function chainForId(chainId: number) {
  if (chainId !== 8453) {
    throw new Error(`Unsupported chainId ${chainId}; agent-runtime only supports Base mainnet (8453)`);
  }
  return base;
}

export async function readMintPriceWei(publicClient: PublicClient, campaign: Address): Promise<bigint> {
  return publicClient.readContract({
    address: campaign,
    abi: agentShareCampaignAbi,
    functionName: "mintPriceWei",
  });
}

export async function readMintsToday(publicClient: PublicClient, campaign: Address): Promise<bigint> {
  return publicClient.readContract({
    address: campaign,
    abi: agentShareCampaignAbi,
    functionName: "mintsToday",
  });
}

export async function readDailyMintCap(publicClient: PublicClient, campaign: Address): Promise<bigint> {
  return publicClient.readContract({
    address: campaign,
    abi: agentShareCampaignAbi,
    functionName: "dailyMintCap",
  });
}

/** Mint one share to agent wallet then transfer to recipient. Referrer = zero address. */
export async function mintAndTransferToRecipient(opts: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  campaign: Address;
  agent: EconAgentRecord;
  recipient: Address;
}): Promise<{ txHash: `0x${string}`; tokenId: bigint }> {
  const { publicClient, walletClient, campaign, agent, recipient } = opts;
  const account = walletClient.account;
  if (!account) throw new Error("walletClient.account missing");

  const mintPrice = await readMintPriceWei(publicClient, campaign);
  const referrer = "0x0000000000000000000000000000000000000000" as Address;

  const mintHash = await walletClient.writeContract({
    address: campaign,
    abi: agentShareCampaignAbi,
    functionName: "mint",
    args: [agent.agentTypeId, referrer],
    value: mintPrice,
    chain: walletClient.chain,
    account,
  });
  const mintRc = await publicClient.waitForTransactionReceipt({ hash: mintHash });
  if (mintRc.status !== "success") throw new Error(`mint failed: ${mintHash}`);

  const { parseMintedTokenIdFromReceipt } = await import("./parse-minted.js");
  const tokenId = parseMintedTokenIdFromReceipt(mintRc, campaign, account.address);
  if (tokenId === null) throw new Error("Minted event not found in receipt");

  const transferHash = await walletClient.writeContract({
    address: campaign,
    abi: agentShareCampaignAbi,
    functionName: "safeTransferFrom",
    args: [account.address, recipient, tokenId],
    chain: walletClient.chain,
    account,
  });
  const trRc = await publicClient.waitForTransactionReceipt({ hash: transferHash });
  if (trRc.status !== "success") throw new Error(`transfer failed: ${transferHash}`);

  return { txHash: transferHash, tokenId };
}

export function createClients(
  chainId: number,
  rpcUrl: string,
  privateKey?: `0x${string}`,
): { publicClient: PublicClient; walletClient: WalletClient | null } {
  const chain = chainForId(chainId);
  const transport = http(rpcUrl);
  const publicClient = createPublicClient({ chain, transport }) as PublicClient;
  if (!privateKey) {
    return { publicClient, walletClient: null };
  }
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain,
    transport,
  }) as WalletClient;
  return { publicClient, walletClient };
}

export function resolveCampaign(env: EnvLike, chainId: number): Address | null {
  const a = resolveAgentShareCampaignAddress(chainId, env);
  return a && isAddress(a) ? a : null;
}

export { BASE_MAINNET_CHAIN_ID };
