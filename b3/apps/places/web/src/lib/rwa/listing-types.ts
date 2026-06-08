export const LISTING_STATUSES = [
  "draft",
  "submitted",
  "ai_review",
  "human_verification",
  "verified_mint_ready",
  "rejected",
  "minted",
] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number];

export type OwnershipModel = "full" | "fractional";

export type ListingMetadata = {
  title?: string;
  address?: string;
  city?: string;
  country?: string;
  propertyType?: string;
  sqm?: number;
  beds?: number;
  valuationUsd?: number;
  yieldPercent?: number;
  rentalNotes?: string;
  supplyCap?: number;
  sharePriceUsd?: number;
  mintProofNft?: boolean;
  lat?: number;
  lng?: number;
};

export type RwaListing = {
  id: string;
  wallet: string;
  status: ListingStatus;
  ownershipModel: OwnershipModel;
  metadata: ListingMetadata;
  propertyIdOnchain: string | null;
  shareTokenAddress: string | null;
  gaps: string[];
  createdAt: string;
  updatedAt: string;
};

export type VerificationEvent = {
  id: number;
  listingId: string;
  stage: string;
  actor: string;
  notes: string | null;
  createdAt: string;
};

export const STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  ai_review: "AI Review",
  human_verification: "Human Verification",
  verified_mint_ready: "Verified & Mint Ready",
  rejected: "Rejected",
  minted: "Minted",
};

export const STATUS_COLORS: Record<ListingStatus, string> = {
  draft: "text-zinc-400",
  submitted: "text-yellow-400",
  ai_review: "text-orange-400",
  human_verification: "text-blue-400",
  verified_mint_ready: "text-bc-lime",
  rejected: "text-red-400",
  minted: "text-emerald-400",
};
