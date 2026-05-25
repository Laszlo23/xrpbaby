import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DomainCard3D } from "@/components/identity/DomainCard3D";
import { IdentityParticles } from "@/components/identity/Particles";
import { SearchMint } from "@/components/identity/SearchMint";
import { ModuleShell } from "@/components/ModuleShell";
import { identityMintPriceTagline } from "@/lib/identity/mint-price";
import { cultureGatewayPath } from "@/lib/identity/urls";
import { pageHead } from "@/lib/seo";
import { platformModules } from "@/lib/modules";

export const Route = createFileRoute("/pass/")({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : undefined,
    tld: typeof search.tld === "string" ? search.tld : undefined,
  }),
  head: () =>
    pageHead({
      title: "Claim your .culture name",
      description: `Mint your Culture Layer identity on Base — ${identityMintPriceTagline}. Transferable .culture, .build, .home, and more.`,
      path: "/pass",
    }),
  component: PassPage,
});

function PassPage() {
  if (!platformModules.identity) {
    return <p className="p-8 text-white">Identity module off.</p>;
  }

  return (
    <ModuleShell
      moduleId="pass"
      title="Claim your culture name"
      subtitle={`Mint a transferable identity NFT on Base. ${identityMintPriceTagline}.`}
      hideHero
    >
      <PassMintDashboard />
    </ModuleShell>
  );
}

function PassMintDashboard() {
  const [previewName, setPreviewName] = useState("yourname");
  const [previewTld, setPreviewTld] = useState("culture");

  const badges = useMemo(() => ["founding eligible", "base native", "transferable"], []);

  return (
    <div className="relative">
      <section className="relative overflow-hidden rounded-3xl border border-[#C5FF41]/25 bg-black/40 px-6 py-14 sm:px-10">
        <IdentityParticles count={32} />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mono-label !text-[#00E5FF]">TLD DASHBOARD</p>
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
            Your name on the{" "}
            <span className="bg-gradient-to-r from-[#C5FF41] to-[#00E5FF] bg-clip-text text-transparent">
              culture layer
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-zinc-400">
            Search availability, connect your wallet, and mint in one flow.
          </p>
          <div className="mt-10 flex justify-center">
            <SearchMint id="mint" />
          </div>
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div
          onInputCapture={(e) => {
            const target = e.target as HTMLElement;
            if (target instanceof HTMLInputElement && target.placeholder === "yourname") {
              setPreviewName(
                target.value.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "yourname",
              );
            }
            if (target instanceof HTMLSelectElement) {
              setPreviewTld(target.value.replace(/^\./, "") || "culture");
            }
          }}
        >
          <p className="mono-label mb-4">PREVIEW</p>
          <DomainCard3D
            name={previewName}
            tld={previewTld}
            badges={badges}
            variant={previewName.length >= 3 && previewName !== "yourname" ? "primary" : "gold"}
          />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">After mint</p>
          <ul className="mt-4 list-inside list-disc space-y-2">
            <li>
              Your share link: <code className="text-zinc-300">{cultureGatewayPath("yourname.culture")}</code>{" "}
              → profile (no extra domain to buy)
            </li>
            <li>Canonical profile at /id/handle.tld with onchain owner resolution</li>
            <li>Founding members: first 5,000 mints on .culture</li>
            <li>Mint price: {identityMintPriceTagline}</li>
          </ul>
          <Link to="/forest" className="mt-6 inline-block text-[#00E5FF] hover:underline">
            Back to community hub
          </Link>
        </div>
      </div>
    </div>
  );
}
