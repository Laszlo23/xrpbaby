"use client";

import { base } from "viem/chains";
import { useHydrated } from "@/lib/use-hydrated";
import { useChainId, useSwitchChain } from "wagmi";

/** Prompts switching to Base when the wallet is on another network. */
export function ChainSwitchBanner() {
  const hydrated = useHydrated();
  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();

  if (!hydrated) return null;
  if (chainId === base.id) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-950/40 px-4 py-2 text-center text-sm text-amber-100">
      <span className="text-amber-200/90">Wrong network.</span>{" "}
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchChain({ chainId: base.id })}
        className="font-semibold text-gold-400 underline-offset-2 hover:underline disabled:opacity-50"
      >
        {isPending ? "Switching…" : `Switch to Base`}
      </button>
      {error && <span className="ml-2 text-xs text-red-300">{error.message}</span>}
    </div>
  );
}
