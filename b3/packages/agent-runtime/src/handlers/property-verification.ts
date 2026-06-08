export type PropertyVerificationInput = {
  listingId: string;
  metadata: Record<string, unknown>;
  photoCount: number;
  documents: { docKind: string }[];
};

export type PropertyVerificationResult = {
  pass: boolean;
  gaps: string[];
  confidence: number;
  needsHuman: boolean;
  summary: string;
};

const REQUIRED_METADATA = ["title", "address", "city", "country", "valuationUsd"] as const;
const REQUIRED_DOCS = ["deed", "appraisal"] as const;

export function runPropertyVerificationHandler(
  input: PropertyVerificationInput,
): PropertyVerificationResult {
  const gaps: string[] = [];
  const metadata = input.metadata;

  for (const field of REQUIRED_METADATA) {
    const val = metadata[field];
    if (val === undefined || val === null || val === "") {
      gaps.push(`Missing required field: ${field}`);
    }
  }

  if (input.photoCount < 3) {
    gaps.push(`Upload at least 3 property photos (currently ${input.photoCount})`);
  }

  for (const doc of REQUIRED_DOCS) {
    if (!input.documents.some((d) => d.docKind === doc)) {
      gaps.push(`Missing document: ${doc}`);
    }
  }

  const valuation = Number(metadata.valuationUsd ?? 0);
  const highValue = valuation > 5_000_000;
  if (highValue) {
    gaps.push("High-value asset — human compliance review required");
  }

  const yieldPct = Number(metadata.yieldPercent ?? 0);
  if (yieldPct > 15) {
    gaps.push("Yield above 15% — verify assumptions with issuer counsel");
  }

  const needsHuman = gaps.some((g) => g.includes("human") || g.includes("counsel")) || highValue;
  const blockingGaps = gaps.filter((g) => !g.includes("human") && !g.includes("counsel"));
  const pass = blockingGaps.length === 0 && !needsHuman;
  const confidence = Math.max(0, Math.min(1, 1 - gaps.length * 0.12));

  return {
    pass,
    gaps,
    confidence,
    needsHuman: needsHuman || !pass,
    summary:
      gaps.length === 0
        ? "All required documents and metadata checks passed."
        : `Found ${gaps.length} item(s) to resolve.`,
  };
}
