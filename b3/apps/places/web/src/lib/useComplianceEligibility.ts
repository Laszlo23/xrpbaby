"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getAppOrigin } from "@/lib/places-origins";

type Eligibility = {
  configured?: boolean;
  status?: string;
  canHoldRestrictedShares?: boolean;
};

export function useComplianceEligibility(): Eligibility | null {
  const { address } = useAccount();
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);

  useEffect(() => {
    if (!address) {
      setEligibility(null);
      return;
    }
    const app = getAppOrigin();
    void fetch(`${app}/api/compliance/eligibility?wallet=${encodeURIComponent(address)}`)
      .then(async (response) => {
        if (!response.ok) {
          setEligibility(null);
          return;
        }
        const data = (await response.json()) as Eligibility & { ok?: boolean };
        if (data.ok === false) {
          setEligibility(null);
          return;
        }
        setEligibility(data);
      })
      .catch(() => setEligibility(null));
  }, [address]);

  return eligibility;
}

export function complianceInvestHint(eligibility: Eligibility | null, connected: boolean): string {
  if (!connected) return "Connect a wallet to check compliance before investing.";
  if (!eligibility?.configured) {
    return "Compliance registry checks run on the main app when configured.";
  }
  if (eligibility.canHoldRestrictedShares) {
    return "Eligible for restricted property shares.";
  }
  if (eligibility.status === "pending") return "KYC pending — refresh on KYC page.";
  if (eligibility.status === "none") return "Complete KYC before holding restricted shares.";
  return "Verification may be required for tokenized property shares.";
}
