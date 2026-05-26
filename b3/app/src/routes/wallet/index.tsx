import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount, useChainId } from "wagmi";
import { base } from "@/lib/chains";
import { identityChainId } from "@/lib/identity/config";
import { pointsRedeemEnabled } from "@/lib/redemption-policy";
import { privyEnabled } from "@/lib/privy-env";
import { ModuleShell } from "@/components/ModuleShell";
import { WalletControls } from "@/components/WalletControls";
import { WalletExportSection } from "@/components/wallet/WalletExportSection";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/wallet/")({
  head: () =>
    pageHead({
      title: "Your wallet",
      description: "Base smart wallet, export keys, Culture Points packs, and identity mint.",
      path: "/wallet",
    }),
  component: WalletPage,
});

function WalletPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const onBase = chainId === base.id;
  const canMintIdentity = chainId === identityChainId;

  return (
    <ModuleShell
      moduleId="pass"
      title="Your culture wallet"
      subtitle="Smart wallet on Base — sign in, buy packs, mint your .culture name, export keys when you need self-custody."
    >
      <div className="mx-auto max-w-lg space-y-8">
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
                <dt className="text-zinc-500">Network</dt>
                <dd className="mt-1 text-zinc-300">
                  {onBase ? "Base mainnet" : `Chain ${chainId}`}
                  {!onBase && (
                    <span className="ml-2 text-amber-400">Switch to Base for packs &amp; mint</span>
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

        <section className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/wallet/packs"
            className="rounded-2xl border border-[#C5FF41]/25 bg-[#C5FF41]/10 p-5 transition hover:border-[#C5FF41]/50"
          >
            <p className="font-display text-lg font-semibold text-white">Culture packs</p>
            <p className="mt-1 text-sm text-zinc-400">Buy points with card — $0.70 to $7,777,777</p>
          </Link>
          <Link
            to="/pass"
            className="rounded-2xl border border-[#00E5FF]/25 bg-[#00E5FF]/10 p-5 transition hover:border-[#00E5FF]/50"
          >
            <p className="font-display text-lg font-semibold text-white">Mint .culture ID</p>
            <p className="mt-1 text-sm text-zinc-400">
              {canMintIdentity ? "On-chain identity NFT" : "Switch to Base to mint"}
            </p>
          </Link>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="mono-label text-zinc-500">Redeem for BCD</p>
          <p className="mt-2 text-sm text-zinc-400">
            {pointsRedeemEnabled
              ? "Redemption is enabled when pool liquidity meets program minimums."
              : "Coming when BCD has enough on-chain liquidity. Culture Points stay in your ledger until then."}
          </p>
          <Link
            to="/profile"
            className="mt-4 inline-block font-mono text-xs text-[#C5FF41] underline-offset-2 hover:underline"
          >
            View points on profile →
          </Link>
        </section>

        {address && (
          <a
            href={`https://basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center font-mono text-xs text-zinc-500 hover:text-zinc-300"
          >
            View on Basescan
          </a>
        )}
      </div>
    </ModuleShell>
  );
}
