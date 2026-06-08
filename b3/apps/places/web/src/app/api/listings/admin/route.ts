import { isAddress } from "viem";
import { addVerificationEvent, adminUpdateListingStatus, getListingsForAdmin } from "@/lib/rwa/listing-db";
import type { ListingStatus } from "@/lib/rwa/listing-types";

export const dynamic = "force-dynamic";

const ADMIN_WALLETS = (process.env.PLACES_ADMIN_WALLETS ?? "")
  .split(",")
  .map((w) => w.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(wallet: string): boolean {
  if (ADMIN_WALLETS.length === 0 && process.env.NODE_ENV === "development") return true;
  return ADMIN_WALLETS.includes(wallet.toLowerCase());
}

export async function GET(req: Request) {
  const wallet = new URL(req.url).searchParams.get("wallet")?.trim();
  if (!wallet || !isAddress(wallet) || !isAdmin(wallet)) {
    return Response.json({ error: "unauthorized" }, { status: 403 });
  }
  const status = new URL(req.url).searchParams.get("status") as ListingStatus | null;
  const listings = await getListingsForAdmin(status ?? undefined);
  return Response.json({ listings });
}

export async function POST(req: Request) {
  let body: { wallet?: string; listingId?: string; action?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const wallet = body.wallet?.trim();
  if (!wallet || !isAddress(wallet) || !isAdmin(wallet)) {
    return Response.json({ error: "unauthorized" }, { status: 403 });
  }
  if (!body.listingId || !body.action) {
    return Response.json({ error: "listingId and action required" }, { status: 400 });
  }

  let status: ListingStatus;
  if (body.action === "approve") {
    status = "verified_mint_ready";
  } else if (body.action === "reject") {
    status = "rejected";
  } else if (body.action === "request_docs") {
    status = "submitted";
  } else {
    return Response.json({ error: "unknown action" }, { status: 400 });
  }

  const updated = await adminUpdateListingStatus(
    body.listingId,
    status,
    body.reason ? [body.reason] : [],
  );
  if (!updated) {
    return Response.json({ error: "listing not found" }, { status: 404 });
  }

  await addVerificationEvent(body.listingId, status, wallet, body.reason ?? body.action);
  return Response.json({ listing: updated });
}
