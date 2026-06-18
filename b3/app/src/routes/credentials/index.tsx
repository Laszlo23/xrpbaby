import { createFileRoute, Link } from "@tanstack/react-router";

import { CredentialCard } from "@/components/credentials/CredentialCard";
import { CredentialsXrplLinkSection } from "@/components/credentials/CredentialsXrplLinkSection";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { fetchCredentialCatalogFn } from "@/lib/credentials/credential-catalog-fn";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/credentials/")({
  head: () =>
    pageHead({
      title: "Credential Center — Building Culture Trust Layer",
      description:
        "Earn verifiable credentials for contributions, leadership, human verification, agents, and projects.",
      path: "/credentials",
      keywords: ["credentials", "Culture ID", "trust layer", "Building Culture"],
    }),
  loader: async () => {
    const catalog = await fetchCredentialCatalogFn();
    return { catalog };
  },
  component: CredentialsPage,
});

function CredentialsPage() {
  const { catalog } = Route.useLoaderData();

  return (
    <MarketingShell
      eyebrow="Credential Center"
      tone="lime"
      heroSize="compact"
      title="Verifiable proof you can show"
      subtitle="Six credential types power the Building Culture trust layer. Earn them through real contributions — display them on your Culture ID profile."
      actions={
        <>
          <Button className="rounded-full" asChild>
            <Link to="/pass">Claim Culture ID</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/credentials/leaderboard">Leaderboard</Link>
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-12">
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {catalog.map((item) => (
            <CredentialCard
              key={item.slug}
              slug={item.slug}
              name={item.name}
              description={item.description}
              purpose={item.purpose}
              unlocks={item.unlocks}
              earnSummary={item.earnSummary}
              icon={item.icon}
              accent={item.accent}
              status="locked"
              reason={item.earnSummary}
            />
          ))}
        </section>

        <CredentialsXrplLinkSection />

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold text-white">How credentials work</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
            <li>Claim your Culture ID — mint a `.culture` name on Base.</li>
            <li>Optionally link an XRPL wallet under Culture ID (Crossmark or manual sign).</li>
            <li>Contribute — quests, Studio builds, campaigns, and onchain activity.</li>
            <li>Earn credentials — automatic eligibility when rules are met.</li>
            <li>Build Culture Reputation — credentials feed your public trust score.</li>
            <li>Unlock access — agents, Studio priority, and high-trust flows.</li>
          </ol>
          <p className="mt-4 text-xs text-zinc-600">
            XRPL is optional infrastructure under Culture ID — Building Culture is not an XRP
            project.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
