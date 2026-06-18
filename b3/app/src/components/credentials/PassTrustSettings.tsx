"use client";

import { usePrivyWalletAddress } from "@/lib/privy-wallet";

import { CultureIdWalletSettings } from "@/components/credentials/CultureIdWalletSettings";

export function PassTrustSettings() {
  const address = usePrivyWalletAddress();

  if (!address) return null;

  return (
    <CultureIdWalletSettings
      address={address}
      title="Trust layer settings"
    />
  );
}
