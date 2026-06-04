import { useCultureNetwork } from "@/contexts/CultureNetworkContext";
import type { IdentityNetworkId } from "@/lib/identity/networks";
import { getIdentityNetwork } from "@/lib/identity/networks";
import { toast } from "sonner";

const OPTIONS: IdentityNetworkId[] = ["base", "bsc"];

export function NetworkSelector({ className = "" }: { className?: string }) {
  const { activeNetworkId, setActiveNetworkId, switchToActiveChain } = useCultureNetwork();

  async function select(id: IdentityNetworkId) {
    if (id === activeNetworkId) return;
    const net = getIdentityNetwork(id);
    if (!net.isConfigured) {
      toast.error(`${net.chainLabel} identity contract not configured yet.`);
      return;
    }
    setActiveNetworkId(id);
    try {
      await switchToActiveChain();
    } catch {
      toast.message(`Selected ${net.chainLabel}. Switch network in your wallet to mint.`);
    }
  }

  return (
    <div
      className={`inline-flex rounded-full border border-white/15 bg-black/40 p-1 ${className}`}
      role="group"
      aria-label="Identity network"
    >
      {OPTIONS.map((id) => {
        const net = getIdentityNetwork(id);
        const active = id === activeNetworkId;
        return (
          <button
            key={id}
            type="button"
            onClick={() => void select(id)}
            className={`rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
              active ? "bg-[#C5FF41] text-black" : "text-zinc-400 hover:text-zinc-200"
            } ${!net.isConfigured ? "opacity-50" : ""}`}
            title={
              net.isConfigured ? `Mint on ${net.chainLabel}` : `${net.chainLabel} — deploy pending`
            }
          >
            {net.chainLabel}
          </button>
        );
      })}
    </div>
  );
}
