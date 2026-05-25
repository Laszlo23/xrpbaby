"use client";

import { useState } from "react";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { createSiweMessage } from "viem/siwe";
import type { SiweVerifyResponse } from "@/lib/siwe-verify-types";
import { SessionSetupBanner } from "@/components/SessionSetupBanner";
import { SIWE_DEFAULT_CHAIN_ID } from "@/lib/siwe-chain";

const FALLBACK_SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://buildingculture.capital";
const FALLBACK_SITE_HOST = (() => {
  try {
    return new URL(FALLBACK_SITE_ORIGIN).host;
  } catch {
    return "buildingculture.capital";
  }
})();

type Props = {
  onSuccess?: () => void;
  /** Called with full verify payload (use for session banners). */
  onVerify?: (result: SiweVerifyResponse) => void;
  className?: string;
  label?: string;
};

export function SiweSignInButton({ onSuccess, onVerify, className, label = "Sign in with Ethereum" }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending, error } = useSignMessage();
  const [lastVerify, setLastVerify] = useState<SiweVerifyResponse | null>(null);

  async function signIn() {
    if (!address) return;
    setLastVerify(null);
    const nonceRes = await fetch(`/api/auth/siwe/nonce?address=${encodeURIComponent(address)}`);
    if (!nonceRes.ok) return;
    const { nonce } = (await nonceRes.json()) as { nonce?: string };
    if (!nonce) return;
    const message = createSiweMessage({
      address,
      chainId: chainId || SIWE_DEFAULT_CHAIN_ID,
      domain: typeof window !== "undefined" ? window.location.host : FALLBACK_SITE_HOST,
      nonce,
      uri: typeof window !== "undefined" ? window.location.origin : FALLBACK_SITE_ORIGIN,
      version: "1",
      statement: "Sign in with Ethereum to Building Culture.",
    });
    const signature = await signMessageAsync({ message });
    const verifyRes = await fetch("/api/auth/siwe/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message, signature }),
    });
    const data = (await verifyRes.json()) as SiweVerifyResponse;
    setLastVerify(data);
    onVerify?.(data);
    if (verifyRes.ok && data.sessionEstablished) {
      onSuccess?.();
    }
  }

  if (!isConnected || !address) {
    return (
      <p className="text-xs text-zinc-500">Connect a wallet first.</p>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => void signIn()}
        className={
          className ??
          "rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm font-medium text-gold-200 hover:bg-gold-500/20 disabled:opacity-50"
        }
      >
        {isPending ? "Signing…" : label}
      </button>
      {error && (
        <p className="text-xs text-red-400" title={error.message}>
          {error.message}
        </p>
      )}
      <SessionSetupBanner verify={lastVerify} />
    </div>
  );
}
