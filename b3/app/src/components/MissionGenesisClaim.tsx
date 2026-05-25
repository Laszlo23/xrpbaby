import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Loader2 } from "lucide-react";
import { formatUnits } from "viem";
import type { Address, Hex } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { erc20Abi } from "@/lib/bcd-abi";
import {
  BCD_SYMBOL,
  getBcdGenesisClaimAddress,
  getBcdGenesisEligibilityBase,
  getBcdGenesisMerkleDisplay,
  getBcdTokenAddress,
} from "@/lib/bcd-config";
import { bcdGenesisClaimAbi } from "@/lib/bcd-genesis-abi";
import { grantGenesisClaimQuest } from "@/lib/playerProgress";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/explorer";
import { getBcdChainShortLabel, getWagmiChainById, parseBcdChainId } from "@/lib/chains";
import { toast } from "sonner";

type EligibilityPayload = {
  allocation: string;
  proof: string[];
};

/** Load path for `/mission` genesis eligibility JSON */
type EligFetchStatus =
  | "idle"
  | "loading"
  | "not_configured"
  | "not_found"
  | "bad_shape"
  | "network"
  | "ready";

export function MissionGenesisClaim() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const bcdChainId = parseBcdChainId();
  const bcdChain = getWagmiChainById(bcdChainId);
  const wrongChain = isConnected && chainId !== bcdChainId;
  const { switchChain, isPending: switching } = useSwitchChain();

  const genesis = getBcdGenesisClaimAddress();
  const tokenAddr = getBcdTokenAddress();
  const meritDisplay = getBcdGenesisMerkleDisplay();

  const [eligibility, setEligibility] = useState<EligibilityPayload | null>(null);
  const [eligStatus, setEligStatus] = useState<EligFetchStatus>("idle");
  const [pasteJson, setPasteJson] = useState("");

  const enabled = !!genesis;

  const { data: alreadyClaimed, refetch: refetchClaimed } = useReadContract({
    chainId: bcdChainId,
    address: genesis,
    abi: bcdGenesisClaimAbi,
    functionName: "claimed",
    args: address ? [address] : undefined,
    query: { enabled: enabled && !!address },
  });

  const { data: claimFeeWei } = useReadContract({
    chainId: bcdChainId,
    address: genesis,
    abi: bcdGenesisClaimAbi,
    functionName: "claimFeeWei",
    query: { enabled },
  });

  const { data: endsAt } = useReadContract({
    chainId: bcdChainId,
    address: genesis,
    abi: bcdGenesisClaimAbi,
    functionName: "endsAt",
    query: { enabled },
  });

  const { data: onChainRoot } = useReadContract({
    chainId: bcdChainId,
    address: genesis,
    abi: bcdGenesisClaimAbi,
    functionName: "merkleRoot",
    query: { enabled },
  });

  const { data: genesisPaused } = useReadContract({
    chainId: bcdChainId,
    address: genesis,
    abi: bcdGenesisClaimAbi,
    functionName: "paused",
    query: { enabled },
  });

  const { data: bal, refetch: refetchBal } = useReadContract({
    chainId: bcdChainId,
    address: tokenAddr,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!tokenAddr && !!address },
  });

  const fetchEligibility = useCallback(async () => {
    const base = getBcdGenesisEligibilityBase();
    if (!address) {
      setEligibility(null);
      setEligStatus("idle");
      return;
    }
    if (!base?.trim()) {
      setEligibility(null);
      setEligStatus("not_configured");
      return;
    }
    setEligStatus("loading");
    try {
      const res = await fetch(`${base}/${address.toLowerCase()}.json`, { method: "GET" });
      if (res.status === 404) {
        setEligibility(null);
        setEligStatus("not_found");
        return;
      }
      if (!res.ok) {
        setEligibility(null);
        setEligStatus("network");
        return;
      }
      const json = (await res.json()) as EligibilityPayload;
      if (!json.allocation || !Array.isArray(json.proof)) {
        setEligibility(null);
        setEligStatus("bad_shape");
        return;
      }
      setEligibility(json);
      setEligStatus("ready");
    } catch {
      setEligibility(null);
      setEligStatus("network");
    }
  }, [address]);

  useEffect(() => {
    void fetchEligibility();
  }, [fetchEligibility]);

  const allocationBig = useMemo(() => {
    if (eligibility?.allocation) {
      try {
        return BigInt(eligibility.allocation);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [eligibility]);

  function applyPasteJson() {
    try {
      const json = JSON.parse(pasteJson) as EligibilityPayload;
      if (!json.allocation || !Array.isArray(json.proof)) {
        toast.error("JSON must include allocation (string) and proof (array of 0x…32 bytes).");
        return;
      }
      setEligibility(json);
      setEligStatus("ready");
      toast.success("Eligibility loaded from paste.");
    } catch {
      toast.error("Invalid JSON.");
    }
  }

  const { writeContract, data: txHash, error: writeErr, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!writeErr) return;
    toast.error(writeErr.message.slice(0, 140));
  }, [writeErr]);

  useEffect(() => {
    if (!isSuccess || !txHash || !address) return;
    void refetchClaimed();
    void refetchBal();
    grantGenesisClaimQuest(address);
    toast.success(
      <span>
        Genesis claim confirmed.{" "}
        <a
          href={explorerTxUrl(bcdChainId, txHash)}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Tx
        </a>
      </span>,
    );
  }, [isSuccess, txHash, address, bcdChainId, refetchClaimed, refetchBal]);

  function onClaim() {
    if (!genesis || !allocationBig || !eligibility) return;
    if (wrongChain) {
      switchChain?.({ chainId: bcdChainId });
      return;
    }
    const proof = eligibility.proof as Hex[];
    const fee = claimFeeWei ?? 0n;
    writeContract({
      chainId: bcdChainId,
      address: genesis,
      abi: bcdGenesisClaimAbi,
      functionName: "claim",
      args: [allocationBig, proof],
      value: fee,
    });
  }

  if (!enabled) {
    return (
      <div className="rounded-3xl border border-dashed border-white/[0.12] bg-white/[0.02] p-6 md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-600">
          Genesis claim
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          When the Building Culture Dollar contracts are deployed, set{" "}
          <span className="font-mono text-zinc-400">VITE_BCD_GENESIS_CLAIM_ADDRESS</span>,{" "}
          <span className="font-mono text-zinc-400">VITE_BCD_TOKEN_ADDRESS</span>, and{" "}
          <span className="font-mono text-zinc-400">VITE_BCD_CHAIN_ID</span> (e.g.{" "}
          <span className="font-mono text-zinc-400">8453</span> for Base) to enable the live claim
          card here.
        </p>
      </div>
    );
  }

  const ended =
    endsAt != null &&
    typeof endsAt === "bigint" &&
    endsAt > 0n &&
    Math.floor(Date.now() / 1000) > Number(endsAt);

  const canClaim =
    isConnected &&
    address &&
    !wrongChain &&
    !alreadyClaimed &&
    allocationBig !== undefined &&
    eligibility &&
    !genesisPaused &&
    !ended;

  const allocLabel = allocationBig !== undefined ? formatUnits(allocationBig, 18) : "—";

  const claimDisabledReason = (() => {
    if (!isConnected || !address) return "Connect your wallet.";
    if (wrongChain)
      return `Switch to ${bcdChain?.name ?? getBcdChainShortLabel()} (chain ${bcdChainId}) to claim.`;
    if (alreadyClaimed) return null;
    if (genesisPaused) return "Claim is paused on-chain.";
    if (ended) return "This claim window has ended.";
    if (
      eligStatus === "idle" &&
      getBcdGenesisEligibilityBase()?.trim() &&
      !alreadyClaimed &&
      !genesisPaused &&
      !ended
    ) {
      return "Loading whitelist eligibility…";
    }
    if (eligStatus === "loading") return "Loading whitelist eligibility…";
    if (eligStatus === "not_configured")
      return "No static eligibility URL is configured (set VITE_BCD_GENESIS_ELIGIBILITY_BASE) or paste operator JSON below.";
    if (eligStatus === "not_found")
      return "No whitelist file found for this wallet (404). If you have a proof, paste the eligibility JSON below.";
    if (eligStatus === "bad_shape")
      return "Eligibility file is invalid (needs allocation + proof[]). Ask ops or paste JSON below.";
    if (eligStatus === "network")
      return "Could not load eligibility (network or server error). Try again or paste JSON below.";
    if (!eligibility || allocationBig === undefined)
      return "Load an allocation and merkle proof to enable Claim.";
    return null;
  })();

  const primaryLabel = wrongChain
    ? `Switch to ${bcdChain?.name ?? getBcdChainShortLabel()}`
    : "Claim BCD";

  return (
    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-black/30 to-[rgb(0_40_100/0.22)] p-6 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-200/70">
        Genesis claim
      </p>
      <h3 className="mt-3 font-heading text-xl font-semibold text-white md:text-2xl">
        Mint your BCD allocation
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Whitelist wallets claim once via merkle proof. The app can load proofs from a static host (
        <span className="font-mono text-zinc-400">VITE_BCD_GENESIS_ELIGIBILITY_BASE</span>)
        {getBcdGenesisEligibilityBase() ? "" : " — not configured"} or you can paste operator JSON
        below.
      </p>

      <p className="mt-2 text-xs text-zinc-600">
        BCD contracts target{" "}
        <span className="font-mono text-zinc-400">
          {bcdChain?.name ?? `chain ${bcdChainId}`} ({bcdChainId})
        </span>
        . Your wallet is on{" "}
        <span className="font-mono text-zinc-400">{wrongChain ? chainId : bcdChainId}</span>
        {wrongChain ? " — switch network to claim." : "."}
      </p>

      {meritDisplay ? (
        <p className="mt-4 font-mono text-[10px] text-zinc-600 break-all">
          Published root (env): <span className="text-zinc-400">{meritDisplay}</span>
        </p>
      ) : null}

      {onChainRoot != null && typeof onChainRoot === "string" ? (
        <p className="mt-1 font-mono text-[10px] text-zinc-600 break-all">
          On-chain root: <span className="text-zinc-400">{onChainRoot}</span>
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">BCD genesis claim</p>
          <a
            href={explorerAddressUrl(bcdChainId, genesis as Address)}
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-start gap-2 break-all font-mono text-[11px] text-zinc-300 hover:text-white"
          >
            <span className="min-w-0 flex-1">{genesis}</span>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
          </a>
        </div>
        {tokenAddr ? (
          <div className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">{`${BCD_SYMBOL} token`}</p>
            <a
              href={explorerAddressUrl(bcdChainId, tokenAddr)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-start gap-2 break-all font-mono text-[11px] text-zinc-300 hover:text-white"
            >
              <span className="min-w-0 flex-1">{tokenAddr}</span>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
            </a>
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        {!isConnected ? (
          <p className="text-sm text-amber-200/90">
            Connect a wallet on the supported network to check status.
          </p>
        ) : alreadyClaimed ? (
          <p className="text-sm text-emerald">You already claimed genesis for this wallet.</p>
        ) : genesisPaused ? (
          <p className="text-sm text-amber-200/90">Claim is paused by the operator.</p>
        ) : ended ? (
          <p className="text-sm text-zinc-500">This claim window has ended.</p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">
              Allocation (from proof)
            </p>
            <p className="mt-1 font-mono text-lg text-zinc-100">
              {allocLabel} {BCD_SYMBOL}
            </p>
            {eligStatus === "loading" ? (
              <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Loading eligibility…
              </p>
            ) : null}
            {eligStatus === "not_found" && isConnected && address && !alreadyClaimed ? (
              <p className="mt-2 text-xs text-zinc-500">
                No file at whitelist URL for this address.
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">
              Claim fee (native)
            </p>
            <p className="mt-1 font-mono text-lg text-zinc-100">
              {claimFeeWei != null ? formatUnits(claimFeeWei as bigint, 18) : "—"} ETH
            </p>
            <p className="mt-2 text-[11px] text-zinc-600">Fees route to treasury on-chain.</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-zinc-500">Paste eligibility JSON (operator / testing)</p>
          <Input
            value={pasteJson}
            onChange={(e) => setPasteJson(e.target.value)}
            placeholder='{"allocation":"100000000000000000000","proof":["0x..."]}'
            className="font-mono text-xs"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="rounded-full"
            onClick={applyPasteJson}
          >
            Apply JSON
          </Button>
        </div>

        {claimDisabledReason && !alreadyClaimed && !genesisPaused && !ended ? (
          <p className="text-sm text-amber-200/85">{claimDisabledReason}</p>
        ) : null}

        <Button
          type="button"
          disabled={(!canClaim && !wrongChain) || isPending || confirming || switching}
          onClick={onClaim}
          className="w-full rounded-full bg-[var(--b3-purple)] py-6 text-white hover:bg-[var(--base-blue-hover)] sm:w-auto sm:px-10"
        >
          {isPending || confirming || switching ? (
            <>
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
              {switching ? "Switching…" : confirming ? "Confirming…" : "Wallet…"}
            </>
          ) : (
            primaryLabel
          )}
        </Button>

        {tokenAddr && bal != null ? (
          <p className="text-xs text-zinc-600">
            Current {BCD_SYMBOL} balance:{" "}
            <span className="font-mono text-zinc-400">{formatUnits(bal as bigint, 18)}</span>
          </p>
        ) : null}

        <p className="text-[11px] leading-relaxed text-zinc-600">
          Genesis is not investment advice and may have regulatory implications in your
          jurisdiction—see{" "}
          <Link to="/faq" className="text-zinc-400 underline-offset-2 hover:text-white">
            FAQ
          </Link>
          . Raffle tickets may still settle in native gas token until a BCD-accepting raffle ships.
        </p>
      </div>
    </div>
  );
}
