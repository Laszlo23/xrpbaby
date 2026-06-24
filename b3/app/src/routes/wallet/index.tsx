import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount, useChainId } from "wagmi";
import { useCultureNetwork } from "@/contexts/CultureNetworkContext";
import { NetworkSelector } from "@/components/wallet/NetworkSelector";
import { PointsRedeemSection } from "@/components/PointsRedeemSection";
import { privyEnabled } from "@/lib/privy-env";
import { getIdentityNetwork } from "@/lib/identity/networks";
import { ModuleShell } from "@/components/ModuleShell";
import { WalletControls } from "@/components/WalletControls";
import { WalletExportSection } from "@/components/wallet/WalletExportSection";
import { WalletPaymentsGrid } from "@/components/wallet/WalletPaymentsGrid";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/wallet/")({
  head: () =>
    pageHead({
      title: "Your wallet",
      description:
        "Smart wallet on Base and BNB Chain — export keys, Culture Points packs, and identity mint.",
      path: "/wallet",
    }),
  component: WalletPage,
});

function WalletPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { activeNetworkId, identity } = useCultureNetwork();
  const activeNet = getIdentityNetwork(activeNetworkId);

  const onActiveChain = chainId === identity.identityChainId;
  const explorerUrl = address ? activeNet.explorerAddressUrl(address) : null;

  return (
    <ModuleShell
      moduleId="pass"
      title="Your culture wallet"
      subtitle="Smart wallet on Base and BNB Chain — sign in, buy packs, mint your .culture name, export keys when you need self-custody."
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex justify-center">
          <NetworkSelector />
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="mono-label text-zinc-500">Connection</p>
          <div className="mt-4 flex justify-center">
            <WalletControls />
          </div>
          {isConnected && address && (
            <dl className="mt-6 space-y-3 font-mono text-xs">
              <div>
                <dt className="text-zinc-500">Address</dt>
                <dd className="mt-1 break-all text-zinc-200">{address}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Identity network</dt>
                <dd className="mt-1 text-zinc-300">
                  {activeNet.chainLabel}
                  {!onActiveChain && isConnected && (
                    <span className="ml-2 text-amber-400">
                      Wallet on chain {chainId} — switch to {activeNet.chainLabel} to mint
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          )}
          {!privyEnabled && (
            <p className="mt-4 text-center text-xs text-zinc-500">
              Set <span className="font-mono">VITE_PRIVY_APP_ID</span> to enable embedded smart
              wallets and export.
            </p>
          )}
        </section>

        {privyEnabled && address && <WalletExportSection address={address} />}

        <WalletPaymentsGrid />

        <Link
          to="/pass"
          search={{ network: activeNetworkId }}
          className="block rounded-2xl border border-[#00E5FF]/25 bg-[#00E5FF]/10 p-5 transition hover:border-[#00E5FF]/50"
        >
          <p className="font-display text-lg font-semibold text-white">Mint .culture ID</p>
          <p className="mt-1 text-sm text-zinc-400">
            {identity.isIdentityContractConfigured
              ? `Mint on ${activeNet.chainLabel}`
              : `${activeNet.chainLabel} contract pending`}
          </p>
        </Link>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="mono-label text-zinc-500">Redeem for BCC</p>
          <div className="mt-4">
            <PointsRedeemSection compact />
          </div>
        </section>

        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center font-mono text-xs text-zinc-500 hover:text-zinc-300"
          >
            View on {activeNetworkId === "bsc" ? "BscScan" : "Basescan"}
          </a>
        )}
      </div>
    </ModuleShell>
  );
}
