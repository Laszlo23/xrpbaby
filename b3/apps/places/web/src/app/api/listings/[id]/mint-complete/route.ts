import { isAddress } from "viem";
import { addVerificationEvent, setListingMintResult } from "@/lib/rwa/listing-db";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: { wallet?: string; propertyId?: string; shareToken?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const wallet = body.wallet?.trim();
  if (!wallet || !isAddress(wallet) || !body.propertyId || !body.shareToken) {
    return Response.json({ error: "wallet, propertyId, shareToken required" }, { status: 400 });
  }

  await setListingMintResult(id, body.propertyId, body.shareToken);
  await addVerificationEvent(id, "minted", wallet, `propertyId=${body.propertyId}`);

  return Response.json({ ok: true, propertyId: body.propertyId });
}
