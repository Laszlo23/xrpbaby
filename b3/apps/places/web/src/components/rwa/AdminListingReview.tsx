"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { VerificationStatusBadge } from "@/components/rwa/VerificationStatusBadge";
import type { RwaListing } from "@/lib/rwa/listing-types";

export function AdminListingReview() {
  const { address } = useAccount();
  const [listings, setListings] = useState<RwaListing[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/admin?wallet=${address}&status=human_verification`);
      if (res.ok) {
        const data = (await res.json()) as { listings: RwaListing[] };
        setListings(data.listings);
      }
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function act(listingId: string, action: string, reason?: string) {
    if (!address) return;
    await fetch("/api/listings/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: address, listingId, action, reason }),
    });
    void refresh();
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bc-glass p-6">
      <h2 className="text-lg font-semibold text-white">Listing review queue</h2>
      <p className="text-sm text-zinc-500">Approve verified listings for on-chain mint.</p>
      {loading ? <p className="text-zinc-500">Loading…</p> : null}
      {listings.length === 0 ? (
        <p className="text-sm text-zinc-600">No listings awaiting human verification.</p>
      ) : (
        <ul className="space-y-4">
          {listings.map((l) => (
            <li key={l.id} className="rounded-xl border border-white/8 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-white">{l.metadata.title ?? l.id}</p>
                <VerificationStatusBadge status={l.status} />
              </div>
              <p className="mt-1 font-mono text-xs text-zinc-500">{l.wallet}</p>
              {l.gaps.length > 0 ? (
                <ul className="mt-2 list-inside list-disc text-xs text-amber-200/80">
                  {l.gaps.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void act(l.id, "approve")}
                  className="rounded-full bg-bc-lime px-4 py-1.5 text-xs font-semibold text-black"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void act(l.id, "reject", "Rejected by admin")}
                  className="rounded-full border border-red-400/40 px-4 py-1.5 text-xs text-red-300"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
