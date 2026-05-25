import { createHmac, timingSafeEqual } from "node:crypto";
import { relaySetVerified } from "@/lib/compliance-relay";
import { syncCcidCredential } from "@/lib/ccid-credential";

export const dynamic = "force-dynamic";

type VeriffWebhookPayload = {
  status?: string;
  verification?: {
    id?: string;
    status?: string;
    vendorData?: string;
  };
};

function verifyVeriffSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.VERIFF_SHARED_SECRET?.trim();
  if (!secret || !signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signatureHeader, "hex"));
  } catch {
    return expected === signatureHeader;
  }
}

function parseWallet(vendorData: string | undefined): `0x${string}` | null {
  if (!vendorData) return null;
  const trimmed = vendorData.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return trimmed as `0x${string}`;
  return null;
}

/** Veriff decision webhook → CCID hook (when configured) + on-chain Verified status via relayer. */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hmac-signature") ?? req.headers.get("x-signature");

  if (process.env.VERIFF_SHARED_SECRET?.trim() && !verifyVeriffSignature(rawBody, signature)) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: VeriffWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as VeriffWebhookPayload;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const verificationStatus = payload.verification?.status ?? payload.status ?? "";
  const wallet = parseWallet(payload.verification?.vendorData);

  if (!wallet) {
    return Response.json({ error: "missing_wallet_vendor_data" }, { status: 400 });
  }

  const approved =
    verificationStatus === "approved" ||
    verificationStatus === "success" ||
    payload.status === "success";

  if (!approved) {
    await syncCcidCredential({
      wallet,
      verificationId: payload.verification?.id ?? "unknown",
      status: "declined",
      provider: "veriff",
    });
    return Response.json({ ok: true, action: "ignored", status: verificationStatus });
  }

  const ccid = await syncCcidCredential({
    wallet,
    verificationId: payload.verification?.id ?? "unknown",
    status: "approved",
    provider: "veriff",
  });

  const txHash = await relaySetVerified(wallet);

  return Response.json({
    ok: true,
    action: "verified",
    wallet,
    txHash,
    ccid: ccid.synced ? ccid.ccid : null,
    ccidReason: ccid.reason,
  });
}
