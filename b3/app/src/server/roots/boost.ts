import type { Address } from "viem";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import type { PrismaClient } from "@prisma/client";
import { ROOTS_POOLS, type RootsPoolId } from "@/lib/roots-config";
import {
  getGenesisVaultPassPhase0Address,
  getGenesisVaultPassPhase1Address,
  getGenesisVaultPassPhase2Address,
} from "@/lib/genesis-district-config";

const BUILDER_VOICE_GOLD_SLUG = "builder-voice-gold";

export type RootsBoostResult = {
  address: string;
  culturePoints: number;
  supporterTier: string;
  holdsGenesisPass: boolean;
  builderVoiceGold: boolean;
  eligiblePools: RootsPoolId[];
  boosts: Array<{
    poolId: RootsPoolId;
    name: string;
    eligible: boolean;
    reason: string;
  }>;
};

async function walletHoldsAnyGenesisPass(address: Address): Promise<boolean> {
  const contracts = [
    getGenesisVaultPassPhase0Address(),
    getGenesisVaultPassPhase1Address(),
    getGenesisVaultPassPhase2Address(),
  ].filter(Boolean) as Address[];

  if (contracts.length === 0) return false;

  const rpc =
    process.env.BCC_TREASURY_RPC_URL?.trim() ||
    process.env.BASE_RPC_URL?.trim() ||
    process.env.VITE_BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org";

  const client = createPublicClient({ chain: base, transport: http(rpc) });
  const erc721BalanceAbi = [
    {
      type: "function",
      name: "balanceOf",
      inputs: [{ name: "owner", type: "address" }],
      outputs: [{ type: "uint256" }],
      stateMutability: "view",
    },
  ] as const;

  for (const contract of contracts) {
    try {
      const bal = await client.readContract({
        address: contract,
        abi: erc721BalanceAbi,
        functionName: "balanceOf",
        args: [address],
      });
      if (bal > 0n) return true;
    } catch {
      // skip unreadable contract
    }
  }
  return false;
}

export async function resolveRootsBoost(
  prisma: PrismaClient,
  address: string,
): Promise<RootsBoostResult> {
  const normalized = address.toLowerCase();
  const wallet = await prisma.wallet.findUnique({
    where: { address: normalized },
    include: { member: true },
  });

  let culturePoints = 0;
  if (wallet) {
    const agg = await prisma.pointLedger.aggregate({
      where: { walletId: wallet.id },
      _sum: { delta: true },
    });
    culturePoints = agg._sum.delta ?? 0;
  }

  const supporterTier = wallet?.member?.supporterTier ?? "community";

  const builderVoiceGold = wallet
    ? Boolean(
        await prisma.pointLedger.findFirst({
          where: {
            walletId: wallet.id,
            taskSlug: BUILDER_VOICE_GOLD_SLUG,
            reason: "task_completion",
          },
        }),
      )
    : false;

  const holdsGenesisPass = await walletHoldsAnyGenesisPass(address as Address);

  const builderGroveEligible = culturePoints >= 500 || holdsGenesisPass || builderVoiceGold;
  const elderEligible = supporterTier === "founding" || supporterTier === "elder";

  const eligiblePools: RootsPoolId[] = [0];
  if (builderGroveEligible) eligiblePools.push(1);
  if (elderEligible) eligiblePools.push(2);

  const boosts = ROOTS_POOLS.map((pool) => {
    let eligible = false;
    let reason = "";
    if (pool.id === 0) {
      eligible = true;
      reason = "Open pool";
    } else if (pool.id === 1) {
      eligible = builderGroveEligible;
      reason = eligible
        ? "Builder boost active"
        : "Need 500+ Culture Points, genesis pass, or Builder Voice gold";
    } else if (pool.id === 2) {
      eligible = elderEligible;
      reason = eligible ? "Elder / founding tier" : "Founding or elder supporter tier required";
    }
    return { poolId: pool.id, name: pool.name, eligible, reason };
  });

  return {
    address: normalized,
    culturePoints,
    supporterTier,
    holdsGenesisPass,
    builderVoiceGold,
    eligiblePools,
    boosts,
  };
}
