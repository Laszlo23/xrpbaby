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
import { genesisVaultPassAbi } from "@/lib/genesis-vault-pass-abi";
import {
  getGenesisVaultPassPhase0Address,
  getGenesisVaultPassPhase1Address,
  getGenesisVaultPassPhase2Address,
  type GenesisVaultTier,
} from "@/lib/genesis-district-config";
import { GENESIS_VAULT_PASS_TIER_PERKS } from "@/lib/genesis-vault-pass-perks";
import { getDefaultChain, getWagmiChainById } from "@/lib/chains";
import type { Address } from "viem";

type TierRowProps = {
  label: string;
  blurb: string;
  address: Address | undefined;
  accent: string;
  tier: GenesisVaultTier;
};

function TierMintCard({ label, blurb, address, accent, tier }: TierRowProps) {
  const { address: wallet, isConnected } = useAccount();
  const chainId = useChainId();
  const deployChain = getDefaultChain();
  const wrongChain = chainId !== deployChain.id;
  const { switchChain, isPending: switching } = useSwitchChain();

  const enabled = !!address;

  const { data: priceWei } = useReadContract({
    chainId: deployChain.id,
    address,
    abi: genesisVaultPassAbi,
    functionName: "mintPriceWei",
    query: { enabled },
  });

  const { data: maxSupply } = useReadContract({
    chainId: deployChain.id,
    address,
    abi: genesisVaultPassAbi,
    functionName: "maxSupply",
    query: { enabled },
  });

  const { data: totalSupply, refetch: refetchSupply } = useReadContract({
    chainId: deployChain.id,
    address,
    abi: genesisVaultPassAbi,
    functionName: "totalSupply",
    query: { enabled },
  });

  const { writeContract, data: txHash, error: writeErr, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!writeErr) return;
    toast.error(writeErr.message.slice(0, 160));
  }, [writeErr]);

  useEffect(() => {
    if (!isSuccess) return;
    toast.success(`${label} mint confirmed.`);
    void refetchSupply();
  }, [isSuccess, label, refetchSupply]);

  const soldOut =
    maxSupply !== undefined &&
    totalSupply !== undefined &&
    (totalSupply as bigint) >= (maxSupply as bigint);

  function onMint() {
    if (!address || !priceWei) return;
    if (wrongChain) {
      switchChain?.({ chainId: deployChain.id });
      return;
    }
    writeContract({
      chainId: deployChain.id,
      address,
      abi: genesisVaultPassAbi,
      functionName: "mint",
      args: [1n],
      value: priceWei as bigint,
    });
  }

  if (!address) {
    return (
      <div
        className={`rounded-2xl border border-white/[0.08] bg-black/30 p-5 ${accent} opacity-70`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
        <p className="mt-2 text-sm text-zinc-500">
          Contract not configured — set env after deploy.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-white/[0.1] bg-black/40 p-5 ${accent}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-1 font-heading text-base font-semibold text-white">{blurb}</p>
      <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-zinc-400">
        {GENESIS_VAULT_PASS_TIER_PERKS[tier].map((line) => (
          <li key={`${tier}-${line}`}>{line}</li>
        ))}
      </ul>
      <p className="mt-2 font-mono text-[11px] text-zinc-500">
        {soldOut
          ? "Sold out"
          : priceWei !== undefined
            ? `${formatEther(priceWei as bigint)} ETH`
            : "—"}{" "}
        ·{" "}
        {totalSupply !== undefined && maxSupply !== undefined
          ? `${String(totalSupply)}/${String(maxSupply)} minted`
          : "—"}
      </p>
      <Button
        type="button"
        className="mt-4 w-full rounded-full bg-[var(--b3-purple)] text-white hover:bg-[var(--base-blue-hover)] disabled:opacity-40"
        disabled={
          soldOut || !isConnected || !wallet || isPending || confirming || priceWei === undefined
        }
        onClick={onMint}
      >
        {wrongChain ? (
          `Switch to ${deployChain.name}`
        ) : soldOut ? (
          "Sold out"
        ) : isPending || confirming ? (
          <>
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
            Confirm…
          </>
        ) : (
          "Unlock access (mint)"
        )}
      </Button>
      {wrongChain ? (
        <button
          type="button"
          className="mt-2 w-full text-center text-[11px] text-zinc-500 underline"
          onClick={() => switchChain?.({ chainId: deployChain.id })}
          disabled={switching}
        >
          Wrong network — use {deployChain.name}
        </button>
      ) : null}
    </div>
  );
}

const ACCENT = {
  phase0: "ring-1 ring-emerald-500/20",
  phase1: "ring-1 ring-cyan-500/20",
  phase2: "ring-1 ring-violet-500/20",
} as const;

export function GenesisVaultMintPanel() {
  const p0 = getGenesisVaultPassPhase0Address();
  const p1 = getGenesisVaultPassPhase1Address();
  const p2 = getGenesisVaultPassPhase2Address();
  const any = p0 ?? p1 ?? p2;
  if (!any) {
    return (
      <section className="rounded-3xl border border-dashed border-white/[0.12] bg-white/[0.02] p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-600">
          Mint (after deploy)
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          Set <span className="font-mono text-zinc-400">VITE_GENESIS_VAULT_PASS_PHASE0</span>,{" "}
          <span className="font-mono text-zinc-400">…_PHASE1</span>,{" "}
          <span className="font-mono text-zinc-400">…_PHASE2</span> to your Base contracts, then
          refresh.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
        Unlock vault access
      </h2>
      <p className="text-sm text-zinc-500">
        Mint on{" "}
        <span className="text-zinc-300">{getWagmiChainById(getDefaultChain().id)?.name}</span>.
        Proceeds go to the contract treasury. Not financial advice.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <TierMintCard
          label="Phase 0 · Genesis"
          blurb="Ultra rare · earliest vault position"
          address={p0}
          accent={ACCENT.phase0}
          tier="phase0"
        />
        <TierMintCard
          label="Phase 1 · Early builder"
          blurb="Early access before public"
          address={p1}
          accent={ACCENT.phase1}
          tier="phase1"
        />
        <TierMintCard
          label="Phase 2 · Public access"
          blurb="Join before the vault fills"
          address={p2}
          accent={ACCENT.phase2}
          tier="phase2"
        />
      </div>
    </section>
  );
}
