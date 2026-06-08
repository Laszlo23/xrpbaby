import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { isAddress } from "viem";
import { addListingDocument, addListingMedia } from "@/lib/rwa/listing-db";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "listings");

export async function POST(req: Request) {
  const form = await req.formData();
  const listingId = String(form.get("listingId") ?? "").trim();
  const wallet = String(form.get("wallet") ?? "").trim();
  const kind = String(form.get("kind") ?? "photo").trim();
  const docKind = String(form.get("docKind") ?? "").trim();
  const file = form.get("file");

  if (!listingId || !wallet || !isAddress(wallet)) {
    return Response.json({ error: "listingId and wallet required" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return Response.json({ error: "file required" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const safeName = `${listingId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const diskPath = path.join(UPLOAD_DIR, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, buffer);

  const publicUrl = `/uploads/listings/${safeName}`;

  if (kind === "document" && docKind) {
    await addListingDocument(listingId, docKind, publicUrl);
  } else {
    const sortOrder = Number(form.get("sortOrder") ?? 0);
    await addListingMedia(listingId, publicUrl, sortOrder, kind);
  }

  return Response.json({ url: publicUrl });
}
