"use client";

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";
import { CultureBaseWalletButtons } from "@bc/culture-auth/react";

import { Button } from "@/components/ui/button";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { merchErrorMessage } from "@/lib/marketplace/merch-errors";
import { getMarketplaceChain } from "@/lib/chains";
import { explorerTxUrl } from "@/lib/explorer";

type MerchClaimPreview = {
  claimCode: string;
  dropSlug: string;
  dropTitle: string;
  imageUrl: string;
  unitNumber: number;
  editionCap: number;
  size: string;
  status: string;
  claimed: boolean;
  paid: boolean;
  x402TxHash?: string | null;
  paymentRail?: string;
  hasCultureIdentity?: boolean;
};

type ClaimResponse = {
  ok: boolean;
  alreadyClaimed?: boolean;
  credentialGranted?: boolean;
  pointsGranted?: number;
  holderChannelUrl?: string | null;
  error?: string;
};

type MerchClaimClientProps = {
  code: string;
  preview: MerchClaimPreview;
  cultureIdHandle?: string | null;
};

export function MerchClaimClient({ code, preview, cultureIdHandle }: MerchClaimClientProps) {
  const { address, isConnected } = useAccount();
  const { signSiwe, signing: siwePending } = usePointsSiweSign();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ClaimResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chain = getMarketplaceChain();
  const txUrl =
    preview.x402TxHash && preview.paymentRail === "x402"
      ? explorerTxUrl(chain.id, preview.x402TxHash)
      : null;

  async function handleClaim() {
    if (!address) return;
    setPending(true);
    setError(null);
    try {
      const siwe = await signSiwe();
      if (!siwe) {
        setError("Wallet signature required.");
        return;
      }

      const res = await fetch("/api/merch/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimCode: code,
          walletAddress: address,
          address: siwe.address,
          message: siwe.prepared,
          signature: siwe.signature,
        }),
      });
      const data = (await res.json()) as ClaimResponse;
      if (!data.ok) {
        setError(merchErrorMessage(data.error));
        return;
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Claim failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400">
        Edition <strong className="text-zinc-200">#{preview.unitNumber}</strong> of{" "}
        {preview.editionCap} · {preview.dropTitle} · size {preview.size}
      </p>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/50">
        <img src={preview.imageUrl} alt="" className="aspect-square w-full object-contain p-6" />
      </div>

      {txUrl ? (
        <p className="text-xs text-zinc-500">
          Paid via x402 USDC on Base —{" "}
          <a href={txUrl} target="_blank" rel="noreferrer" className="text-zinc-300 underline">
            view receipt
          </a>
        </p>
      ) : null}

      {!preview.paid ? (
        <p className="text-sm text-amber-200/90">This order is awaiting payment.</p>
      ) : preview.claimed && !result ? (
        <p className="text-sm text-zinc-400">This label was already claimed.</p>
      ) : null}

      {preview.paid && !preview.hasCultureIdentity && !result ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
          Mint your Culture ID first, then return here to claim your credential.{" "}
          <Link to="/pass" className="text-amber-200 underline-offset-2 hover:underline">
            Mint at /pass
          </Link>
        </div>
      ) : null}

      {!isConnected ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">Connect the wallet used at checkout.</p>
          <CultureBaseWalletButtons mode="wagmi" />
        </div>
      ) : (
        <Button
          type="button"
          className="w-full rounded-full"
          disabled={pending || siwePending || !preview.paid || (preview.claimed && !result)}
          onClick={() => void handleClaim()}
        >
          {pending || siwePending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Claiming…
            </>
          ) : (
            "Sign & claim credential + Culture Points"
          )}
        </Button>
      )}

      {error ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </p>
      ) : null}

      {result?.ok ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5 text-sm text-emerald-100">
          <p className="font-medium text-emerald-50">
            {result.alreadyClaimed ? "Already claimed" : "Credential issued"}
          </p>
          {result.pointsGranted ? (
            <p className="mt-2">+{result.pointsGranted} Culture Points</p>
          ) : null}
          {result.holderChannelUrl ? (
            <p className="mt-3">
              <a
                href={result.holderChannelUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-300 underline-offset-2 hover:underline"
              >
                Join merch-holder channel
              </a>
            </p>
          ) : null}
          {cultureIdHandle ? (
            <p className="mt-3">
              <Link
                to="/id/$name/credentials"
                params={{ name: cultureIdHandle }}
                className="text-emerald-300 underline-offset-2 hover:underline"
              >
                View credentials on your profile
              </Link>
            </p>
          ) : (
            <p className="mt-3">
              <Link to="/pass" className="text-emerald-300 underline-offset-2 hover:underline">
                Mint Culture ID to show credential on profile
              </Link>
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
