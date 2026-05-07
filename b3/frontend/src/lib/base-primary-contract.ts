import { getContract, type ThirdwebContract } from "thirdweb";
import { thirdwebClient } from "@/lib/thirdweb-client";
import { thirdwebChainFromId } from "@/lib/thirdweb-chain";

import { base as wagmiBase } from "@/lib/chains";

function envAddr(key: string): `0x${string}` | undefined {
  const v = import.meta.env[key] as string | undefined;
  if (!v || !/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as `0x${string}`;
}

/**
 * Optional Base mainnet contract from `VITE_BASE_PRIMARY_CONTRACT_ADDRESS`.
 * Use with thirdweb `readContract`, extensions, or `sendTransaction` after preparing calls.
 * Chain is fixed to Base (8453); connect the wallet to Base before sending txs.
 */
export function getBasePrimaryContract(): ThirdwebContract | undefined {
  const address = envAddr("VITE_BASE_PRIMARY_CONTRACT_ADDRESS");
  if (!thirdwebClient || !address) return undefined;
  return getContract({
    client: thirdwebClient,
    chain: thirdwebChainFromId(wagmiBase.id),
    address,
  });
}
