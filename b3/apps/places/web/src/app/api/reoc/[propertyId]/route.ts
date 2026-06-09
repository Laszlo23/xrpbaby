import { buildReocMetadata } from "@/lib/reoc-metadata";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;

  let id: number;
  try {
    id = Number.parseInt(propertyId, 10);
    if (!Number.isFinite(id) || id < 1) throw new Error("invalid");
  } catch {
    return Response.json({ error: "invalid property id" }, { status: 400 });
  }

  const meta = buildReocMetadata(id);
  if (!meta) {
    return Response.json({ error: "property not found" }, { status: 404 });
  }

  return Response.json(meta, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
