import { usePrivy } from "@privy-io/react-auth";

export function WalletExportSection({ address }: { address: `0x${string}` }) {
  const { ready, authenticated, exportWallet } = usePrivy();
  if (!ready || !authenticated) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="mono-label text-zinc-500">Self-custody</p>
      <p className="mt-2 text-sm text-zinc-400">
        Export the private key for your wallet signer. For smart wallets this controls your account
        outside the app — treat it as secret.
      </p>
      <button
        type="button"
        onClick={() => void exportWallet({ address })}
        className="mt-4 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-mono text-xs uppercase tracking-wider text-amber-200 transition hover:bg-amber-500/20"
      >
        Export private key
      </button>
    </section>
  );
}
