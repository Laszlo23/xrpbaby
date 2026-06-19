import { useEffect } from "react";
import { formatEther } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatWalletWriteError } from "@/lib/wallet-write-errors";
import { cultureChronicles1155Abi } from "@/lib/culture-chronicles-abi";
import {
  CHRONICLE_SKIP_KEY_PRICE_WEI,
  getCultureChroniclesAddress,
} from "@/lib/culture-chronicles-config";
import { getDefaultChain, getWagmiChainById } from "@/lib/chains";
import type { CultureChronicle } from "@/content/culture-chronicles";
import { CHRONICLE_TIER_PERKS } from "@/lib/culture-chronicles-perks";
import {
  canMintChapter,
  scarcityPercent,
  scarcityTone,
  useChronicleProgress,
} from "@/hooks/useChronicleProgress";

type Props = {
  chapter: CultureChronicle;
  showSkipKey?: boolean;
};

export function ChronicleMintPanel({ chapter, showSkipKey }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contract = getCultureChroniclesAddress();
  const deployChain = getDefaultChain();
  const wrongChain = chainId !== deployChain.id;
  const { switchChain, isPending: switching } = useSwitchChain();
  const progress = useChronicleProgress();

  const editionId = BigInt(chapter.editionId);
  const enabled = !!contract;

  const { data: activePrice } = useReadContract({
    chainId: deployChain.id,
    address: contract,
    abi: cultureChronicles1155Abi,
    functionName: "editionPriceWeiActive",
    args: [editionId],
    query: { enabled },
  });

  const { data: maxSupply } = useReadContract({
    chainId: deployChain.id,
    address: contract,
    abi: cultureChronicles1155Abi,
    functionName: "editionMaxSupply",
    args: [editionId],
    query: { enabled },
  });

  const { data: minted, refetch: refetchMinted } = useReadContract({
    chainId: deployChain.id,
    address: contract,
    abi: cultureChronicles1155Abi,
    functionName: "editionMinted",
    args: [editionId],
    query: { enabled },
  });

  const { data: canMintOnChain } = useReadContract({
    chainId: deployChain.id,
    address: contract,
    abi: cultureChronicles1155Abi,
    functionName: "canMintEdition",
    args: address && contract ? [address, editionId] : undefined,
    query: { enabled: enabled && !!address },
  });

  const { writeContract, data: txHash, error: writeErr, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!writeErr) return;
    toast.error(formatWalletWriteError(writeErr));
  }, [writeErr]);

  useEffect(() => {
    if (!isSuccess) return;
    toast.success(`Chapter ${chapter.editionId} mint confirmed.`);
    void refetchMinted();
  }, [chapter.editionId, isSuccess, refetchMinted]);

  const owned = (progress.balances.get(chapter.editionId) ?? 0n) > 0n;
  const soldOut =
    maxSupply !== undefined && minted !== undefined && (minted as bigint) >= (maxSupply as bigint);
  const remaining =
    maxSupply !== undefined && minted !== undefined
      ? (maxSupply as bigint) - (minted as bigint)
      : undefined;
  const pct =
    maxSupply !== undefined && minted !== undefined
      ? scarcityPercent(minted as bigint, maxSupply as bigint)
      : 0;
  const tone = scarcityTone(pct);
  const gate = canMintChapter(chapter, progress);
  const mintBlocked = !gate.ok && canMintOnChain === false;

  const scarcityClass =
    tone === "hot" ? "text-rose-400" : tone === "warn" ? "text-amber-300" : "text-emerald-400";

  function onMint() {
    if (!contract || activePrice === undefined) return;
    if (wrongChain) {
      switchChain?.({ chainId: deployChain.id });
      return;
    }
    writeContract({
      chainId: deployChain.id,
      address: contract,
      abi: cultureChronicles1155Abi,
      functionName: "mint",
      args: [editionId, 1n],
      value: activePrice as bigint,
    });
  }

  function onSkipKey() {
    if (!contract) return;
    if (wrongChain) {
      switchChain?.({ chainId: deployChain.id });
      return;
    }
    writeContract({
      chainId: deployChain.id,
      address: contract,
      abi: cultureChronicles1155Abi,
      functionName: "buySkipKey",
      value: CHRONICLE_SKIP_KEY_PRICE_WEI,
    });
  }

  if (!contract) {
    return (
      <section className="rounded-3xl border border-dashed border-white/[0.12] bg-white/[0.02] p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-600">
          Mint opening soon
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          Culture Chronicles deploys on Base shortly. Story chapters are readable now — mint to own
          and unlock perks.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/[0.1] bg-black/50 p-6 ring-1 ring-[var(--vault-gold)]/10">
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--vault-gold)]">
        Mint chapter · {chapter.tier}
      </p>
      <h3 className="mt-2 font-heading text-xl font-semibold text-white">{chapter.title}</h3>
      <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-zinc-400">
        {CHRONICLE_TIER_PERKS[chapter.tier].map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className={`mt-3 font-mono text-[11px] ${scarcityClass}`}>
        {soldOut
          ? "Sold out"
          : remaining !== undefined
            ? `${String(remaining)} remaining · ${pct}% minted`
            : "—"}{" "}
        · {activePrice !== undefined ? `${formatEther(activePrice as bigint)} ETH` : "—"}
        {owned ? " · You own this" : ""}
      </p>
      {!isConnected ? (
        <p className="mt-4 text-sm text-zinc-500">Connect wallet on Base to mint.</p>
      ) : (
        <>
          <Button
            type="button"
            className="mt-4 w-full rounded-full bg-[var(--b3-purple)] text-white hover:bg-[var(--base-blue-hover)] disabled:opacity-40"
            disabled={
              owned ||
              soldOut ||
              mintBlocked ||
              isPending ||
              confirming ||
              activePrice === undefined
            }
            onClick={onMint}
          >
            {wrongChain ? (
              `Switch to ${deployChain.name}`
            ) : owned ? (
              "Owned"
            ) : soldOut ? (
              "Sold out"
            ) : mintBlocked ? (
              "Locked — prior chapter required"
            ) : isPending || confirming ? (
              <>
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
                Confirm…
              </>
            ) : (
              `Mint chapter ${chapter.editionId}`
            )}
          </Button>
          {mintBlocked && gate.reason ? (
            <p className="mt-2 text-center text-[11px] text-zinc-500">{gate.reason}</p>
          ) : null}
          {showSkipKey && chapter.editionId === 1 && !progress.hasSkipKey ? (
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full rounded-full border-white/20 text-zinc-300"
              disabled={isPending || confirming}
              onClick={onSkipKey}
            >
              Skip Key · {formatEther(CHRONICLE_SKIP_KEY_PRICE_WEI)} ETH
            </Button>
          ) : null}
        </>
      )}
      {wrongChain ? (
        <button
          type="button"
          className="mt-2 w-full text-center text-[11px] text-zinc-500 underline"
          onClick={() => switchChain?.({ chainId: deployChain.id })}
          disabled={switching}
        >
          Wrong network — use {getWagmiChainById(deployChain.id)?.name ?? deployChain.name}
        </button>
      ) : null}
    </section>
  );
}
