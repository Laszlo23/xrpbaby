import { isAddress } from "viem";
import { createListing, getListingsByWallet, updateListing } from "@/lib/rwa/listing-db";
import type { ListingMetadata, OwnershipModel } from "@/lib/rwa/listing-types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const wallet = new URL(req.url).searchParams.get("wallet")?.trim();
  if (!wallet || !isAddress(wallet)) {
    return Response.json({ error: "wallet required" }, { status: 400 });
  }
  const listings = await getListingsByWallet(wallet);
  return Response.json({ listings });
}

export async function POST(req: Request) {
  let body: {
    wallet?: string;
    id?: string;
    metadata?: ListingMetadata;
    ownershipModel?: OwnershipModel;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const wallet = body.wallet?.trim();
  if (!wallet || !isAddress(wallet)) {
    return Response.json({ error: "valid wallet required" }, { status: 400 });
  }

  if (body.id) {
    const updated = await updateListing(body.id, wallet, {
      metadata: body.metadata,
      ownershipModel: body.ownershipModel,
    });
    if (!updated) {
      return Response.json({ error: "listing not found or not owned" }, { status: 404 });
    }
    return Response.json({ listing: updated });
  }

  const listing = await createListing(wallet, body.ownershipModel ?? "fractional");
  if (!listing) {
    return Response.json({ error: "database not configured" }, { status: 503 });
  }
  return Response.json({ listing }, { status: 201 });
}
