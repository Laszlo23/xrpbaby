import { createFileRoute, useSearch } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

type MintSearch = {
  invite?: string;
  ref?: string;
};

export const Route = createFileRoute("/bcid/mint")({
  validateSearch: (search: Record<string, unknown>): MintSearch => ({
    invite: typeof search.invite === "string" ? search.invite : undefined,
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  head: () =>
    pageHead({
      title: "Mint BCID — Building Culture Identity",
      description: "Mint your Human BCID — soulbound builder identity on Base.",
      path: "/bcid/mint",
    }),
  component: BcidMintPage,
});

function BcidMintPage() {
  const { invite, ref } = useSearch({ from: "/bcid/mint" });

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-4 text-3xl font-bold text-white">Mint Human BCID</h1>
      <p className="mb-6 text-zinc-300">
        Connect your wallet and sync after onchain mint. BCID v1 testnet uses Base Sepolia (chain
        84532).
      </p>

      {invite ? (
        <p className="mb-4 rounded-lg border border-[#C5FF41]/30 bg-[#C5FF41]/10 px-4 py-2 text-sm text-[#C5FF41]">
          Waitlist invite: <strong>{invite}</strong>
        </p>
      ) : null}
      {ref ? (
        <p className="mb-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
          Referral: <strong>{ref}</strong> — you and your referrer earn BCC on mint.
        </p>
      ) : null}

      <ol className="mb-8 list-decimal space-y-2 pl-5 text-zinc-400">
        <li>Deploy <code className="text-zinc-200">BcidRegistry</code> on Base Sepolia (see docs)</li>
        <li>Call <code className="text-zinc-200">mint(handle)</code> with ETH</li>
        <li>
          Sync via <code className="text-zinc-200">POST /api/bcid/sync</code> (SIWE)
        </li>
        <li>
          Optional: bridge <code className="text-zinc-200">.culture</code> via{" "}
          <code className="text-zinc-200">POST /api/bcid/bridge/culture</code>
        </li>
      </ol>

      <a
        href="/bcid"
        className="text-sm text-[#C5FF41] hover:underline"
      >
        ← Back to BCID overview
      </a>
    </main>
  );
}
