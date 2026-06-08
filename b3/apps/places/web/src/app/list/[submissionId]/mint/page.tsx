"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { keccak256, stringToBytes, zeroAddress } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { GlassCard } from "@/components/rwa/GlassCard";
import { accessControlAbi, proofNftAbi, registryAbi, shareFactoryAbi } from "@/lib/contracts";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";
import { REGISTRAR_ROLE } from "@/lib/roles";
import type { RwaListing } from "@/lib/rwa/listing-types";
import { MARKETPLACE_TAGLINE } from "@/lib/featured-listings";
import { track } from "@/lib/analytics";

export default function ListingMintPage() {
  const params = useParams();
  const id = typeof params.submissionId === "string" ? params.submissionId : "";
  const { address, isConnected } = useAccount();
  const { registry, shareFactory, proofNft, explorer } = useProtocolAddresses();
  const [listing, setListing] = useState<RwaListing | null>(null);
  const [step, setStep] = useState<"idle" | "register" | "shares" | "proof" | "done">("idle");
  const [propertyId, setPropertyId] = useState<bigint | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const { data: isRegistrar } = useReadContract({
    address: registry,
    abi: accessControlAbi,
    functionName: "hasRole",
    args: address ? [REGISTRAR_ROLE, address] : undefined,
    query: { enabled: !!address && registry !== zeroAddress },
  });

  useEffect(() => {
    if (!id) return;
    void fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then((d: { listing: RwaListing }) => setListing(d.listing));
  }, [id]);

  const metadataHash = listing
    ? keccak256(stringToBytes(JSON.stringify(listing.metadata)))
    : undefined;
  const externalRef = listing
    ? keccak256(stringToBytes(`${listing.metadata.address ?? listing.id}-${listing.wallet}`))
    : undefined;

  const mintRegister = useCallback(() => {
    if (!listing || !address || !metadataHash || !externalRef || registry === zeroAddress) return;
    setStep("register");
    setError(null);
    writeContract({
      address: registry,
      abi: registryAbi,
      functionName: "registerProperty",
      args: [externalRef, metadataHash, listing.wallet as `0x${string}`],
    });
  }, [listing, address, metadataHash, externalRef, registry, writeContract]);

  const mintShares = useCallback(
    (pid: bigint) => {
      if (!listing || !address || shareFactory === zeroAddress) return;
      setStep("shares");
      const name = listing.metadata.title ?? `Property ${pid}`;
      const symbol = `BC${pid}`;
      const uri = `${typeof window !== "undefined" ? window.location.origin : ""}/api/nft/${pid}`;
      const supplyCap = BigInt(
        listing.ownershipModel === "full" ? 1 : (listing.metadata.supplyCap ?? 10000),
      );
      writeContract({
        address: shareFactory,
        abi: shareFactoryAbi,
        functionName: "createPropertyShare",
        args: [
          pid,
          name,
          symbol,
          uri,
          supplyCap,
          listing.wallet as `0x${string}`,
          0n,
          zeroAddress,
        ],
      });
    },
    [listing, address, shareFactory, writeContract],
  );

  const mintProof = useCallback(
    (pid: bigint) => {
      if (!listing?.metadata.mintProofNft || proofNft === zeroAddress || !address) return;
      setStep("proof");
      writeContract({
        address: proofNft,
        abi: proofNftAbi,
        functionName: "claim",
        args: [pid],
      });
    },
    [listing, proofNft, address, writeContract],
  );

  useEffect(() => {
    if (!confirmed || !txHash || !listing) return;
    void (async () => {
      if (step === "register") {
        const res = await fetch(`/api/listings/${id}`);
        const nextId = propertyId ?? 1n;
        setPropertyId(nextId);
        mintShares(nextId);
      } else if (step === "shares") {
        const pid = propertyId?.toString() ?? "1";
        setShareToken(shareFactory);
        await fetch(`/api/listings/${id}/mint-complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: address,
            propertyId: pid,
            shareToken: shareFactory,
          }),
        });
        track("mint_confirmed", { listingId: id, propertyId: pid });
        if (listing.metadata.mintProofNft && propertyId) mintProof(propertyId);
        else setStep("done");
      } else if (step === "proof") {
        setStep("done");
      }
    })();
  }, [confirmed, txHash, step, listing, id, address, propertyId, mintShares, mintProof, shareFactory]);

  if (!listing) return <p className="text-zinc-500">Loading…</p>;

  if (listing.status !== "verified_mint_ready" && listing.status !== "minted") {
    return (
      <p className="text-amber-400">
        Listing not ready to mint.{" "}
        <Link href={`/list/${id}`} className="underline">
          Check status
        </Link>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8 pb-16">
      <header>
        <p className="mono-label !text-bc-lime">Mint</p>
        <h1 className="font-display text-2xl font-bold text-white">{MARKETPLACE_TAGLINE}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          One confirmation flow: registry → share token → optional proof NFT.
        </p>
      </header>

      <GlassCard strong className="space-y-4 p-6">
        {!isConnected ? (
          <p className="text-amber-400">Connect wallet to mint.</p>
        ) : !isRegistrar ? (
          <div className="space-y-3 text-sm text-zinc-400">
            <p>
              On-chain <code className="text-zinc-300">registerProperty</code> requires{" "}
              <code className="text-bc-cyan">REGISTRAR_ROLE</code>. Your listing is approved — a registrar will
              complete mint, or connect an admin wallet.
            </p>
            <p className="text-xs text-zinc-600">
              Prepared: externalRef and metadataHash derived from your submission.
            </p>
          </div>
        ) : step === "done" || listing.status === "minted" ? (
          <div className="space-y-3">
            <p className="text-bc-lime font-medium">Mint complete.</p>
            {listing.propertyIdOnchain ? (
              <Link href={`/marketplace/${listing.propertyIdOnchain}`} className="text-bc-cyan hover:underline">
                View on marketplace →
              </Link>
            ) : null}
            {txHash ? (
              <a
                href={`${explorer}/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="block font-mono text-xs text-zinc-500 hover:text-bc-cyan"
              >
                Explorer ↗
              </a>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending || confirming}
            onClick={mintRegister}
            className="w-full rounded-full bg-bc-lime py-3 text-sm font-semibold text-black disabled:opacity-50"
          >
            {isPending || confirming ? "Confirm in wallet…" : "Mint property (1-click start)"}
          </button>
        )}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </GlassCard>
    </div>
  );
}
