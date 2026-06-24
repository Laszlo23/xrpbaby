"use client";

import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCultureLogin } from "@/hooks/useCultureLogin";
import { useLinkedWalletAddress } from "@/hooks/useLinkedWalletAddress";
import {
  useAccount,
  useConnect,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  useSignMessage,
  useConfig,
} from "wagmi";
import { useCultureNetwork } from "@/contexts/CultureNetworkContext";
import { privyEnabled } from "@/lib/privy-env";
import {
  formatIdentityMintPrice,
  formatIdentityMintPriceNativeOnly,
  formatIdentityMintLadderUrgency,
} from "@/lib/identity/mint-price";
import {
  culturePointsForMint,
  ladderSummary,
  usdPriceForTotalMinted,
} from "@/lib/identity/mint-ladder";
import { handlePolicyUserMessage, validateHandleForPromoMint } from "@/lib/identity/handle-policy";
import {
  getStoredReferralCode,
  persistReferralCodeFromUrl,
} from "@/lib/identity/identity-referral-storage";
import { IDENTITY_LAUNCH_REFERRAL_CODE } from "@/lib/identity/referral-constants";
import { referralErrorMessage } from "@/lib/identity/referral-messages";
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
import { saveIdentityForWallet, setActiveIdentity } from "@/lib/identity/identityStorage";
import { buildPlatformSiweMessage } from "@/lib/platform-siwe";
import { pickInjectedConnector } from "@/lib/wallet-connectors";
import { formatWalletWriteError } from "@/lib/wallet-write-errors";
import {
  useWalletCultureIdentity,
  walletCultureIdentityQueryKey,
} from "@/hooks/useWalletCultureIdentity";
import { walletCultureIdentitiesQueryKey } from "@/hooks/useWalletCultureIdentities";
import { OwnedIdentityCard } from "@/components/identity/OwnedIdentityCard";
import { WalletIdentitiesPanel } from "@/components/identity/WalletIdentitiesPanel";
import { MintFlowGuide } from "@/components/identity/MintFlowGuide";
import { BaseMainnetMintBanner } from "@/components/identity/BaseMainnetMintBanner";
import { JoinConnectPanel } from "@/components/join/JoinConnectPanel";
import { IDENTITY_TLD_OPTIONS, tldLabelToId } from "@/lib/identity/tlds";
import { ensureFarcasterConnector } from "@/lib/farcaster-miniapp";

type PassSearch = {
  name?: string;
  tld?: string;
  manage?: string;
  ref?: string;
};

function hasBrowserWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function SearchMint({ id, hideGuide = false }: { id?: string; hideGuide?: boolean }) {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();
  const search = useSearch({ strict: false }) as PassSearch;
  const { isVerified: hasOwnedIdentity } = useWalletCultureIdentity();
  const { activeNetworkId, identity, switchToActiveChain } = useCultureNetwork();
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
  const { ready: privyReady, openPreferredLogin, authSurface } = useCultureLogin();
  const inFarcasterMiniApp = authSurface.kind === "farcaster";
  const linkedAddress = useLinkedWalletAddress();
  const { address: wagmiAddress, isConnected: wagmiConnected, chainId } = useAccount();
  const address = inFarcasterMiniApp ? wagmiAddress : linkedAddress;
  const isConnected = inFarcasterMiniApp ? wagmiConnected : Boolean(linkedAddress);
  const {
    connect,
    connectAsync,
    connectors,
    isPending: isConnecting,
    error: connectError,
  } = useConnect();
  const { signMessageAsync } = useSignMessage();

  const [name, setName] = useState("yourname");
  const [tld, setTld] = useState(".culture");
  const [debouncedHandle, setDebouncedHandle] = useState("yourname");
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralChecking, setReferralChecking] = useState(false);
  const [teamMintWallet, setTeamMintWallet] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const allowExtraMint = search.manage === "1" || teamMintWallet;
  const [mintError, setMintError] = useState<string | null>(null);
  const [bnbCheck, setBnbCheck] = useState<{
    loading: boolean;
    available: boolean | null;
    name: string;
  }>({ loading: false, available: null, name: "" });

  useEffect(() => {
    if (activeNetworkId !== "base") setPayWithBcc(false);
  }, [activeNetworkId]);

  useEffect(() => {
    if (search.name) setName(search.name);
    if (
      search.tld &&
      IDENTITY_TLD_OPTIONS.includes(search.tld as (typeof IDENTITY_TLD_OPTIONS)[number])
    ) {
      setTld(search.tld);
    }
    persistReferralCodeFromUrl(search.ref);
    const stored = getStoredReferralCode();
    if (stored) {
      setReferralCode(stored);
    } else if (search.ref?.trim()) {
      setReferralCode(search.ref.trim().toUpperCase());
    } else {
      setReferralCode(IDENTITY_LAUNCH_REFERRAL_CODE);
    }
  }, [search.name, search.tld, search.ref]);

  const clean =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "yourname";
  const tldLabel = tld.replace(/^\./, "");
  const fullIdentity = `${clean}.${tldLabel}`;
  const fullIdentityDisplay = `${clean}${tld}`;
  const tldId = tldLabelToId(tld);

  const handlePolicy = useMemo(
    () => validateHandleForPromoMint(clean, { teamWallet: teamMintWallet }),
    [clean, teamMintWallet],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedHandle(clean), 400);
    return () => clearTimeout(timer);
  }, [clean]);

  const validateReferral = useCallback(async () => {
    const code = referralCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      setReferralValid(null);
      setReferralError(null);
      return false;
    }
    if (!handlePolicy.ok) {
      setReferralValid(false);
      setReferralError(handlePolicyUserMessage(handlePolicy.error));
      return false;
    }
    if (!address) {
      setReferralValid(null);
      return false;
    }

    setReferralChecking(true);
    setReferralError(null);
    try {
      const params = new URLSearchParams({
        code,
        wallet: address,
        handle: clean,
      });
      const res = await fetch(`/api/identity/referral/validate?${params}`);
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        teamMintWallet?: boolean;
      };
      setTeamMintWallet(Boolean(data.teamMintWallet));
      if (data.ok) {
        setReferralValid(true);
        setReferralError(null);
        return true;
      }
      setReferralValid(false);
      setReferralError(referralErrorMessage(data.error ?? "code_invalid"));
      return false;
    } catch {
      setReferralValid(false);
      setReferralError("Could not validate referral code.");
      return false;
    } finally {
      setReferralChecking(false);
    }
  }, [address, clean, handlePolicy, referralCode]);

  useEffect(() => {
    if (!address) {
      setTeamMintWallet(false);
      return;
    }
    void fetch(`/api/identity/team-wallet?address=${encodeURIComponent(address)}`)
      .then((res) => res.json())
      .then((data: { teamMintWallet?: boolean }) => {
        setTeamMintWallet(Boolean(data.teamMintWallet));
      })
      .catch(() => setTeamMintWallet(false));
  }, [address]);

  useEffect(() => {
    if (teamMintWallet) {
      setReferralValid(null);
      setReferralError(null);
      return;
    }
    if (!address || referralCode.trim().length < 4 || !handlePolicy.ok) {
      setReferralValid(null);
      if (referralCode.trim().length >= 4 && !handlePolicy.ok) {
        setReferralError(handlePolicyUserMessage(handlePolicy.error));
      }
      return;
    }
    const timer = setTimeout(() => {
      void validateReferral();
    }, 500);
    return () => clearTimeout(timer);
  }, [address, clean, handlePolicy, referralCode, teamMintWallet, validateReferral]);

  const minHandleLen = teamMintWallet ? 1 : 3;
  const canCheckAvailability =
    isIdentityContractConfigured &&
    debouncedHandle.length >= minHandleLen &&
    debouncedHandle !== "yourname" &&
    tldId !== null;

  const { data: mintPriceWei } = useReadContract({
    address: mintContractAddress,
    abi: payWithBcc ? cultureLayerIdentityV2Abi : cultureLayerIdentityAbi,
    functionName: payWithBcc ? "quoteMintWithBcc" : "mintPrice",
    chainId: identityChainId,
    query: { enabled: Boolean(mintContractAddress) && isIdentityContractConfigured },
  });

  const { data: totalMintedRaw } = useReadContract({
    address: contractAddress,
    abi: cultureLayerIdentityAbi,
    functionName: "totalMinted",
    chainId: identityChainId,
    query: { enabled: Boolean(contractAddress) && isIdentityContractConfigured },
  });

  const totalMinted = totalMintedRaw !== undefined ? Number(totalMintedRaw) : undefined;
  const ladder = totalMinted !== undefined ? ladderSummary(totalMinted) : undefined;
  const tierUsd = totalMinted !== undefined ? usdPriceForTotalMinted(totalMinted) : undefined;
  const mintPointsPreview =
    totalMinted !== undefined ? culturePointsForMint(totalMinted) : undefined;

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
    error: writeErr,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isMinting = isWritePending || isConfirming || isConnecting || isSwitchingChain;
  const wrongChain = isConnected && typeof chainId === "number" && chainId !== identityChainId;

  useEffect(() => {
    if (!isConnected || !wrongChain || isWritePending || isConfirming || isConnecting) return;
    setIsSwitchingChain(true);
    void switchToActiveChain()
      .catch(() => {
        /* user can confirm manually via mint button */
      })
      .finally(() => {
        setIsSwitchingChain(false);
      });
  }, [
    activeNetworkId,
    identityChainId,
    isConnected,
    isConfirming,
    isConnecting,
    isWritePending,
    switchToActiveChain,
    wrongChain,
  ]);

  const statusLine = useMemo(() => {
    if (!isIdentityContractConfigured) {
      return { label: "Minting is not configured yet", className: "text-zinc-500" };
    }
    if (clean === "yourname" || clean.length < minHandleLen) {
      return {
        label: teamMintWallet
          ? "Enter your handle (1+ letters)"
          : "Use at least 4 letters in your name",
        className: "text-zinc-500",
      };
    }
    if (!handlePolicy.ok) {
      return {
        label: handlePolicyUserMessage(handlePolicy.error),
        className: handlePolicy.error === "reserved_team" ? "text-amber-400" : "text-zinc-500",
      };
    }
    if (isCheckingAvailability) {
      return { label: "Checking availability…", className: "text-zinc-500" };
    }
    if (availabilityError || isAvailable === undefined) {
      return { label: "Unable to check availability", className: "text-zinc-500" };
    }
    if (isAvailable) {
      return { label: "Available to mint", className: "text-[#C5FF41]" };
    }
    return { label: "Name is taken", className: "text-red-400" };
  }, [
    availabilityError,
    clean,
    handlePolicy,
    isAvailable,
    isCheckingAvailability,
    isIdentityContractConfigured,
    minHandleLen,
    teamMintWallet,
  ]);

  useEffect(() => {
    if (!isConfirmed || !address) return;

    async function afterMint() {
      saveIdentityForWallet(address!, fullIdentity);
      setActiveIdentity(address!, fullIdentity);
      void queryClient.invalidateQueries({ queryKey: walletCultureIdentityQueryKey(address) });
      void queryClient.invalidateQueries({ queryKey: walletCultureIdentitiesQueryKey(address) });

      try {
        const { prepared } = await buildPlatformSiweMessage(
          address! as `0x${string}`,
          identityChainId,
          `Sync Culture ID ${fullIdentity} after mint.`,
        );
        const signature = await signMessageAsync({ message: prepared });
        const syncRes = await fetch("/api/credentials/identity/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handle: fullIdentity,
            address,
            message: prepared,
            signature,
            referralCode: referralCode.trim().toUpperCase() || undefined,
          }),
        });
        if (syncRes.ok) {
          const syncData = (await syncRes.json()) as {
            pointsGranted?: number;
            pointsAlreadyCredited?: boolean;
          };
          if (syncData.pointsGranted && syncData.pointsGranted > 0) {
            toast.message(`+${syncData.pointsGranted} Culture Points for minting`);
          }
        }
      } catch {
        // Non-blocking — profile enrichment also upserts identity
      }

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
    }

    void afterMint();
  }, [
    address,
    fullIdentity,
    fullIdentityDisplay,
    identityChainId,
    isConfirmed,
    navigate,
    queryClient,
    referralCode,
    resetWrite,
    router,
    signMessageAsync,
  ]);

  async function handleMint() {
    setMintError(null);

    if (!isIdentityContractConfigured) {
      setMintError("Contract address is not configured.");
      return;
    }

    if (!handlePolicy.ok) {
      setMintError(handlePolicyUserMessage(handlePolicy.error));
      return;
    }

    const code = referralCode.trim().toUpperCase();
    if (!teamMintWallet) {
      if (!code || code.length < 4) {
        setMintError(`Enter an invite code to mint (e.g. ${IDENTITY_LAUNCH_REFERRAL_CODE}).`);
        return;
      }

      const referralOk = referralValid === true ? true : await validateReferral();
      if (!referralOk) {
        setMintError(referralError ?? "Referral code is invalid for this wallet.");
        return;
      }
    }

    if (tldId === null) {
      setMintError("Invalid TLD.");
      return;
    }

    if (!isConnected || !address) {
      if (inFarcasterMiniApp) {
        try {
          const connector =
            connectors.find((c) => c.id === "farcaster" || c.type === "farcasterMiniApp") ??
            ensureFarcasterConnector(wagmiConfig);
          await connectAsync({ connector, chainId: identityChainId });
        } catch {
          setMintError("Could not connect your Farcaster wallet — try again.");
        }
        return;
      }
      if (privyEnabled) {
        if (!privyReady) {
          setMintError("Wallet login is loading — try again in a moment.");
          return;
        }
        openPreferredLogin();
        return;
      }
      if (!hasBrowserWallet()) {
        setMintError("Install MetaMask or another browser wallet extension.");
        window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer");
        return;
      }
      const connector = pickInjectedConnector(connectors);
      if (!connector) {
        setMintError("No wallet connector available.");
        return;
      }
      connect({ connector, chainId: identityChainId });
      return;
    }

    if (wrongChain) {
      setIsSwitchingChain(true);
      try {
        await switchToActiveChain();
      } catch {
        setMintError(`Switch to ${identityChainLabel} in your wallet, then try again.`);
        return;
      } finally {
        setIsSwitchingChain(false);
      }
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

  const mintDisabled = useMemo(() => {
    if (!isIdentityContractConfigured || !handlePolicy.ok || isMinting) {
      return true;
    }
    if (teamMintWallet) {
      return isAvailable === false || (canCheckAvailability && isCheckingAvailability);
    }
    if (!isConnected) {
      return referralCode.trim().length < 4;
    }
    return (
      referralCode.trim().length < 4 ||
      referralValid === false ||
      referralChecking ||
      isAvailable === false ||
      (canCheckAvailability && isCheckingAvailability)
    );
  }, [
    canCheckAvailability,
    handlePolicy.ok,
    isAvailable,
    isCheckingAvailability,
    isConnected,
    isIdentityContractConfigured,
    isMinting,
    referralChecking,
    referralCode,
    referralValid,
    teamMintWallet,
  ]);

  const mintButtonLabel = useMemo(() => {
    if (isConnecting) return "Connecting…";
    if (!isConnected) {
      if (inFarcasterMiniApp) return "Connect Farcaster wallet →";
      return privyEnabled ? "Sign in for wallet →" : "Connect wallet →";
    }
    if (isSwitchingChain) return "Switching network…";
    if (wrongChain) return `Switch to ${identityChainLabel} →`;
    if (isMinting) return "Minting…";
    return "Mint identity →";
  }, [
    identityChainLabel,
    isConnected,
    isConnecting,
    isMinting,
    isSwitchingChain,
    inFarcasterMiniApp,
    privyEnabled,
    wrongChain,
  ]);

  async function copyInviteCode() {
    const code = referralCode.trim() || IDENTITY_LAUNCH_REFERRAL_CODE;
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Invite code copied");
    } catch {
      toast.error("Could not copy — select and copy manually");
    }
  }

  if (hasOwnedIdentity && !allowExtraMint) {
    return (
      <motion.div id={id} className="relative w-full max-w-3xl space-y-4">
        <WalletIdentitiesPanel showMintAnother />
        <OwnedIdentityCard allowExtraMint />
      </motion.div>
    );
  }

  return (
    <motion.div id={id} className="relative w-full max-w-3xl space-y-4 pb-24 sm:pb-0">
      {hasOwnedIdentity && allowExtraMint ? (
        <WalletIdentitiesPanel showMintAnother={false} compact />
      ) : null}
      {!isIdentityContractConfigured && import.meta.env.DEV && (
        <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center font-mono text-[11px] text-amber-200">
          Set VITE_IDENTITY_CONTRACT_ADDRESS (Base) or VITE_IDENTITY_BSC_CONTRACT_ADDRESS (BNB
          Chain) in .env.local to enable minting on {activeNet.chainLabel}.
        </p>
      )}

      {!hideGuide ? <MintFlowGuide mintsLeftInTier={ladder?.mintsLeftInTier} /> : null}

      {!isConnected ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-zinc-400">
            Connect with email, Farcaster, or a wallet on Base to mint your name.
          </p>
          <JoinConnectPanel />
        </div>
      ) : null}

      <BaseMainnetMintBanner
        wrongChain={wrongChain}
        isSwitchingChain={isSwitchingChain}
        onSwitch={() => {
          void switchToActiveChain("base");
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md sm:p-2"
      >
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="yourname"
            disabled={isMinting}
            aria-label="Culture name handle"
            className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 font-display text-2xl font-medium tracking-tight text-white outline-none placeholder:text-zinc-600 disabled:opacity-60 sm:bg-transparent sm:text-3xl sm:border-0"
          />
          <select
            value={tld}
            onChange={(e) => setTld(e.target.value)}
            disabled={isMinting}
            aria-label="Top-level domain"
            className="min-h-11 w-full cursor-pointer rounded-xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-sm text-[#C5FF41] outline-none disabled:opacity-60 sm:w-auto sm:min-w-[8rem]"
          >
            {IDENTITY_TLD_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-black">
                {opt}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void handleMint()}
            disabled={mintDisabled}
            data-testid="mint-primary-button"
            className="hidden min-h-11 w-full rounded-2xl bg-[#C5FF41] px-6 py-4 font-display text-sm font-semibold text-black transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex sm:items-center sm:justify-center"
          >
            <span className="relative z-10">{mintButtonLabel}</span>
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
      >
        {teamMintWallet ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--vault-gold)]">
              Team mint wallet
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Reserved 1–3 letter handles — no public invite code. Personal invite codes are shared
              directly by the team.
            </p>
          </>
        ) : (
          <>
            <label
              htmlFor="referral-code-input"
              className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
            >
              Invite code (required)
            </label>
            <p className="mt-1 text-sm text-zinc-500">
              Founding members use{" "}
              <strong className="text-[#C5FF41]">{IDENTITY_LAUNCH_REFERRAL_CODE}</strong>. One mint
              per wallet.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                id="referral-code-input"
                data-testid="referral-code-input"
                value={referralCode}
                onChange={(e) => {
                  setReferralCode(e.target.value.toUpperCase());
                  setReferralValid(null);
                }}
                onBlur={() => void validateReferral()}
                placeholder={IDENTITY_LAUNCH_REFERRAL_CODE}
                disabled={isMinting}
                className="min-h-11 w-full flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-sm uppercase tracking-wider text-white outline-none placeholder:text-zinc-600 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void copyInviteCode()}
                data-testid="copy-invite-code"
                className="min-h-11 shrink-0 rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-zinc-300 hover:border-[#C5FF41]/40 hover:text-white"
              >
                Copy
              </button>
            </div>
            <div className="mt-2 text-sm">
              {referralChecking ? (
                <span className="text-zinc-500">Checking invite code…</span>
              ) : referralValid === true ? (
                <span className="text-[#C5FF41]">
                  Code accepted — you&apos;re in the founding tier (+25 CP)
                </span>
              ) : referralValid === false ? (
                <span className="text-red-400">{referralError}</span>
              ) : (
                <span className="text-zinc-500">Names need 4+ letters. One mint per wallet.</span>
              )}
            </div>
            {referralValid === true ? (
              <p className="mt-2 text-xs text-zinc-500">
                Referrer earns locked BCC when you mint — claim opens when treasury funds the pool.
              </p>
            ) : null}
          </>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm"
      >
        <p className="font-medium text-zinc-300">{fullIdentityDisplay}</p>
        <p className={`mt-1 ${statusLine.className}`}>{statusLine.label}</p>
        {isIdentityContractConfigured ? (
          <p className="mt-2 text-zinc-400">
            {payWithBcc
              ? `${formatIdentityMintPriceNativeOnly(mintPriceWei, { networkId: "base", symbol: BCC_SYMBOL })} (${BCC_DISCOUNT_LABEL})`
              : formatIdentityMintPrice(mintPriceWei, {
                  networkId: activeNetworkId,
                  symbol: nativeSymbol,
                  totalMinted,
                  tierUsd,
                })}
            {ladder && tierUsd !== undefined && totalMinted !== undefined ? (
              <span className="text-[var(--base-blue)]">
                {" "}
                · {formatIdentityMintLadderUrgency(totalMinted)}
              </span>
            ) : null}
            {mintPointsPreview ? (
              <span className="text-emerald-400/90"> · +{mintPointsPreview} CP on mint</span>
            ) : null}
          </p>
        ) : null}
        {bccEnabled ? (
          <button
            type="button"
            onClick={() => setPayWithBcc((v) => !v)}
            className={`mt-3 min-h-11 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wider ${
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
        {(mintError || writeErr || connectError) && (
          <p className="mt-3 text-sm text-red-400">
            {mintError ??
              (writeErr
                ? formatWalletWriteError(writeErr)
                : connectError
                  ? formatWalletWriteError(connectError)
                  : null)}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
      >
        <details className="text-left">
          <summary className="cursor-pointer text-sm font-medium text-zinc-400 hover:text-zinc-200">
            Common questions
          </summary>
          <div className="mt-3 space-y-3 text-sm text-zinc-500">
            <div>
              <p className="font-medium text-zinc-300">Why Base?</p>
              <p className="mt-1">
                Culture IDs mint on Base Mainnet. You pay a small amount of ETH — not BNB — and get
                a transferable profile.
              </p>
            </div>
            <div>
              <p className="font-medium text-zinc-300">What is {IDENTITY_LAUNCH_REFERRAL_CODE}?</p>
              <p className="mt-1">
                The founding invite code. Enter it to mint at the lowest tier — about $0.07 for the
                first 77 minters.
              </p>
            </div>
            <div>
              <p className="font-medium text-zinc-300">Can I mint 3-letter names?</p>
              <p className="mt-1">
                No — 1–3 letter names are reserved for the team. Use 4+ letters for public minting.
              </p>
            </div>
          </div>
        </details>
        <details className="mt-3 text-left">
          <summary className="cursor-pointer text-sm font-medium text-zinc-400 hover:text-zinc-200">
            Optional — also register .bnb on BNB Chain
          </summary>
          <p className="mt-3 text-sm text-zinc-500">
            Your Culture ID mints on Base. Separately, you can check{" "}
            <span className="text-[#F0B90B]">.bnb</span> availability via Space ID and link it on
            your profile.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={clean.length < 3 || bnbCheck.loading}
              onClick={() => void checkBnbName()}
              className="min-h-11 rounded-full border border-[#F0B90B]/30 px-4 py-2 text-sm font-semibold text-[#F0B90B] hover:bg-[#F0B90B]/10 disabled:opacity-40"
            >
              {bnbCheck.loading ? "Checking…" : `Check ${clean || "name"}.bnb`}
            </button>
            <a
              href="https://space.id/tld/1"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-400 hover:text-white"
            >
              Space ID →
            </a>
          </div>
          {bnbCheck.available === true ? (
            <p className="mt-2 text-sm text-[#F0B90B]">
              {bnbCheck.name} looks available on Space ID.
            </p>
          ) : bnbCheck.available === false ? (
            <p className="mt-2 text-sm text-zinc-500">{bnbCheck.name} is already registered.</p>
          ) : null}
        </details>
      </motion.div>

      <div
        className="fixed inset-x-0 bottom-[calc(6.25rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-white/10 bg-black/95 px-4 py-3 backdrop-blur sm:hidden"
        data-testid="mint-sticky-bar"
      >
        <button
          type="button"
          onClick={() => void handleMint()}
          disabled={mintDisabled}
          className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-[#C5FF41] px-6 py-3 font-display text-sm font-semibold text-black disabled:opacity-50"
        >
          {mintButtonLabel}
          {isConnected &&
          isIdentityContractConfigured &&
          mintPriceWei !== undefined &&
          !wrongChain ? (
            <span className="ml-2 font-normal opacity-80">
              ·{" "}
              {formatIdentityMintPrice(mintPriceWei, {
                networkId: activeNetworkId,
                symbol: nativeSymbol,
                totalMinted,
                tierUsd,
              })}
            </span>
          ) : null}
        </button>
      </div>
    </motion.div>
  );
}
