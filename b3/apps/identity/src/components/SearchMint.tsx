"use client";

import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatEther } from "viem";
import {
  useAccount,
  useConnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { targetChainId } from "@/config/wagmi";
import { identityContractAddress, isContractConfigured } from "@/lib/chain/config";
import { cultureLayerIdentityAbi } from "@/lib/contracts/identityAbi";
import { tldLabelToId } from "@/lib/chain/tlds";
import { saveIdentityForWallet } from "@/lib/identityStorage";

const TLDS = [".culture", ".build", ".home", ".eco", ".capital", ".city"];

type HomeSearch = {
  name?: string;
  tld?: string;
};

function hasBrowserWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

function formatMintPrice(wei: bigint | undefined): string {
  if (wei === undefined) return "—";
  const eth = formatEther(wei);
  const trimmed = eth.replace(/\.?0+$/, "");
  return trimmed || "0";
}

export function SearchMint({ id }: { id?: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const search = useSearch({ strict: false }) as HomeSearch;
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting, error: connectError } =
    useConnect();
  const { switchChainAsync } = useSwitchChain();

  const [name, setName] = useState("laszlo");
  const [tld, setTld] = useState(".culture");
  const [debouncedHandle, setDebouncedHandle] = useState("laszlo");
  const [mintError, setMintError] = useState<string | null>(null);

  useEffect(() => {
    if (search.name) setName(search.name);
    if (search.tld && TLDS.includes(search.tld as (typeof TLDS)[number])) {
      setTld(search.tld);
    }
  }, [search.name, search.tld]);

  const clean =
    name.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "yourname";
  const tldLabel = tld.replace(/^\./, "");
  const fullIdentity = `${clean}.${tldLabel}`;
  const fullIdentityDisplay = `${clean}${tld}`;
  const tldId = tldLabelToId(tld);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedHandle(clean), 400);
    return () => clearTimeout(timer);
  }, [clean]);

  const canCheckAvailability =
    isContractConfigured &&
    debouncedHandle.length >= 3 &&
    debouncedHandle !== "yourname" &&
    tldId !== null;

  const { data: mintPriceWei } = useReadContract({
    address: identityContractAddress,
    abi: cultureLayerIdentityAbi,
    functionName: "mintPrice",
    query: { enabled: isContractConfigured },
  });

  const {
    data: isAvailable,
    isFetching: isCheckingAvailability,
    isError: availabilityError,
  } = useReadContract({
    address: identityContractAddress,
    abi: cultureLayerIdentityAbi,
    functionName: "isAvailable",
    args: [debouncedHandle, tldId ?? 0],
    query: { enabled: canCheckAvailability },
  });

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const isMinting = isWritePending || isConfirming || isConnecting;
  const wrongChain = isConnected && chainId !== targetChainId;

  const statusLine = useMemo(() => {
    if (!isContractConfigured) {
      return { label: "contract not configured", className: "text-muted-foreground" };
    }
    if (clean.length < 3 || clean === "yourname") {
      return { label: "enter at least 3 characters", className: "text-muted-foreground" };
    }
    if (isCheckingAvailability) {
      return { label: "checking…", className: "text-muted-foreground" };
    }
    if (availabilityError || isAvailable === undefined) {
      return { label: "unable to check", className: "text-muted-foreground" };
    }
    if (isAvailable) {
      return { label: "available", className: "text-primary" };
    }
    return { label: "taken", className: "text-destructive" };
  }, [
    availabilityError,
    clean,
    isAvailable,
    isCheckingAvailability,
    isContractConfigured,
  ]);

  useEffect(() => {
    if (!isConfirmed || !address) return;
    saveIdentityForWallet(address, fullIdentity);
    void queryClient.invalidateQueries({ queryKey: ["walletIdentities", address] });
    toast.success(`Minted ${fullIdentityDisplay}`, {
      description: "Your identity NFT is live on Base.",
      action: {
        label: "View profile",
        onClick: () => {
          void navigate({
            to: "/id/$name",
            params: { name: fullIdentity },
          });
        },
      },
    });
    resetWrite();
    void navigate({
      to: "/id/$name",
      params: { name: fullIdentity },
    }).then(() => {
      void router.invalidate();
    });
  }, [
    address,
    fullIdentity,
    fullIdentityDisplay,
    isConfirmed,
    navigate,
    queryClient,
    resetWrite,
    router,
  ]);

  async function handleMint() {
    setMintError(null);

    if (!isContractConfigured) {
      setMintError("Contract address is not configured.");
      return;
    }

    if (clean.length < 3) {
      setMintError("Name must be at least 3 characters.");
      return;
    }

    if (tldId === null) {
      setMintError("Invalid TLD.");
      return;
    }

    if (!isConnected || !address) {
      if (!hasBrowserWallet()) {
        setMintError("Install MetaMask or another browser wallet extension.");
        window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer");
        return;
      }
      const connector = connectors[0];
      if (!connector) {
        setMintError("No wallet connector available.");
        return;
      }
      connect({ connector, chainId: targetChainId });
      return;
    }

    if (wrongChain) {
      try {
        await switchChainAsync({ chainId: targetChainId });
      } catch {
        setMintError(`Switch to the configured Base network to mint.`);
      }
      return;
    }

    if (isAvailable === false) {
      setMintError("This identity is already taken.");
      return;
    }

    if (mintPriceWei === undefined) {
      setMintError("Could not load mint price.");
      return;
    }

    writeContract(
      {
        address: identityContractAddress,
        abi: cultureLayerIdentityAbi,
        functionName: "mint",
        args: [clean, tldId],
        value: mintPriceWei,
        chainId: targetChainId,
      },
      {
        onError: (err) => {
          const msg =
            err instanceof Error ? err.message : "Transaction failed.";
          setMintError(msg.length > 120 ? `${msg.slice(0, 120)}…` : msg);
        },
      },
    );
  }

  const mintDisabled =
    !isContractConfigured ||
    clean.length < 3 ||
    isMinting ||
    isAvailable === false ||
    (canCheckAvailability && isCheckingAvailability);

  return (
    <motion.div id={id} className="relative w-full max-w-3xl">
      {!isContractConfigured && import.meta.env.DEV && (
        <p className="mb-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-center font-mono text-[11px] text-gold">
          Set VITE_IDENTITY_CONTRACT_ADDRESS in .env.local to enable minting.
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="glass-strong animate-pulse-glow group relative overflow-hidden rounded-3xl p-2"
      >
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 px-5 py-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              claim
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="yourname"
              disabled={isMinting}
              className="w-full bg-transparent font-display text-2xl font-medium tracking-tight outline-none placeholder:text-muted-foreground/40 disabled:opacity-60 sm:text-3xl"
            />
            <select
              value={tld}
              onChange={(e) => setTld(e.target.value)}
              disabled={isMinting}
              className="cursor-pointer rounded-lg border border-border-strong bg-surface px-3 py-2 font-mono text-sm text-gold outline-none disabled:opacity-60"
            >
              {TLDS.map((t) => (
                <option key={t} value={t} className="bg-surface">
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => void handleMint()}
            disabled={mintDisabled}
            className="group/btn relative overflow-hidden rounded-2xl bg-foreground px-6 py-4 font-display text-sm font-semibold text-background transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="relative z-10">
              {isConnecting
                ? "Connecting…"
                : !isConnected
                ? "Connect wallet →"
                : wrongChain
                  ? "Switch network →"
                  : isMinting
                    ? "Minting…"
                    : "Mint identity →"}
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-6 flex flex-col items-center gap-2"
      >
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
          <span className="text-muted-foreground">live preview</span>
          <span className="text-foreground/80">·</span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
            {fullIdentityDisplay}
          </span>
          <span className={`${statusLine.className}`}>{statusLine.label}</span>
          {isContractConfigured && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {formatMintPrice(mintPriceWei)} ETH
              </span>
            </>
          )}
        </div>
        {(mintError || connectError) && (
          <p className="max-w-md text-center font-mono text-[11px] text-destructive">
            {mintError ??
              (connectError instanceof Error
                ? connectError.message
                : "Could not connect wallet.")}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
