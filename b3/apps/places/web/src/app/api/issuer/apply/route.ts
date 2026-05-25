import { getPool } from "@/lib/db";
import { isAddress } from "viem";

export const dynamic = "force-dynamic";

/**
 * Persists an issuer intake record. Sensitive fields should be encrypted client-side (AES-GCM);
 * this route only stores opaque ciphertext and public labels.
 */
export async function POST(req: Request) {
  let body: {
    wallet?: string;
    parcelLabel?: string;
    metadataUri?: string;
    encryptedBundle?: string;
    notes?: string;
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
  if (!body.parcelLabel?.trim()) {
    return Response.json({ error: "parcelLabel required" }, { status: 400 });
  }

  const pool = getPool();
  if (!pool) {
    return Response.json(
      {
        ok: false,
        message: "DATABASE_URL not configured; nothing persisted. Encrypted bundle for your records:",
        encryptedBundle: body.encryptedBundle ?? null,
      },
      { status: 202 }
    );
  }

  await pool.query(
    `INSERT INTO issuer_applications (applicant_wallet, parcel_label, metadata_uri, metadata_ciphertext, notes)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      wallet.toLowerCase(),
      body.parcelLabel.trim(),
      body.metadataUri ?? null,
      body.encryptedBundle ?? null,
      body.notes ?? null,
    ]
  );

  return Response.json({ ok: true });
}
