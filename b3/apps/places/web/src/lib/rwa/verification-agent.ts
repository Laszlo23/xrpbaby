import type { ListingMetadata } from "./listing-types";

export type VerificationResult = {
  pass: boolean;
  gaps: string[];
  confidence: number;
  needsHuman: boolean;
  summary?: string;
};

const REQUIRED_METADATA = ["title", "address", "city", "country", "valuationUsd"] as const;
const REQUIRED_DOCS = ["deed", "appraisal"] as const;

export function runPropertyVerification(input: {
  metadata: ListingMetadata;
  photoCount: number;
  documents: { docKind: string }[];
}): VerificationResult {
  const gaps: string[] = [];
  const { metadata, photoCount, documents } = input;

  for (const field of REQUIRED_METADATA) {
    const val = metadata[field];
    if (val === undefined || val === null || val === "") {
      gaps.push(`Missing required field: ${field}`);
    }
  }

  if (photoCount < 3) {
    gaps.push(`Upload at least 3 property photos (currently ${photoCount})`);
  }

  for (const doc of REQUIRED_DOCS) {
    if (!documents.some((d) => d.docKind === doc)) {
      gaps.push(`Missing document: ${doc}`);
    }
  }

  if (metadata.valuationUsd != null && metadata.valuationUsd > 5_000_000) {
    gaps.push("High-value asset — human compliance review required");
  }

  if (metadata.yieldPercent != null && metadata.yieldPercent > 15) {
    gaps.push("Yield above 15% — verify assumptions with issuer counsel");
  }

  if (metadata.address && metadata.city && metadata.country) {
    const addr = `${metadata.address} ${metadata.city}`.toLowerCase();
    if (addr.includes("test") || addr.includes("fake")) {
      gaps.push("Address metadata appears inconsistent — verify legal parcel ID");
    }
  }

  const highValue = (metadata.valuationUsd ?? 0) > 5_000_000;
  const needsHuman = gaps.some((g) => g.includes("human") || g.includes("counsel")) || highValue;
  const blockingGaps = gaps.filter((g) => !g.includes("human") && !g.includes("counsel"));

  const pass = blockingGaps.length === 0 && !needsHuman;
  const confidence = Math.max(0, Math.min(1, 1 - gaps.length * 0.12));

  const summary =
    gaps.length === 0
      ? "All required documents and metadata checks passed. Ready for mint preparation."
      : `Found ${gaps.length} item(s) to resolve before minting.`;

  return { pass, gaps, confidence, needsHuman: needsHuman || !pass, summary };
}

export function generatePropertySummary(metadata: ListingMetadata): string {
  const title = metadata.title ?? "Property";
  const loc = [metadata.city, metadata.country].filter(Boolean).join(", ");
  const val =
    metadata.valuationUsd != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
          metadata.valuationUsd,
        )
      : "undisclosed reference value";
  const yieldStr = metadata.yieldPercent != null ? `${metadata.yieldPercent}% illustrative yield` : "yield per issuer docs";
  return `**${title}** in ${loc || "the listed jurisdiction"} — reference valuation ${val}. Planning band: ${yieldStr}. Ownership is recorded on Base via restricted share tokens; this summary is informational only and not an offer.`;
}
