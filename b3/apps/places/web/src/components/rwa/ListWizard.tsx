"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { WalletConnectControls } from "@/components/WalletConnectControls";
import { GlassCard } from "@/components/rwa/GlassCard";
import { REFERENCE_YIELD_DISCLAIMER } from "@/lib/demo-properties";
import type { ListingMetadata, OwnershipModel, RwaListing } from "@/lib/rwa/listing-types";
import { track } from "@/lib/analytics";

const STEPS = ["Connect", "Photos", "Details", "Valuation", "Documents", "Ownership"] as const;

export function ListWizard() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState(0);
  const [listing, setListing] = useState<RwaListing | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ListingMetadata>({});
  const [ownershipModel, setOwnershipModel] = useState<OwnershipModel>("fractional");
  const [photoCount, setPhotoCount] = useState(0);

  useEffect(() => {
    track("listing_started");
  }, []);

  const ensureListing = useCallback(async () => {
    if (!address) return null;
    if (listing) return listing;
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: address, ownershipModel }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { listing: RwaListing };
    setListing(data.listing);
    return data.listing;
  }, [address, listing, ownershipModel]);

  const saveDraft = useCallback(async () => {
    if (!address || !listing) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, id: listing.id, metadata, ownershipModel }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = (await res.json()) as { listing: RwaListing };
      setListing(data.listing);
    } catch {
      setError("Could not save draft");
    } finally {
      setBusy(false);
    }
  }, [address, listing, metadata, ownershipModel]);

  async function uploadFile(file: File, kind: "photo" | "document", docKind?: string) {
    const l = await ensureListing();
    if (!l || !address) return;
    const form = new FormData();
    form.append("listingId", l.id);
    form.append("wallet", address);
    form.append("file", file);
    form.append("kind", kind);
    if (docKind) form.append("docKind", docKind);
    form.append("sortOrder", String(photoCount));
    const res = await fetch("/api/listings/upload", { method: "POST", body: form });
    if (res.ok && kind === "photo") setPhotoCount((c) => c + 1);
  }

  async function submitListing() {
    if (!address || !listing) return;
    setBusy(true);
    setError(null);
    await saveDraft();
    try {
      const res = await fetch(`/api/listings/${listing.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address }),
      });
      if (!res.ok) throw new Error("Submit failed");
      window.location.href = `/list/${listing.id}`;
    } catch {
      setError("Submission failed — check database configuration");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      <header className="space-y-2 text-center">
        <p className="mono-label !text-bc-lime">Tokenize property</p>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">List your property</h1>
        <p className="text-sm text-zinc-500">
          OpenSea-simple onboarding — wallet or email via Privy. Not an offer to sell securities.
        </p>
      </header>

      <GlassCard strong className="p-4">
        <div className="mb-3 flex flex-wrap justify-center gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                i === step ? "bg-bc-cyan/20 text-bc-cyan ring-1 ring-bc-cyan/40" : "text-zinc-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-bc-cyan to-bc-lime transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </GlassCard>

      <GlassCard className="min-h-[320px] space-y-4 p-6 sm:p-8">
        {step === 0 && (
          <>
            <h2 className="text-xl font-semibold text-white">Connect your account</h2>
            <p className="text-sm text-zinc-400">
              Use email, social login, or an existing wallet. Your listing is tied to this identity.
            </p>
            <WalletConnectControls />
            {!isConnected && <p className="text-amber-400 text-sm">Connect to continue</p>}
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-white">Property photos</h2>
            <p className="text-sm text-zinc-400">Upload at least 3 exterior and interior photos.</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;
                void (async () => {
                  for (const f of Array.from(files)) await uploadFile(f, "photo");
                })();
              }}
              className="text-sm text-zinc-400"
            />
            <p className="text-xs text-zinc-500">{photoCount} photo(s) uploaded</p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-white">Address & details</h2>
            <div className="grid gap-3">
              {(
                [
                  ["title", "Property title"],
                  ["address", "Street address"],
                  ["city", "City"],
                  ["country", "Country"],
                  ["propertyType", "Type (e.g. residential)"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs text-zinc-500">
                  {label}
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    value={String(metadata[key] ?? "")}
                    onChange={(e) => setMetadata({ ...metadata, [key]: e.target.value })}
                  />
                </label>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-zinc-500">
                  Sq m
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    value={metadata.sqm ?? ""}
                    onChange={(e) => setMetadata({ ...metadata, sqm: Number(e.target.value) })}
                  />
                </label>
                <label className="block text-xs text-zinc-500">
                  Beds
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    value={metadata.beds ?? ""}
                    onChange={(e) => setMetadata({ ...metadata, beds: Number(e.target.value) })}
                  />
                </label>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold text-white">Valuation & yield</h2>
            <label className="block text-xs text-zinc-500">
              Reference valuation (USD)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                value={metadata.valuationUsd ?? ""}
                onChange={(e) => setMetadata({ ...metadata, valuationUsd: Number(e.target.value) })}
              />
            </label>
            <label className="block text-xs text-zinc-500">
              Illustrative yield %
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                value={metadata.yieldPercent ?? ""}
                onChange={(e) => setMetadata({ ...metadata, yieldPercent: Number(e.target.value) })}
              />
            </label>
            <label className="block text-xs text-zinc-500">
              Rental / investment notes
              <textarea
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                rows={3}
                value={metadata.rentalNotes ?? ""}
                onChange={(e) => setMetadata({ ...metadata, rentalNotes: e.target.value })}
              />
            </label>
            <p className="text-xs text-zinc-600">{REFERENCE_YIELD_DISCLAIMER}</p>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-xl font-semibold text-white">Ownership documents</h2>
            <p className="text-sm text-zinc-400">Upload deed and appraisal (PDF or image).</p>
            {(["deed", "appraisal", "rental_agreement"] as const).map((doc) => (
              <label key={doc} className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3 text-sm">
                <span className="capitalize text-zinc-300">{doc.replace("_", " ")}</span>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadFile(f, "document", doc);
                  }}
                  className="text-xs text-zinc-500"
                />
              </label>
            ))}
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-xl font-semibold text-white">Ownership model</h2>
            <div className="space-y-3">
              {(
                [
                  ["fractional", "Fractional shares", "ERC-20 restricted shares with compliance gating"],
                  ["full", "Full ownership", "Single cap — one owner record on-chain"],
                ] as const
              ).map(([val, title, desc]) => (
                <label
                  key={val}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                    ownershipModel === val ? "border-bc-lime/50 bg-bc-lime/5" : "border-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="ownership"
                    checked={ownershipModel === val}
                    onChange={() => setOwnershipModel(val)}
                  />
                  <div>
                    <p className="font-medium text-white">{title}</p>
                    <p className="text-xs text-zinc-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={metadata.mintProofNft ?? true}
                onChange={(e) => setMetadata({ ...metadata, mintProofNft: e.target.checked })}
              />
              Mint PropertyShareProof certificate NFT after shares
            </label>
            {ownershipModel === "fractional" && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-zinc-500">
                  Supply cap (shares)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                    value={metadata.supplyCap ?? 10000}
                    onChange={(e) => setMetadata({ ...metadata, supplyCap: Number(e.target.value) })}
                  />
                </label>
                <label className="block text-xs text-zinc-500">
                  Share price USD (ref.)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                    value={metadata.sharePriceUsd ?? 1000}
                    onChange={(e) => setMetadata({ ...metadata, sharePriceUsd: Number(e.target.value) })}
                  />
                </label>
              </div>
            )}
          </>
        )}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="text-sm text-zinc-500 hover:text-white disabled:opacity-30"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={step === 0 && !isConnected}
              onClick={async () => {
                if (step === 0) await ensureListing();
                if (step >= 2) await saveDraft();
                setStep((s) => s + 1);
              }}
              className="rounded-full bg-bc-cyan/20 px-6 py-2 text-sm font-medium text-bc-cyan ring-1 ring-bc-cyan/40"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={!isConnected || busy}
              onClick={() => void submitListing()}
              className="rounded-full bg-bc-lime px-6 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Submit for verification"}
            </button>
          )}
        </div>
      </GlassCard>

      <p className="text-center text-xs text-zinc-600">
        <Link href="/legal/risk" className="text-bc-cyan hover:underline">
          Legal & risks
        </Link>
      </p>
    </div>
  );
}
