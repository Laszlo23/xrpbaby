import { useCultureNetwork } from "@/contexts/CultureNetworkContext";
import { IDENTITY_LAUNCH_REFERRAL_CODE } from "@/lib/identity/referral-constants";
import { useAccount } from "wagmi";

type Props = {
  wrongChain: boolean;
  isSwitchingChain: boolean;
  onSwitch: () => void;
};

export function BaseMainnetMintBanner({ wrongChain, isSwitchingChain, onSwitch }: Props) {
  const { activeNetworkId, setActiveNetworkId, identity } = useCultureNetwork();
  const { isConnected, chainId } = useAccount();

  const needsBase =
    activeNetworkId !== "base" ||
    (isConnected && wrongChain && chainId !== identity.identityChainId);

  if (!needsBase && !isConnected) {
    return (
      <div className="rounded-2xl border border-[var(--base-blue)]/30 bg-[var(--base-blue)]/10 px-4 py-3 text-center text-sm text-zinc-300">
        Mint on <strong className="text-white">Base Mainnet</strong> — your wallet will be prompted
        to switch when you connect.
      </div>
    );
  }

  if (!needsBase) return null;

  return (
    <div className="rounded-2xl border border-amber-400/35 bg-amber-400/10 px-4 py-4 text-sm text-zinc-200">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300">
        Switch to Base Mainnet
      </p>
      <p className="mt-2">
        The $0.07 founding price and invite code{" "}
        <strong className="text-white">{IDENTITY_LAUNCH_REFERRAL_CODE}</strong> apply on Base. BNB
        Chain is optional and uses a separate mint path.
      </p>
      <button
        type="button"
        disabled={isSwitchingChain}
        onClick={() => {
          setActiveNetworkId("base");
          onSwitch();
        }}
        className="mt-3 inline-flex rounded-full bg-[var(--base-blue)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {isSwitchingChain ? "Opening wallet…" : "Switch wallet to Base Mainnet →"}
      </button>
    </div>
  );
}
