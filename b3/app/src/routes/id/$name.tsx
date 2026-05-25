import { createFileRoute } from "@tanstack/react-router";

import { CultureNameProfile } from "@/components/identity/CultureNameProfile";
import { fetchCultureNameResolution } from "@/lib/identity/resolve-fn";
import { pageHead } from "@/lib/seo";
import { parseIdentityFullName } from "@/lib/identity/tlds";

export const Route = createFileRoute("/id/$name")({
  loader: async ({ params }) => {
    const resolved = await fetchCultureNameResolution({ data: { name: params.name } });
    return { resolved };
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
    return pageHead({
      title: `${title} — Culture name`,
      description: desc,
      path: `/id/${params.name}`,
    });
  },
  component: IdentityProfilePage,
});

function IdentityProfilePage() {
  const { name } = Route.useParams();
  const { resolved } = Route.useLoaderData();
  return <CultureNameProfile resolved={resolved} paramName={name} />;
}
