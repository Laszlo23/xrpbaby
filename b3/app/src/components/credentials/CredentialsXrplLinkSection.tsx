"use client";

import { PassTrustSettings } from "@/components/credentials/PassTrustSettings";
import { XrplWalletConnect } from "@/components/credentials/XrplWalletConnect";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";
import { useEffect, useState } from "react";

type CredentialsXrplLinkSectionProps = {
  handle?: string;
};

export function CredentialsXrplLinkSection({ handle: handleProp }: CredentialsXrplLinkSectionProps) {
  const address = usePrivyWalletAddress();
  const [handle, setHandle] = useState(handleProp ?? "");

  useEffect(() => {
    if (handleProp) {
      setHandle(handleProp);
      return;
    }
    if (!address) return;
    void fetch(`/api/credentials/member?address=${encodeURIComponent(address)}`)
      .then((r) => r.json())
      .then((data: { identity?: { handle?: string } }) => {
        if (data.identity?.handle) setHandle(data.identity.handle);
      })
      .catch(() => undefined);
  }, [address, handleProp]);

  if (!handle) {
    return (
      <section
        id="xrpl-link"
        className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-6 md:p-8"
      >
        <h2 className="font-heading text-xl font-semibold text-white">Link XRPL wallet</h2>
        <p className="mt-3 text-sm text-zinc-400">
          Claim your Culture ID on{" "}
          <a href="/pass" className="text-[#C5FF41] hover:underline">
            /pass
          </a>{" "}
          first, then return here to link an optional XRPL wallet under your identity.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
      <h2 className="font-heading text-xl font-semibold text-white">Link XRPL wallet</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Connect Crossmark or sign manually to verify your XRPL address under{" "}
        <span className="font-mono text-zinc-200">{handle}</span>.
      </p>
      <div className="mt-4">
        <XrplWalletConnect handle={handle} />
      </div>
    </section>
  );
}

export function PassTrustSettingsWithHint() {
  return (
    <div>
      <p className="mb-3 text-xs text-zinc-500">
        Mint your <strong className="text-zinc-300">.culture</strong> name above, then link an optional
        XRPL wallet below (Crossmark + manual fallback).
      </p>
      <PassTrustSettings />
    </div>
  );
}
