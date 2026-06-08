import { getListingById, getVerificationEvents } from "@/lib/rwa/listing-db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return Response.json({ error: "not found" }, { status: 404 });
  const events = await getVerificationEvents(id);
  return Response.json({ listing, events });
}
