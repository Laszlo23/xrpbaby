"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "@/components/rwa/GlassCard";
import { VerificationStatusBadge } from "@/components/rwa/VerificationStatusBadge";
import type { ListingStatus, RwaListing, VerificationEvent } from "@/lib/rwa/listing-types";
import { MARKETPLACE_SUBTAGLINE } from "@/lib/featured-listings";

const PIPELINE: ListingStatus[] = [
  "submitted",
  "ai_review",
  "human_verification",
  "verified_mint_ready",
  "minted",
];

export default function ListingStatusPage() {
  const params = useParams();
  const id = typeof params.submissionId === "string" ? params.submissionId : "";
  const [listing, setListing] = useState<RwaListing | null>(null);
  const [events, setEvents] = useState<VerificationEvent[]>([]);

  const refresh = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/listings/${id}/status`);
    if (!res.ok) return;
    const data = (await res.json()) as { listing: RwaListing; events: VerificationEvent[] };
    setListing(data.listing);
    setEvents(data.events);
  }, [id]);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 8000);
    return () => clearInterval(t);
  }, [refresh]);

  if (!listing) {
    return <p className="animate-pulse text-zinc-500">Loading verification status…</p>;
  }

  const currentIdx = PIPELINE.indexOf(listing.status);

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      <header className="space-y-2">
        <p className="mono-label">Verification pipeline</p>
        <h1 className="font-display text-2xl font-bold text-white">
          {listing.metadata.title ?? "Your listing"}
        </h1>
        <VerificationStatusBadge status={listing.status} />
        <p className="text-sm text-zinc-500">{MARKETPLACE_SUBTAGLINE}</p>
      </header>

      <GlassCard strong className="p-6 space-y-6">
        <ol className="space-y-4">
          {PIPELINE.map((stage, i) => {
            const done = currentIdx > i || listing.status === "minted";
            const active = listing.status === stage;
            return (
              <li key={stage} className="flex items-start gap-4">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-bc-lime text-black"
                      : active
                        ? "bg-bc-cyan/20 text-bc-cyan ring-2 ring-bc-cyan"
                        : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <div>
                  <VerificationStatusBadge status={stage} />
                  {active && listing.gaps.length > 0 ? (
                    <ul className="mt-2 list-inside list-disc text-sm text-amber-200/90">
                      {listing.gaps.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        {listing.status === "verified_mint_ready" ? (
          <Link
            href={`/list/${id}/mint`}
            className="inline-flex rounded-full bg-bc-lime px-6 py-3 text-sm font-semibold text-black"
          >
            Mint on-chain →
          </Link>
        ) : null}

        {listing.status === "minted" && listing.propertyIdOnchain ? (
          <Link
            href={`/marketplace/${listing.propertyIdOnchain}`}
            className="inline-flex text-sm text-bc-cyan hover:underline"
          >
            View on marketplace →
          </Link>
        ) : null}
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-sm font-semibold text-white">Verification history</h2>
        <ul className="mt-4 space-y-3">
          {events.map((e) => (
            <li key={e.id} className="border-b border-white/5 pb-3 text-sm last:border-0">
              <span className="text-zinc-500">{new Date(e.createdAt).toLocaleString()}</span>
              <span className="mx-2 text-zinc-600">·</span>
              <span className="text-bc-cyan">{e.stage}</span>
              {e.notes ? <p className="mt-1 text-zinc-400">{e.notes}</p> : null}
            </li>
          ))}
        </ul>
      </GlassCard>

      {listing.gaps.length > 0 && listing.status !== "verified_mint_ready" ? (
        <GlassCard className="p-6">
          <h2 className="text-sm font-semibold text-white">What&apos;s missing?</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Return to the wizard to upload documents or fix metadata, then resubmit.
          </p>
          <Link href="/list" className="mt-3 inline-block text-sm text-bc-lime hover:underline">
            Edit listing →
          </Link>
        </GlassCard>
      ) : null}
    </div>
  );
}
