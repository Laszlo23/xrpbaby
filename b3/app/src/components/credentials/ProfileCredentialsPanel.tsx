"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";

import {
  AccessUnlockPanel,
  buildDefaultAccessUnlocks,
} from "@/components/credentials/AccessUnlockPanel";
import {
  buildCredentialProgressItems,
  CredentialProgressPanel,
} from "@/components/credentials/CredentialProgressPanel";
import { CultureIdWalletSettings } from "@/components/credentials/CultureIdWalletSettings";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { TrustCredentials } from "@/components/identity/TrustCredentials";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import type { Web3BioCredentials } from "@/lib/identity/identity-graph-types";
import type { CredentialCatalogItem } from "@/lib/credentials/credential-catalog-fn";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { AsyncSection } from "@/components/AsyncSection";

type EligibilityRow = {
  slug: string;
  eligible: boolean;
  earned: boolean;
  reason: string;
};

type MemberCredentialState = {
  eligibility: EligibilityRow[];
  earned: Array<{
    credential: { slug: string; name: string };
    evidence?: { dropSlug?: string; unitNumber?: number; reason?: string } | null;
  }>;
  linkedWallets: Array<{ chain: string; address: string; verified: boolean; isPrimary?: boolean }>;
  hasCultureIdentity?: boolean;
  pointsTotal?: number;
  questCount?: number;
  studioProjectCount?: number;
  referralCount?: number;
  hasHumanAttestation?: boolean;
};

type ProfileCredentialsPanelProps = {
  resolved: ResolvedCultureName;
  catalog: CredentialCatalogItem[];
  web3bioCredentials?: Web3BioCredentials | null;
};

export function ProfileCredentialsPanel({
  resolved,
  catalog,
  web3bioCredentials,
}: ProfileCredentialsPanelProps) {
  const [state, setState] = useState<MemberCredentialState | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const { signSiwe, signing: siweSigning } = usePointsSiweSign();

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const params = new URLSearchParams({
        handle: resolved.fullName,
        ...(resolved.owner ? { address: resolved.owner } : {}),
      });
      const res = await fetch(`/api/credentials/member?${params}`);
      const data = (await res.json()) as MemberCredentialState & { ok?: boolean };
      if (!res.ok || !data.eligibility) {
        setLoadState("error");
        return;
      }
      setState(data);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [resolved.fullName, resolved.owner]);

  useEffect(() => {
    void load();
  }, [load]);

  async function claim(slug: string) {
    setClaiming(slug);
    setError(null);
    try {
      if (!isConnected) {
        setError("Connect your wallet to claim credentials.");
        return;
      }
      const signed = await signSiwe();
      if (!signed) {
        setError("Wallet signature required.");
        return;
      }
      const res = await fetch("/api/credentials/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          handle: resolved.fullName,
          walletAddress: signed.address,
          address: signed.address,
          message: signed.prepared,
          signature: signed.signature,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Claim failed");
        return;
      }
      await load();
    } catch {
      setError("Claim request failed");
    } finally {
      setClaiming(null);
    }
  }

  const earnedSlugs = new Set(state?.earned.map((e) => e.credential.slug) ?? []);
  const accessItems = buildDefaultAccessUnlocks(earnedSlugs);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          to={`/id/${resolved.fullName}` as "/id/$name"}
          params={{ name: resolved.fullName }}
          className="text-zinc-500 hover:text-white"
        >
          Profile
        </Link>
        <span className="text-zinc-700">·</span>
        <span className="text-[#C5FF41]">Credentials</span>
        <span className="text-zinc-700">·</span>
        <Link
          to={`/id/${resolved.fullName}/reputation` as "/id/$name/reputation"}
          params={{ name: resolved.fullName }}
          className="text-zinc-500 hover:text-white"
        >
          Reputation
        </Link>
      </div>

      {web3bioCredentials ? (
        <section>
          <h2 className="font-heading text-lg font-semibold text-white">External trust signals</h2>
          <div className="mt-3">
            <TrustCredentials credentials={web3bioCredentials} />
          </div>
        </section>
      ) : null}

      <CultureIdWalletSettings handle={resolved.fullName} address={resolved.owner} />

      <AsyncSection
        state={loadState === "loading" ? "loading" : loadState === "error" ? "error" : "ready"}
        errorMessage="Could not load credential eligibility for this profile."
        onRetry={() => void load()}
      >
        <CredentialProgressPanel
          hasCultureIdentity={state?.hasCultureIdentity ?? Boolean(resolved.owner)}
          items={buildCredentialProgressItems({
            catalog,
            eligibility: state?.eligibility ?? [],
            pointsTotal: state?.pointsTotal,
            questCount: state?.questCount,
            studioProjectCount: state?.studioProjectCount,
            referralCount: state?.referralCount,
            hasHumanAttestation: state?.hasHumanAttestation,
          })}
        />
      </AsyncSection>

      <section className="grid gap-4 md:grid-cols-2">
        {catalog.map((item) => {
          const row = state?.eligibility.find((e) => e.slug === item.slug);
          const status = row?.earned ? "earned" : row?.eligible ? "eligible" : "locked";
          const earnedRow = state?.earned.find((e) => e.credential.slug === item.slug);
          const evidence = earnedRow?.evidence;
          const evidenceLine =
            item.slug === "limited-merch-holder" && evidence?.unitNumber
              ? `Edition #${evidence.unitNumber}${evidence.dropSlug ? ` · ${evidence.dropSlug}` : ""}`
              : undefined;
          return (
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
              status={status}
              reason={row?.reason}
              evidenceLine={evidenceLine}
              onClaim={status === "eligible" ? () => void claim(item.slug) : undefined}
              claimPending={claiming === item.slug || siweSigning}
            />
          );
        })}
      </section>

      <AccessUnlockPanel items={accessItems} />

      {error ? <p className="text-sm text-amber-200/90">{error}</p> : null}
    </div>
  );
}
