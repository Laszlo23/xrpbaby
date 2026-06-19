import { createFileRoute } from "@tanstack/react-router";

import { CultureNameProfile } from "@/components/identity/CultureNameProfile";
import { fetchCultureNameResolution } from "@/lib/identity/resolve-fn";
import {
  FOUNDER_SHOWCASE_METRICS_LABEL,
  FOUNDER_SHOWCASE_TAGLINE,
  getFounderShowcaseConfig,
  isFounderShowcaseProfile,
} from "@/lib/profile/founder-showcase";
import { fetchShowcaseEnrichmentFn } from "@/lib/profile/showcase-enrichment-fn";
import { pageHead } from "@/lib/seo";
import { parseIdentityFullName } from "@/lib/identity/tlds";

export const Route = createFileRoute("/id/$name")({
  loader: async ({ params }) => {
    try {
      const resolved = await fetchCultureNameResolution({ data: { name: params.name } });
      let enrichment = null;
      if (resolved.status === "claimed") {
        enrichment = await fetchShowcaseEnrichmentFn({ data: { name: params.name } });
      }
      return { resolved, enrichment };
    } catch {
      return {
        resolved: {
          ok: true,
          configured: true,
          status: "invalid" as const,
          fullName: params.name,
        },
        enrichment: null,
      };
    }
  },
  head: ({ params, loaderData }) => {
    const resolved = loaderData?.resolved;
    const parsed = parseIdentityFullName(params.name);
    const title = resolved?.fullName ?? (parsed ? `${parsed.handle}.${parsed.tld}` : params.name);
    const desc =
      resolved?.status === "claimed"
        ? `Culture Layer name ${title} on Base — owner profile and share link.`
        : resolved?.status === "available"
          ? `${title} is available to mint on the Culture Layer.`
          : "Culture Layer identity profile.";
    const founder = isFounderShowcaseProfile(title);
    const founderConfig = founder ? getFounderShowcaseConfig(title) : null;
    return pageHead({
      title: `${title} — Culture name`,
      description: desc,
      path: `/id/${params.name}`,
      extraMeta: founder
        ? [
            { name: "bc:founder-showcase", content: "v2" },
            { name: "bc:founder-tagline", content: FOUNDER_SHOWCASE_TAGLINE },
            {
              name: "bc:founder-metrics",
              content: founderConfig?.heroHeadline
                ? `${founderConfig.heroHeadline} ${FOUNDER_SHOWCASE_METRICS_LABEL}`
                : FOUNDER_SHOWCASE_METRICS_LABEL,
            },
          ]
        : undefined,
    });
  },
  component: IdentityProfilePage,
});

function IdentityProfilePage() {
  const { name } = Route.useParams();
  const { resolved, enrichment } = Route.useLoaderData();
  return <CultureNameProfile resolved={resolved} paramName={name} enrichment={enrichment} />;
}
