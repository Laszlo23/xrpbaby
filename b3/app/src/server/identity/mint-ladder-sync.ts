import {
  culturePointsForMint,
  ladderSummary,
  tierIndexForTotalMinted,
  usdPriceForTier,
  weiForUsdPrice,
  IDENTITY_MINT_DEFAULT_ETH_USD,
} from "@/lib/identity/mint-ladder";
import { IDENTITY_MAINNET_ADDRESS } from "@/lib/identity/mint-price";

export type SyncIdentityMintLadderResult = {
  ok: boolean;
  dryRun: boolean;
  totalMinted: number;
  tierIndex: number;
  targetUsd: number;
  currentWei?: string;
  targetWei: string;
  needsUpdate: boolean;
  txHash?: string;
  error?: string;
};

/** Compute target mintPrice wei for current on-chain supply. */
export function computeLadderMintPriceWei(
  totalMinted: number,
  ethUsd = IDENTITY_MINT_DEFAULT_ETH_USD,
): { tierIndex: number; targetUsd: number; targetWei: bigint } {
  const tierIndex = tierIndexForTotalMinted(totalMinted);
  const targetUsd = usdPriceForTier(tierIndex);
  const targetWei = weiForUsdPrice(targetUsd, ethUsd);
  return { tierIndex, targetUsd, targetWei };
}

export async function syncIdentityMintLadder(opts?: {
  dryRun?: boolean;
  ethUsd?: number;
}): Promise<SyncIdentityMintLadderResult> {
  const dryRun = opts?.dryRun ?? true;
  const ethUsd = opts?.ethUsd ?? Number(process.env.ETH_USD ?? IDENTITY_MINT_DEFAULT_ETH_USD);
  const contract = process.env.IDENTITY_CONTRACT_ADDRESS?.trim() || IDENTITY_MAINNET_ADDRESS;
  const rpc =
    process.env.BASE_RPC_URL?.trim() ||
    process.env.VITE_RPC_URL?.trim() ||
    "https://mainnet.base.org";

  try {
    const { createPublicClient, http } = await import("viem");
    const { base } = await import("viem/chains");
    const { cultureLayerIdentityAbi } = await import("@/lib/identity/identityAbi");

    const client = createPublicClient({
      chain: base,
      transport: http(rpc),
    });

    const [totalMintedRaw, currentWei] = await Promise.all([
      client.readContract({
        address: contract as `0x${string}`,
        abi: cultureLayerIdentityAbi,
        functionName: "totalMinted",
      }),
      client.readContract({
        address: contract as `0x${string}`,
        abi: cultureLayerIdentityAbi,
        functionName: "mintPrice",
      }),
    ]);

    const totalMinted = Number(totalMintedRaw);
    const { tierIndex, targetUsd, targetWei } = computeLadderMintPriceWei(totalMinted, ethUsd);
    const needsUpdate = currentWei !== targetWei;

    if (!needsUpdate || dryRun) {
      return {
        ok: true,
        dryRun,
        totalMinted,
        tierIndex,
        targetUsd,
        currentWei: currentWei.toString(),
        targetWei: targetWei.toString(),
        needsUpdate,
      };
    }

    return {
      ok: false,
      dryRun: false,
      totalMinted,
      tierIndex,
      targetUsd,
      currentWei: currentWei.toString(),
      targetWei: targetWei.toString(),
      needsUpdate: true,
      error: "on_chain_update_requires_keeper_script",
    };
  } catch (e) {
    return {
      ok: false,
      dryRun,
      totalMinted: 0,
      tierIndex: 0,
      targetUsd: usdPriceForTier(0),
      targetWei: "0",
      needsUpdate: false,
      error: e instanceof Error ? e.message : "ladder_sync_failed",
    };
  }
}

export { ladderSummary, culturePointsForMint };
