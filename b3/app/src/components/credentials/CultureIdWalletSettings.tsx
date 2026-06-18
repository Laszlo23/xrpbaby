"use client";

import { useCallback, useEffect, useState } from "react";

import { LinkedWalletsStrip } from "@/components/credentials/LinkedWalletsStrip";
import { XrplWalletConnect } from "@/components/credentials/XrplWalletConnect";

type LinkedWalletRow = {
  chain: string;
  address: string;
  verified: boolean;
  isPrimary?: boolean;
};

type CultureIdWalletSettingsProps = {
  handle?: string;
  address?: string | null;
  title?: string;
};

export function CultureIdWalletSettings({
  handle: handleProp,
  address,
  title = "Linked wallets & XRPL",
}: CultureIdWalletSettingsProps) {
  const [handle, setHandle] = useState(handleProp ?? "");
  const [wallets, setWallets] = useState<LinkedWalletRow[]>([]);
  const [loading, setLoading] = useState(Boolean(handleProp || address));

  const load = useCallback(async () => {
    if (!handleProp && !address) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (handleProp) params.set("handle", handleProp);
      else if (address) params.set("address", address);
      const res = await fetch(`/api/credentials/member?${params}`);
      const data = (await res.json()) as {
        ok?: boolean;
        identity?: { handle?: string };
        linkedWallets?: LinkedWalletRow[];
      };
      if (data.ok) {
        setHandle(handleProp ?? data.identity?.handle ?? "");
        setWallets(data.linkedWallets ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [address, handleProp]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!handleProp && !address) return null;
  if (loading && !handle) {
    return <p className="text-xs text-zinc-500">Loading wallet settings…</p>;
  }
  if (!handle) return null;

  return (
    <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <h3 className="font-heading text-sm font-semibold text-white">{title}</h3>
      <LinkedWalletsStrip wallets={wallets} />
      <XrplWalletConnect handle={handle} onLinked={() => void load()} />
    </section>
  );
}
