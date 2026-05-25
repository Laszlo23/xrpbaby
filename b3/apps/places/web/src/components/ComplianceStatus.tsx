"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { complianceAbi } from "@/lib/contracts";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";

const zero = "0x0000000000000000000000000000000000000000" as const;

/** When no compliance contract is configured, trading is unrestricted in the UI. */
export function useCompliance() {
  const { address } = useAccount();
  const { compliance: reg } = useProtocolAddresses();
  const hasRegistry = reg !== zero;
  const verifiedEnabled = !!address && hasRegistry;

  const { data: kycBypass, isLoading: kycBypassLoading } = useReadContract({
    address: reg,
    abi: complianceAbi,
    functionName: "kycBypass",
    query: { enabled: hasRegistry },
  });

  const { data: verified, isLoading: verifiedLoading } = useReadContract({
    address: reg,
    abi: complianceAbi,
    functionName: "isVerified",
    args: address ? [address] : undefined,
    query: { enabled: verifiedEnabled },
  });

  const bypass = !!kycBypass;
  const loading =
    hasRegistry && (kycBypassLoading || (!!address && verifiedLoading));

  return {
    hasRegistry,
    kycBypass: bypass,
    verified: !!verified,
    loading,
    /** Block restricted actions when registry is deployed and wallet not verified (unless global bypass is on). */
    blocked: hasRegistry && !!address && !loading && !bypass && !verified,
  };
}

export function ComplianceStatus() {
  const { hasRegistry, kycBypass, verified, loading } = useCompliance();

  if (!hasRegistry) {
    return (
      <p className="rounded-md border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-400">
        Set <span className="font-mono">NEXT_PUBLIC_COMPLIANCE_REGISTRY</span> to enforce on-chain KYC for
        restricted shares.
      </p>
    );
  }

  if (loading) {
    return <p className="text-xs text-zinc-500">Checking compliance…</p>;
  }

  if (kycBypass) {
    return (
      <p className="rounded-md border border-blue-900/50 bg-blue-950/30 px-3 py-2 text-xs text-blue-200/90">
        Testing: on-chain KYC bypass is active — per-wallet verification is not required.
      </p>
    );
  }

  if (verified) {
    return (
      <p className="rounded-md border border-emerald-900/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
        On-chain KYC: verified
      </p>
    );
  }

  return (
    <div className="rounded-md border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-100">
      <p className="font-medium">Verification (configuration-dependent)</p>
      <p className="mt-1 text-amber-200/80">
        Your wallet is not marked verified on the ComplianceRegistry. When provider flows are enabled, the relayer
        updates on-chain status via webhook. A compliance admin may call{" "}
        <span className="font-mono">setWalletStatus</span>.
      </p>
      <Link href="/kyc" className="mt-2 inline-block text-sm font-medium text-action hover:underline">
        Verify with Veriff
      </Link>
    </div>
  );
}
