"use client";

import { usePrivy } from "@privy-io/react-auth";

/** Opens Privy’s connect flow for MetaMask, WalletConnect, and other external wallets. */
export function PrivyExternalWalletButton({ busy }: { busy: boolean }) {
  const { connectWallet, ready } = usePrivy();
  const disabled = busy || !ready;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => connectWallet()}
      title="MetaMask, Rabby, WalletConnect, and other wallets via Privy"
      className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-zinc-200 hover:border-eco/40 disabled:opacity-50"
    >
      {disabled ? "…" : "More wallets"}
    </button>
  );
}
