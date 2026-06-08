import { getAiSummaryByPropertyId } from "@/lib/rwa/listing-db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const summary = await getAiSummaryByPropertyId(propertyId);
  return Response.json({ summary });
}
