import { xrplAccountExplorerUrl } from "@/lib/xrpl-explorer-client";

type LinkedWalletRow = {
  chain: string;
  address: string;
  verified: boolean;
  isPrimary?: boolean;
};

const CHAIN_LABELS: Record<string, string> = {
  evm: "EVM",
  xrpl: "XRPL",
  solana: "Solana",
  sui: "Sui",
  bitcoin: "Bitcoin",
};

export function LinkedWalletsStrip({ wallets }: { wallets: LinkedWalletRow[] }) {
  if (wallets.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
        Linked wallets
      </h3>
      <ul className="flex flex-wrap gap-2">
        {wallets.map((w) => {
          const explorer = w.chain === "xrpl" ? xrplAccountExplorerUrl(w.address) : null;
          const label = `${CHAIN_LABELS[w.chain] ?? w.chain}: ${w.address.slice(0, 6)}…${w.address.slice(-4)}${w.verified ? " ✓" : ""}${w.isPrimary ? " · primary" : ""}`;
          return (
            <li
              key={`${w.chain}-${w.address}`}
              className="rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-xs text-zinc-300"
            >
              {explorer ? (
                <a
                  href={explorer}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-emerald-300"
                >
                  {label} ↗
                </a>
              ) : (
                label
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-[10px] text-zinc-600">
        XRPL linking is optional infrastructure under Culture ID — Building Culture is not an XRP
        project.
      </p>
    </section>
  );
}
