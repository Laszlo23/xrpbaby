import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import type { Address } from "viem";
import { cultureChronicles1155Abi } from "@/lib/culture-chronicles-abi";
import {
  CHRONICLE_EDITION_COUNT,
  CHRONICLES,
  type CultureChronicle,
} from "@/content/culture-chronicles";
import { getCultureChroniclesAddress } from "@/lib/culture-chronicles-config";
import { CHRONICLE_FOUNDER_THRESHOLD } from "@/lib/culture-chronicles-perks";
import { getDefaultChain } from "@/lib/chains";

export type ChronicleProgress = {
  contract?: Address;
  ownedCount: number;
  isFounder: boolean;
  balances: Map<number, bigint>;
  ownedChapters: CultureChronicle[];
  isPending: boolean;
  hasSkipKey: boolean;
};

export function useChronicleProgress(): ChronicleProgress {
  const { address } = useAccount();
  const contract = getCultureChroniclesAddress();
  const chainId = getDefaultChain().id;
  const enabled = !!contract && !!address;

  const balanceContracts = useMemo(
    () =>
      CHRONICLES.map((ch) => ({
        chainId,
        address: contract!,
        abi: cultureChronicles1155Abi,
        functionName: "balanceOf" as const,
        args: [address!, BigInt(ch.editionId)] as const,
      })),
    [address, chainId, contract],
  );

  const { data: balanceResults, isPending: balancesPending } = useReadContracts({
    contracts: balanceContracts,
    query: { enabled },
  });

  const { data: hasSkipKey, isPending: skipPending } = useReadContract({
    chainId,
    address: contract,
    abi: cultureChronicles1155Abi,
    functionName: "hasSkipKey",
    args: address ? [address] : undefined,
    query: { enabled },
  });

  return useMemo(() => {
    const balances = new Map<number, bigint>();
    let ownedCount = 0;
    const ownedChapters: CultureChronicle[] = [];

    if (balanceResults) {
      CHRONICLES.forEach((ch, i) => {
        const raw = balanceResults[i]?.result;
        const bal = typeof raw === "bigint" ? raw : 0n;
        balances.set(ch.editionId, bal);
        if (bal > 0n) {
          ownedCount += 1;
          ownedChapters.push(ch);
        }
      });
    }

    return {
      contract,
      ownedCount,
      isFounder: ownedCount >= CHRONICLE_FOUNDER_THRESHOLD,
      balances,
      ownedChapters,
      isPending: enabled && (balancesPending || skipPending),
      hasSkipKey: hasSkipKey === true,
    };
  }, [balanceResults, balancesPending, contract, enabled, hasSkipKey, skipPending]);
}

export function canMintChapter(
  chapter: CultureChronicle,
  progress: ChronicleProgress,
): { ok: boolean; reason?: string } {
  if (chapter.editionId === 1) return { ok: true };
  if (progress.hasSkipKey) return { ok: true };
  const prior = progress.balances.get(chapter.editionId - 1) ?? 0n;
  if (prior > 0n) return { ok: true };
  const priorCh = CHRONICLES.find((c) => c.editionId === chapter.editionId - 1);
  return {
    ok: false,
    reason: priorCh
      ? `Mint chapter ${priorCh.editionId} first, or buy a Skip Key on chapter 1.`
      : "Complete the prior chapter first.",
  };
}

export function scarcityPercent(minted: bigint, max: bigint): number {
  if (max === 0n) return 100;
  return Number((minted * 100n) / max);
}

export function scarcityTone(percentMinted: number): "ok" | "warn" | "hot" {
  if (percentMinted >= 90) return "hot";
  if (percentMinted >= 70) return "warn";
  return "ok";
}
