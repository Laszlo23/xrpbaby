import type { Address } from "viem";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { BCC_ROOTS_STAKING_ABI } from "@/lib/roots-abi";

function parseAddress(raw: string | undefined): Address | undefined {
  const v = raw?.trim() ?? "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as Address;
}

function resolveStakingAddress(): Address | undefined {
  return (
    parseAddress(process.env.VITE_BCC_ROOTS_STAKING_ADDRESS) ||
    parseAddress(process.env.BCC_ROOTS_STAKING_ADDRESS)
  );
}

export async function walletHasRootsStakeProof(address: Address): Promise<{
  ok: boolean;
  error?: string;
  totalStakedWei?: bigint;
}> {
  const staking = resolveStakingAddress();
  if (!staking) {
    return { ok: false, error: "roots_staking_not_configured" };
  }

  const rpc =
    process.env.BCC_TREASURY_RPC_URL?.trim() ||
    process.env.BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org";

  const client = createPublicClient({ chain: base, transport: http(rpc) });

  let total = 0n;
  try {
    const poolCount = await client.readContract({
      address: staking,
      abi: BCC_ROOTS_STAKING_ABI,
      functionName: "poolCount",
    });
    for (let i = 0n; i < poolCount; i++) {
      const bal = await client.readContract({
        address: staking,
        abi: BCC_ROOTS_STAKING_ABI,
        functionName: "balanceOf",
        args: [i, address],
      });
      total += bal;
    }
  } catch {
    return { ok: false, error: "roots_stake_read_failed" };
  }

  if (total === 0n) {
    return { ok: false, error: "roots_stake_required" };
  }

  return { ok: true, totalStakedWei: total };
}
