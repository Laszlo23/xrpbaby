import type { Address, PublicClient } from "viem";
import { agentShareCampaignAbi, resolveAgentShareCampaignAddress, type EnvLike } from "@bc/contracts-sdk";

/** Number of Agent Share NFTs held (campaign ERC-721 `balanceOf`). */
export async function getAgentShareCount(
  client: PublicClient,
  chainId: number,
  env: EnvLike,
  holder: Address,
): Promise<bigint> {
  const contract = resolveAgentShareCampaignAddress(chainId, env);
  if (!contract) return 0n;
  return client.readContract({
    address: contract,
    abi: agentShareCampaignAbi,
    functionName: "balanceOf",
    args: [holder],
  });
}
