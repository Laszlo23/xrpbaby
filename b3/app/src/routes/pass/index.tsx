import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { DomainCard3D } from "@/components/identity/DomainCard3D";
import { CulturePassBccClaimPanel } from "@/components/bcc/CulturePassBccClaimPanel";
import { IdentityReferralCodesPanel } from "@/components/identity/IdentityReferralCodesPanel";
import { PassTrustSettingsWithHint } from "@/components/credentials/CredentialsXrplLinkSection";
import { IdentityParticles } from "@/components/identity/Particles";
import { WalletIdentitiesPanel } from "@/components/identity/WalletIdentitiesPanel";
import { SearchMint } from "@/components/identity/SearchMint";
import { ModuleShell } from "@/components/ModuleShell";
import { useIdentityTeamMintWallet } from "@/hooks/useIdentityTeamMintWallet";
import { useWalletCultureIdentities } from "@/hooks/useWalletCultureIdentities";
import { IDENTITY_LAUNCH_REFERRAL_CODE } from "@/lib/identity/referral-constants";
import { cultureGatewayPath } from "@/lib/identity/urls";
import { pageHead } from "@/lib/seo";
import { platformModules } from "@/lib/modules";

export const Route = createFileRoute("/pass/")({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : undefined,
    tld: typeof search.tld === "string" ? search.tld : undefined,
    network: search.network === "bsc" || search.network === "base" ? search.network : undefined,
    manage: typeof search.manage === "string" ? search.manage : undefined,
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  head: () =>
    pageHead({
      title: "Claim your .culture name",
      description: `Mint your Culture Layer identity on Base Mainnet with invite code ${IDENTITY_LAUNCH_REFERRAL_CODE}.`,
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
      subtitle="Mint on Base Mainnet — connect, pick your name, enter your invite code, and confirm."
      hideHero
    >
      <PassMintDashboard />
    </ModuleShell>
  );
}

function PassMintDashboard() {
  const [previewName, setPreviewName] = useState("yourname");
  const [previewTld, setPreviewTld] = useState("culture");
  const { manage } = Route.useSearch();
  const { address, isConnected } = useAccount();
  const teamMintWallet = useIdentityTeamMintWallet(address);
  const { identities, isLoading: identitiesLoading } = useWalletCultureIdentities();
  const badges = useMemo(() => ["founding member", "multichain", "transferable"], []);
  const mintAnother = manage === "1" || teamMintWallet;

  if (isConnected && !mintAnother) {
    if (identitiesLoading) {
      return (
        <div className="relative px-2 py-8 text-center text-sm text-zinc-500">
          Loading your Culture IDs…
        </div>
      );
    }
    if (identities.length > 0) {
      return (
        <div className="relative space-y-6 px-2">
          <WalletIdentitiesPanel />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center text-sm text-zinc-400">
            <p>Want another .culture, .build, or .home name?</p>
            <Link
              to="/pass"
              search={{ manage: "1" }}
              className="mt-3 inline-flex min-h-11 items-center rounded-full bg-[#C5FF41] px-5 py-3 text-sm font-semibold text-black hover:bg-white"
            >
              Mint another name →
            </Link>
          </div>
          <details className="rounded-2xl border border-white/10 bg-white/[0.03]">
            <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-zinc-300">
              Invite friends
            </summary>
            <div className="border-t border-white/5 px-5 pb-5 pt-2">
              <IdentityReferralCodesPanel />
            </div>
          </details>
        </div>
      );
    }
  }

  return (
    <div className="relative">
      {isConnected ? (
        <div className="mb-6 px-2">
          <WalletIdentitiesPanel showMintAnother={false} compact />
        </div>
      ) : null}
      <section className="relative overflow-hidden rounded-3xl border border-[#C5FF41]/25 bg-black/40 px-5 py-8 sm:px-10 sm:py-12">
        <IdentityParticles count={32} />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="font-display text-2xl font-bold sm:text-4xl">
            Your name on the{" "}
            <span className="bg-gradient-to-r from-[#C5FF41] to-[#00E5FF] bg-clip-text text-transparent">
              culture layer
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
            Four steps: connect on Base, pick a name, enter{" "}
            <strong className="text-[#C5FF41]">{IDENTITY_LAUNCH_REFERRAL_CODE}</strong>, and mint.
          </p>
          <div className="mt-6 flex justify-center">
            <SearchMint id="mint" />
          </div>
        </div>
      </section>

      <div
        className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start"
        onInputCapture={(e) => {
          const target = e.target as HTMLElement;
          if (target instanceof HTMLInputElement && target.placeholder === "yourname") {
            setPreviewName(
              target.value
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "") || "yourname",
            );
          }
          if (target instanceof HTMLSelectElement) {
            setPreviewTld(target.value.replace(/^\./, "") || "culture");
          }
        }}
      >
        <div className="order-1 lg:order-none">
          <p className="mono-label mb-4">Preview</p>
          <DomainCard3D
            name={previewName}
            tld={previewTld}
            badges={badges}
            variant={previewName.length >= 3 && previewName !== "yourname" ? "primary" : "gold"}
          />
        </div>
        <div className="order-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-zinc-400 lg:order-none">
          <p className="font-medium text-zinc-300">After you mint</p>
          <ul className="mt-4 list-inside list-disc space-y-2">
            <li>
              Share link:{" "}
              <code className="text-zinc-300">{cultureGatewayPath("yourname.culture")}</code>
            </li>
            <li>Profile lives at /id/yourname.culture with onchain owner resolution</li>
            <li>Transferable NFT — yours to keep or sell</li>
          </ul>
          <Link to="/forest" className="mt-6 inline-block text-[#00E5FF] hover:underline">
            Back to community hub
          </Link>
        </div>
      </div>

      <details className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03]">
        <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-zinc-300">
          After you mint — BCC rewards
        </summary>
        <div className="border-t border-white/5 px-2 pb-4 pt-2">
          <CulturePassBccClaimPanel />
        </div>
      </details>

      <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03]">
        <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-zinc-300">
          Invite friends
        </summary>
        <div className="border-t border-white/5 px-2 pb-4 pt-2">
          <IdentityReferralCodesPanel />
        </div>
      </details>

      <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03]">
        <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-zinc-300">
          Optional — link XRPL wallet
        </summary>
        <div className="border-t border-white/5 px-5 pb-5 pt-2">
          <PassTrustSettingsWithHint />
          <p className="mt-3 text-xs text-zinc-600">
            Optional XRPL wallet linking under Culture ID — Building Culture is not an XRP project.
          </p>
        </div>
      </details>
    </div>
  );
}
