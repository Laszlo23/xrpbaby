"use client";

import { usePrivy } from "@privy-io/react-auth";

/** Renders only when `PrivyProvider` is mounted (see `privyEnabled`). */
export function PrivyConnectButton({ busy }: { busy: boolean }) {
  const { login, ready: privyReady } = usePrivy();
  const disabled = busy || !privyReady;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => login()}
      className="rounded-full bg-action px-3 py-1.5 text-xs font-semibold text-[#0A0A0A] shadow-[0_0_16px_-2px_rgba(255,122,24,0.45)] hover:bg-action-light disabled:opacity-50"
    >
      {disabled ? "…" : "Connect"}
    </button>
  );
}
