import { useEffect, useRef } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useRouteExpectedChain } from "@/lib/route-chain";

export function NetworkGuard() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, switchChainAsync, isPending } = useSwitchChain();
  const want = useRouteExpectedChain();
  const autoAttempted = useRef(false);

  useEffect(() => {
    if (!isConnected || chainId === want.id) {
      autoAttempted.current = false;
      return;
    }
    if (!switchChainAsync || autoAttempted.current) return;
    autoAttempted.current = true;
    void switchChainAsync({ chainId: want.id }).catch(() => {
      autoAttempted.current = false;
    });
  }, [isConnected, chainId, want.id, switchChainAsync]);

  if (!isConnected || chainId === want.id) return null;

  return (
    <div className="sticky top-0 z-50 border-b border-destructive/40 bg-destructive/15 px-4 py-2 text-center text-xs text-foreground">
      <span className="font-medium">Wrong network.</span> Switch to {want.name} to mint and play.{" "}
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchChain?.({ chainId: want.id })}
        className="ml-2 underline font-bold disabled:opacity-50"
      >
        {isPending ? "Switching…" : `Switch to ${want.name}`}
      </button>
    </div>
  );
}
