"use client";

import { useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import {
  CredentialProgressPanel,
  buildCredentialProgressItems,
} from "@/components/credentials/CredentialProgressPanel";
import type { CredentialCatalogItem } from "@/lib/credentials/credential-catalog-fn";

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

export function CredentialsProgressSection({ catalog }: { catalog: CredentialCatalogItem[] }) {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<MemberPayload | null>(null);

  const load = useCallback(async () => {
    if (!address) {
      setData(null);
      return;
    }
    const res = await fetch(`/api/credentials/member?address=${encodeURIComponent(address)}`);
    const json = (await res.json()) as MemberPayload;
    setData(json);
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
    <CredentialProgressPanel items={items} hasCultureIdentity={Boolean(data?.hasCultureIdentity)} />
  );
}
