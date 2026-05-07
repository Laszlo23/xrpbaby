import type { Address, PublicClient } from "viem";
import {
  resolveDistinctLegacyGenesisDistrictAddress,
  resolveGenesisVaultPassPhase0Address,
  resolveGenesisVaultPassPhase1Address,
  resolveGenesisVaultPassPhase2Address,
  type EnvLike,
} from "@bc/contracts-sdk";
import { erc721BalanceAbi } from "../abis/erc721-balance.js";

/** True if the wallet holds any configured Genesis Vault Pass tier (including distinct legacy Phase 0). */
export async function hasGenesisVaultPass(
  client: PublicClient,
  chainId: number,
  env: EnvLike,
  holder: Address,
): Promise<boolean> {
  const candidates = [
    resolveGenesisVaultPassPhase0Address(chainId, env),
    resolveGenesisVaultPassPhase1Address(chainId, env),
    resolveGenesisVaultPassPhase2Address(chainId, env),
    resolveDistinctLegacyGenesisDistrictAddress(chainId, env),
  ].filter(Boolean) as Address[];

  for (const addr of candidates) {
    const bal = await client.readContract({
      address: addr,
      abi: erc721BalanceAbi,
      functionName: "balanceOf",
      args: [holder],
    });
    if (bal > 0n) return true;
  }
  return false;
}
