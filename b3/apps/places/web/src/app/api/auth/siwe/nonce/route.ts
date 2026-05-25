import { randomBytes } from "crypto";
import { isAddress } from "viem";
import { saveNonce } from "@/lib/siwe-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (!address || !isAddress(address)) {
    return Response.json({ error: "valid address query param required" }, { status: 400 });
  }
  const nonce = randomBytes(16).toString("hex");
  await saveNonce(address, nonce);
  return Response.json({ nonce });
}
