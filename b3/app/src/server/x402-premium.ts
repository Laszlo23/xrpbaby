/**
 * Server-only x402 handler — imported dynamically from API route handlers only.
 */
import { homeDrops } from "@/content/home-drops";
import {
  handleX402Options,
  settleX402Get,
  x402CorsHeadersFor,
} from "@/server/x402-settle";

/** @deprecated use x402CorsHeadersFor */
export const premiumCorsHeadersFor = x402CorsHeadersFor;

export const handlePremiumOptions = handleX402Options;

function x402Price(): string {
  return (process.env.X402_PRICE?.trim() || "$0.01") as string;
}

/** Paid feed: public copy only — expand with Strapi when editorial workflow is ready. */
function buildPremiumDropAnnouncementsFeed() {
  return {
    ok: true as const,
    feed: "buildchain_premium_drop_teasers_v1",
    description:
      "x402-paid JSON feed of active vault drop titles and timing hints. Counsel-approved public copy only.",
    items: homeDrops.map((d) => ({
      slug: d.slug,
      title: d.title,
      rarity: d.rarity,
      endsAt: d.endsAt.toISOString(),
      assetLine: d.assetValueLabel,
    })),
    generatedAt: new Date().toISOString(),
  };
}

export async function handlePremiumX402Get(request: Request): Promise<Response> {
  try {
    return await settleX402Get(
      request,
      {
        price: x402Price(),
        description: "Premium BUILDCHAIN drop teaser feed (JSON, x402)",
      },
      buildPremiumDropAnnouncementsFeed,
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "x402 configuration or settlement failed";
    return Response.json({ error: message }, { status: 503, headers: x402CorsHeadersFor(request) });
  }
}
