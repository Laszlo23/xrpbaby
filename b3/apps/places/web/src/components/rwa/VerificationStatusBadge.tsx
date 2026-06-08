"use client";

import { STATUS_COLORS, STATUS_LABELS, type ListingStatus } from "@/lib/rwa/listing-types";

const STATUS_DOT: Record<ListingStatus, string> = {
  draft: "bg-zinc-500",
  submitted: "bg-yellow-400",
  ai_review: "bg-orange-400",
  human_verification: "bg-blue-400",
  verified_mint_ready: "bg-bc-lime",
  rejected: "bg-red-400",
  minted: "bg-emerald-400",
};

type Props = {
  status: ListingStatus;
  className?: string;
};

export function VerificationStatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bc-glass px-3 py-1 text-xs font-medium ${STATUS_COLORS[status]} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}
