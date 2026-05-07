import type { Address, Hex, PublicClient } from "viem";
import { bcdGenesisClaimAbi, resolveBcdGenesisClaimAddress, type EnvLike } from "@bc/contracts-sdk";

export type MerkleProof = readonly Hex[];

export async function hasGenesisClaimed(
  client: PublicClient,
  chainId: number,
  env: EnvLike,
  holder: Address,
): Promise<boolean> {
  const contract = resolveBcdGenesisClaimAddress(chainId, env);
  if (!contract) return false;
  return client.readContract({
    address: contract,
    abi: bcdGenesisClaimAbi,
    functionName: "claimed",
    args: [holder],
  });
}

/**
 * Merkle proofs are produced by the off-chain snapshot service.
 * Apps should fetch leaves/proofs from that service — this is a typed placeholder for shared imports.
 */
export function merkleProofFor(_holder: Address): MerkleProof | null {
  return null;
}
