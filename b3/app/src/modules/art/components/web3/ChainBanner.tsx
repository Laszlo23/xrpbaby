import { useAccount, useChainId } from "wagmi";
import { targetChain, targetChainId } from "@/modules/art/lib/chains";
import { isHubConfigured } from "@/modules/art/lib/contracts";
import { ClientOnly } from "@/modules/art/components/web3/ClientOnly";

function ChainBannerInner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  if (!isConnected) return null;

  const wrongChain = chainId !== targetChainId;
  const missingHub = !isHubConfigured;

  if (!wrongChain && !missingHub) return null;

  return (
    <div className="fixed left-0 right-0 top-[4.5rem] z-40 px-4">
      <div className="glass mx-auto max-w-3xl rounded-full border border-primary/30 px-5 py-2 text-center text-xs uppercase tracking-[0.15em]">
        {wrongChain ? (
          <span>
            Switch to <strong>{targetChain.name}</strong> in your wallet to mint tickets.
          </span>
        ) : (
          <span>
            Contracts not configured — set{" "}
            <code className="font-mono normal-case">VITE_HUB_ADDRESS</code> after deploy.
          </span>
        )}
      </div>
    </div>
  );
}

export function ChainBanner() {
  return (
    <ClientOnly>
      <ChainBannerInner />
    </ClientOnly>
  );
}
