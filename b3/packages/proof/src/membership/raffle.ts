import type { Address, PublicClient } from "viem";
import { raffleTicketCampaignAbi, resolveRaffleCampaignAddress, type EnvLike } from "@bc/contracts-sdk";

/** ERC-721-style balance for raffle ticket NFTs. */
export async function getRaffleTicketBalance(
  client: PublicClient,
  chainId: number,
  env: EnvLike,
  holder: Address,
): Promise<bigint> {
  const contract = resolveRaffleCampaignAddress(chainId, env);
  if (!contract) return 0n;
  return client.readContract({
    address: contract,
    abi: raffleTicketCampaignAbi,
    functionName: "balanceOf",
    args: [holder],
  });
}
