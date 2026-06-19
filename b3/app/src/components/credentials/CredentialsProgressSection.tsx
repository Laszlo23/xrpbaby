"use client";

import { useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import {
  CredentialProgressPanel,
  buildCredentialProgressItems,
} from "@/components/credentials/CredentialProgressPanel";
import type { CredentialCatalogItem } from "@/lib/credentials/credential-catalog-fn";
import { AsyncSection } from "@/components/AsyncSection";

type MemberPayload = {
  ok?: boolean;
  eligibility?: Array<{ slug: string; eligible: boolean; earned: boolean; reason: string }>;
  earned?: Array<{ credential: { slug: string } }>;
  pointsTotal?: number;
  questCount?: number;
  studioProjectCount?: number;
  referralCount?: number;
  hasCultureIdentity?: boolean;
  hasHumanAttestation?: boolean;
};

type LoadState = "idle" | "loading" | "ready" | "error";

export function CredentialsProgressSection({ catalog }: { catalog: CredentialCatalogItem[] }) {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<MemberPayload | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");

  const load = useCallback(async () => {
    if (!address) {
      setData(null);
      setLoadState("idle");
      return;
    }
    setLoadState("loading");
    try {
      const res = await fetch(`/api/credentials/member?address=${encodeURIComponent(address)}`);
      const json = (await res.json()) as MemberPayload;
      if (!res.ok || json.ok === false) {
        setLoadState("error");
        return;
      }
      setData(json);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isConnected || !address) {
    return (
      <CredentialProgressPanel
        items={buildCredentialProgressItems({
          catalog,
          eligibility: [],
          pointsTotal: 0,
          questCount: 0,
        })}
        hasCultureIdentity={false}
      />
    );
  }

  const items = buildCredentialProgressItems({
    catalog,
    eligibility: data?.eligibility ?? [],
    pointsTotal: data?.pointsTotal,
    questCount: data?.questCount,
    studioProjectCount: data?.studioProjectCount,
    referralCount: data?.referralCount,
    hasHumanAttestation: data?.hasHumanAttestation,
  });

  return (
    <AsyncSection
      state={loadState === "loading" ? "loading" : loadState === "error" ? "error" : "ready"}
      errorMessage="Could not load your credential progress. Connect is fine — try again."
      onRetry={() => void load()}
    >
      <CredentialProgressPanel
        items={items}
        hasCultureIdentity={Boolean(data?.hasCultureIdentity)}
      />
    </AsyncSection>
  );
}
