"use client";

import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import {
  useAccount,
  useConnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useCultureNetwork } from "@/contexts/CultureNetworkContext";
import { privyEnabled } from "@/lib/privy-env";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";
import {
  formatIdentityMintPrice,
  formatIdentityMintPriceNativeOnly,
} from "@/lib/identity/mint-price";
import { getIdentityNetwork } from "@/lib/identity/networks";
import { cultureGatewayPath } from "@/lib/identity/urls";
import { cultureLayerIdentityAbi } from "@/lib/identity/identityAbi";
import { cultureLayerIdentityV2Abi, erc20ApproveAbi } from "@/lib/identity/identityV2Abi";
import {
  BCC_DISCOUNT_LABEL,
  getBccTokenAddress,
  getIdentityV2ContractAddress,
} from "@/lib/bcc-config";
import { BCC_SYMBOL } from "@bc/bcc-kit";
import { saveIdentityForWallet } from "@/lib/identity/identityStorage";
import { IDENTITY_TLD_OPTIONS, tldLabelToId } from "@/lib/identity/tlds";

type PassSearch = {
  name?: string;
  tld?: string;
};

function hasBrowserWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

function SearchMintPrivyLogin({ onError }: { onError: (msg: string) => void }) {
  const { login, ready } = usePrivy();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <button
      type="button"
      disabled={!ready || !hydrated}
      onClick={() => {
        onError("");
        startTransition(() => {
          void login();
        });
      }}
      className="relative overflow-hidden rounded-2xl bg-[#C5FF41] px-6 py-4 font-display text-sm font-semibold text-black transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
    >
      Sign in for wallet →
    </button>
  );
}

export function SearchMint({ id }: { id?: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const search = useSearch({ strict: false }) as PassSearch;
  const { activeNetworkId, identity } = useCultureNetwork();
  const activeNet = getIdentityNetwork(activeNetworkId);
  const {
    identityChainId,
    identityContractAddress,
    isIdentityContractConfigured,
    identityChainLabel,
    nativeSymbol,
  } = identity;
  const contractAddress = identityContractAddress || undefined;
  const identityV2Address = getIdentityV2ContractAddress();
  const bccEnabled = activeNetworkId === "base" && Boolean(identityV2Address);
  const [payWithBcc, setPayWithBcc] = useState(false);
  const mintContractAddress = payWithBcc && identityV2Address ? identityV2Address : contractAddress;
  const privyAddress = usePrivyWalletAddress();
  const { address: wagmiAddress, isConnected: wagmiConnected, chainId } = useAccount();
  const address = privyEnabled ? (privyAddress ?? wagmiAddress) : wagmiAddress;
  const isConnected = privyEnabled ? Boolean(privyAddress ?? wagmiAddress) : wagmiConnected;
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { switchChainAsync } = useSwitchChain();

  const [name, setName] = useState("yourname");
  const [tld, setTld] = useState(".culture");
  const [debouncedHandle, setDebouncedHandle] = useState("yourname");
  const [mintError, setMintError] = useState<string | null>(null);

  useEffect(() => {
    if (search.name) setName(search.name);
    if (
      search.tld &&
      IDENTITY_TLD_OPTIONS.includes(search.tld as (typeof IDENTITY_TLD_OPTIONS)[number])
    ) {
      setTld(search.tld);
    }
  }, [search.name, search.tld]);

  const clean =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "yourname";
  const tldLabel = tld.replace(/^\./, "");
  const fullIdentity = `${clean}.${tldLabel}`;
  const fullIdentityDisplay = `${clean}${tld}`;
  const tldId = tldLabelToId(tld);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedHandle(clean), 400);
    return () => clearTimeout(timer);
  }, [clean]);

  const canCheckAvailability =
    isIdentityContractConfigured &&
    debouncedHandle.length >= 3 &&
    debouncedHandle !== "yourname" &&
    tldId !== null;

  const { data: mintPriceWei } = useReadContract({
    address: mintContractAddress,
    abi: payWithBcc ? cultureLayerIdentityV2Abi : cultureLayerIdentityAbi,
    functionName: payWithBcc ? "quoteMintWithBcc" : "mintPrice",
    chainId: identityChainId,
    query: { enabled: Boolean(mintContractAddress) && isIdentityContractConfigured },
  });

  const {
    data: isAvailable,
    isFetching: isCheckingAvailability,
    isError: availabilityError,
  } = useReadContract({
    address: contractAddress,
    abi: cultureLayerIdentityAbi,
    functionName: "isAvailable",
    args: [debouncedHandle, tldId ?? 0],
    chainId: identityChainId,
    query: { enabled: canCheckAvailability },
  });

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isMinting = isWritePending || isConfirming || isConnecting;
  const wrongChain = isConnected && chainId !== identityChainId;

  const statusLine = useMemo(() => {
    if (!isIdentityContractConfigured) {
      return { label: "contract not configured", className: "text-zinc-500" };
    }
    if (clean.length < 3 || clean === "yourname") {
      return { label: "enter at least 3 characters", className: "text-zinc-500" };
    }
    if (isCheckingAvailability) {
      return { label: "checking…", className: "text-zinc-500" };
    }
    if (availabilityError || isAvailable === undefined) {
      return { label: "unable to check", className: "text-zinc-500" };
    }
    if (isAvailable) {
      return { label: "available", className: "text-[#C5FF41]" };
    }
    return { label: "taken", className: "text-red-400" };
  }, [availabilityError, clean, isAvailable, isCheckingAvailability, isIdentityContractConfigured]);

  useEffect(() => {
    if (!isConfirmed || !address) return;
    saveIdentityForWallet(address, fullIdentity);
    void queryClient.invalidateQueries({ queryKey: ["walletIdentities", address] });
    toast.success(`Minted ${fullIdentityDisplay}`, {
      description: `Live at ${cultureGatewayPath(fullIdentity)}`,
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

    if (!isIdentityContractConfigured) {
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
      if (privyEnabled) {
        setMintError(`Sign in to create your ${activeNet.chainLabel} smart wallet, then mint.`);
        return;
      }
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
      connect({ connector, chainId: identityChainId });
      return;
    }

    if (wrongChain) {
      try {
        await switchChainAsync({ chainId: identityChainId });
      } catch {
        setMintError(`Switch to ${identityChainLabel} to mint your identity.`);
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

    if (!mintContractAddress) {
      setMintError(`${identityChainLabel} identity contract not configured yet.`);
      return;
    }

    if (payWithBcc && identityV2Address) {
      const bccToken = getBccTokenAddress();
      writeContract(
        {
          address: bccToken,
          abi: erc20ApproveAbi,
          functionName: "approve",
          args: [identityV2Address, mintPriceWei],
          chainId: identityChainId,
        },
        {
          onSuccess: () => {
            writeContract({
              address: identityV2Address,
              abi: cultureLayerIdentityV2Abi,
              functionName: "mintWithBcc",
              args: [clean, tldId],
              chainId: identityChainId,
            });
          },
          onError: (err) => {
            const msg = err instanceof Error ? err.message : `${BCC_SYMBOL} approve failed.`;
            setMintError(msg.length > 120 ? `${msg.slice(0, 120)}…` : msg);
          },
        },
      );
      return;
    }

    writeContract(
      {
        address: mintContractAddress,
        abi: cultureLayerIdentityAbi,
        functionName: "mint",
        args: [clean, tldId],
        value: mintPriceWei,
        chainId: identityChainId,
      },
      {
        onError: (err) => {
          const msg = err instanceof Error ? err.message : "Transaction failed.";
          setMintError(msg.length > 120 ? `${msg.slice(0, 120)}…` : msg);
        },
      },
    );
  }

  const [bnbCheck, setBnbCheck] = useState<{
    loading: boolean;
    available: boolean | null;
    name: string;
  }>({ loading: false, available: null, name: "" });

  const checkBnbName = useCallback(async () => {
    if (clean.length < 3) return;
    setBnbCheck({ loading: true, available: null, name: `${clean}.bnb` });
    try {
      const res = await fetch(`/api/identity/check-bnb?label=${encodeURIComponent(clean)}`);
      const data = (await res.json()) as { available?: boolean; name?: string };
      setBnbCheck({
        loading: false,
        available: data.available ?? null,
        name: data.name ?? `${clean}.bnb`,
      });
    } catch {
      setBnbCheck({ loading: false, available: null, name: `${clean}.bnb` });
    }
  }, [clean]);

  const mintDisabled =
    !isIdentityContractConfigured ||
    clean.length < 3 ||
    isMinting ||
    isAvailable === false ||
    (canCheckAvailability && isCheckingAvailability);

  return (
    <motion.div id={id} className="relative w-full max-w-3xl">
      {!isIdentityContractConfigured && import.meta.env.DEV && (
        <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center font-mono text-[11px] text-amber-200">
          Set VITE_IDENTITY_CONTRACT_ADDRESS (Base) or VITE_IDENTITY_BSC_CONTRACT_ADDRESS (BNB
          Chain) in .env.local to enable minting on {activeNet.chainLabel}.
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-md"
      >
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 px-5 py-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              claim
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="yourname"
              disabled={isMinting}
              className="w-full bg-transparent font-display text-2xl font-medium tracking-tight text-white outline-none placeholder:text-zinc-600 disabled:opacity-60 sm:text-3xl"
            />
            <select
              value={tld}
              onChange={(e) => setTld(e.target.value)}
              disabled={isMinting}
              className="cursor-pointer rounded-lg border border-white/15 bg-black/40 px-3 py-2 font-mono text-sm text-[#C5FF41] outline-none disabled:opacity-60"
            >
              {IDENTITY_TLD_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-black">
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {privyEnabled && !isConnected ? (
            <SearchMintPrivyLogin onError={setMintError} />
          ) : (
            <button
              type="button"
              onClick={() => void handleMint()}
              disabled={mintDisabled}
              className="relative overflow-hidden rounded-2xl bg-[#C5FF41] px-6 py-4 font-display text-sm font-semibold text-black transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
            </button>
          )}
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
          <span className="text-zinc-500">live preview</span>
          <span className="text-zinc-600">·</span>
          <span className="rounded-full border border-[#C5FF41]/30 bg-[#C5FF41]/10 px-3 py-1 text-[#C5FF41]">
            {fullIdentityDisplay}
          </span>
          <span className={statusLine.className}>{statusLine.label}</span>
          {isIdentityContractConfigured && (
            <>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">
                {payWithBcc
                  ? `${formatIdentityMintPriceNativeOnly(mintPriceWei, { networkId: "base", symbol: BCC_SYMBOL })} (${BCC_DISCOUNT_LABEL})`
                  : formatIdentityMintPrice(mintPriceWei, {
                      networkId: activeNetworkId,
                      symbol: nativeSymbol,
                    })}
              </span>
            </>
          )}
        </div>
        {bccEnabled ? (
          <button
            type="button"
            onClick={() => setPayWithBcc((v) => !v)}
            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
              payWithBcc
                ? "border-[#C5FF41]/50 bg-[#C5FF41]/15 text-[#C5FF41]"
                : "border-white/15 text-zinc-400 hover:text-white"
            }`}
          >
            {payWithBcc
              ? `Paying with ${BCC_SYMBOL}`
              : `Pay with ${BCC_SYMBOL} (${BCC_DISCOUNT_LABEL})`}
          </button>
        ) : null}
        {(mintError || connectError) && (
          <p className="max-w-md text-center font-mono text-[11px] text-red-400">
            {mintError ??
              (connectError instanceof Error ? connectError.message : "Could not connect wallet.")}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-8 rounded-2xl border border-[#F0B90B]/20 bg-[#F0B90B]/5 p-4 text-center"
      >
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#F0B90B]">
          BNB identity layer
        </p>
        <p className="mt-2 text-xs text-zinc-400">
          Culture Layer <span className="text-[#C5FF41]">.{tld.replace(".", "")}</span> on Base +
          optional <span className="text-[#F0B90B]">.bnb</span> via Space ID — linked to the same
          wallet on your profile.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={clean.length < 3 || bnbCheck.loading}
            onClick={() => void checkBnbName()}
            className="rounded-full border border-[#F0B90B]/40 px-4 py-2 text-xs font-semibold text-[#F0B90B] hover:bg-[#F0B90B]/10 disabled:opacity-40"
          >
            {bnbCheck.loading ? "Checking…" : `Check ${clean || "name"}.bnb`}
          </button>
          <a
            href="https://space.id/tld/1"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full bg-[#F0B90B] px-4 py-2 text-xs font-semibold text-black hover:opacity-90"
          >
            Register .bnb on Space ID →
          </a>
        </div>
        {bnbCheck.available === true ? (
          <p className="mt-2 text-xs text-[#F0B90B]">{bnbCheck.name} looks available on Space ID.</p>
        ) : bnbCheck.available === false ? (
          <p className="mt-2 text-xs text-zinc-400">{bnbCheck.name} is already registered.</p>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
