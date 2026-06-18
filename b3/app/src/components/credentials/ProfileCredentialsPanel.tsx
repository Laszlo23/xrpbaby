"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import {
  AccessUnlockPanel,
  buildDefaultAccessUnlocks,
} from "@/components/credentials/AccessUnlockPanel";
import { CultureIdWalletSettings } from "@/components/credentials/CultureIdWalletSettings";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { TrustCredentials } from "@/components/identity/TrustCredentials";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import type { Web3BioCredentials } from "@/lib/identity/identity-graph-types";
import type { CredentialCatalogItem } from "@/lib/credentials/credential-catalog-fn";

type EligibilityRow = {
  slug: string;
  eligible: boolean;
  earned: boolean;
  reason: string;
};

type MemberCredentialState = {
  eligibility: EligibilityRow[];
  earned: Array<{ credential: { slug: string; name: string } }>;
  linkedWallets: Array<{ chain: string; address: string; verified: boolean; isPrimary?: boolean }>;
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
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({
      handle: resolved.fullName,
      ...(resolved.owner ? { address: resolved.owner } : {}),
    });
    const res = await fetch(`/api/credentials/member?${params}`);
    const data = (await res.json()) as MemberCredentialState & { ok?: boolean };
    if (data.eligibility) setState(data);
  }, [resolved.fullName, resolved.owner]);

  useEffect(() => {
    void load();
  }, [load]);

  async function claim(slug: string) {
    setClaiming(slug);
    setError(null);
    try {
      const res = await fetch("/api/credentials/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          handle: resolved.fullName,
          walletAddress: resolved.owner,
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
        <Link to={`/id/${resolved.fullName}` as "/id/$name"} params={{ name: resolved.fullName }} className="text-zinc-500 hover:text-white">
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

      <section className="grid gap-4 md:grid-cols-2">
        {catalog.map((item) => {
          const row = state?.eligibility.find((e) => e.slug === item.slug);
          const status = row?.earned ? "earned" : row?.eligible ? "eligible" : "locked";
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
              onClaim={status === "eligible" ? () => void claim(item.slug) : undefined}
              claimPending={claiming === item.slug}
            />
          );
        })}
      </section>

      <AccessUnlockPanel items={accessItems} />

      {error ? <p className="text-sm text-amber-200/90">{error}</p> : null}
    </div>
  );
}
