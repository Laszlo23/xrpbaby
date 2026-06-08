import { isAddress } from "viem";
import { addWatchlist, getWatchlist, removeWatchlist } from "@/lib/rwa/listing-db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const wallet = new URL(req.url).searchParams.get("wallet")?.trim();
  if (!wallet || !isAddress(wallet)) {
    return Response.json({ error: "wallet required" }, { status: 400 });
  }
  const propertyIds = await getWatchlist(wallet);
  return Response.json({ propertyIds });
}

export async function POST(req: Request) {
  let body: { wallet?: string; propertyId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  const wallet = body.wallet?.trim();
  const propertyId = body.propertyId?.trim();
  if (!wallet || !isAddress(wallet) || !propertyId) {
    return Response.json({ error: "wallet and propertyId required" }, { status: 400 });
  }
  await addWatchlist(wallet, propertyId);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  let body: { wallet?: string; propertyId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  const wallet = body.wallet?.trim();
  const propertyId = body.propertyId?.trim();
  if (!wallet || !isAddress(wallet) || !propertyId) {
    return Response.json({ error: "wallet and propertyId required" }, { status: 400 });
  }
  await removeWatchlist(wallet, propertyId);
  return Response.json({ ok: true });
}
