import { isAddress } from "viem";
import {
  addVerificationEvent,
  getListingById,
  getListingDocuments,
  getListingMedia,
  setListingAiSummary,
  updateListing,
} from "@/lib/rwa/listing-db";
import { generatePropertySummary, runPropertyVerification } from "@/lib/rwa/verification-agent";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: { wallet?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const wallet = body.wallet?.trim();
  if (!wallet || !isAddress(wallet)) {
    return Response.json({ error: "valid wallet required" }, { status: 400 });
  }

  const listing = await getListingById(id);
  if (!listing || listing.wallet.toLowerCase() !== wallet.toLowerCase()) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  await updateListing(id, wallet, { status: "submitted" });
  await addVerificationEvent(id, "submitted", wallet, "Owner submitted listing for verification");

  await updateListing(id, wallet, { status: "ai_review" });
  await addVerificationEvent(id, "ai_review", "property-verification-agent", "AI review started");

  const [media, documents] = await Promise.all([getListingMedia(id), getListingDocuments(id)]);
  const result = runPropertyVerification({
    metadata: listing.metadata,
    photoCount: media.length,
    documents,
  });

  const summary = generatePropertySummary(listing.metadata);
  await setListingAiSummary(id, summary);

  let nextStatus: "verified_mint_ready" | "human_verification" | "submitted" = "human_verification";
  if (result.pass) {
    nextStatus = "verified_mint_ready";
  } else if (result.needsHuman) {
    nextStatus = "human_verification";
  }

  const updated = await updateListing(id, wallet, {
    status: nextStatus,
    gaps: result.gaps,
  });

  await addVerificationEvent(
    id,
    nextStatus,
    "property-verification-agent",
    result.summary ?? result.gaps.join("; "),
  );

  return Response.json({
    listing: updated,
    verification: result,
  });
}
