import { createFileRoute } from "@tanstack/react-router";

import { ProfileCredentialsPanel } from "@/components/credentials/ProfileCredentialsPanel";
import { ProfileMerchOrdersPanel } from "@/components/marketplace/ProfileMerchOrdersPanel";
import { fetchCredentialCatalogFn } from "@/lib/credentials/credential-catalog-fn";
import { fetchCultureNameResolution } from "@/lib/identity/resolve-fn";
import { fetchShowcaseEnrichmentFn } from "@/lib/profile/showcase-enrichment-fn";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/id/$name/credentials")({
  loader: async ({ params }) => {
    const [resolved, catalog] = await Promise.all([
      fetchCultureNameResolution({ data: { name: params.name } }),
      fetchCredentialCatalogFn(),
    ]);
    let enrichment = null;
    if (resolved.status === "claimed") {
      enrichment = await fetchShowcaseEnrichmentFn({ data: { name: params.name } });
    }
    return { resolved, catalog, enrichment };
  },
  head: ({ params }) =>
    pageHead({
      title: `${params.name} — Credentials`,
      description: "Earned and eligible credentials for this Culture ID.",
      path: `/id/${params.name}/credentials`,
    }),
  component: ProfileCredentialsPage,
});

function ProfileCredentialsPage() {
  const { resolved, catalog, enrichment } = Route.useLoaderData();

  if (resolved.status !== "claimed") {
    return (
      <div className="bc-surface min-h-dvh px-4 py-16 text-center text-zinc-400">
        <p>Credentials require a claimed Culture ID.</p>
      </div>
    );
  }

  return (
    <div className="bc-surface relative min-h-dvh pb-24 text-white">
      <div className="relative mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <h1 className="font-display text-3xl font-bold">{resolved.fullName}</h1>
        <p className="mt-2 text-sm text-zinc-400">Credentials & access unlocks</p>
        <div className="mt-8 flex flex-col gap-8">
          {resolved.owner ? <ProfileMerchOrdersPanel walletAddress={resolved.owner} /> : null}
          <ProfileCredentialsPanel
            resolved={resolved}
            catalog={catalog}
            web3bioCredentials={enrichment?.credentials ?? null}
          />
        </div>
      </div>
    </div>
  );
}
