import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";

function ogExplorerAddressUrl(address: string) {
  return `https://chainscan.0g.ai/address/${address}#code`;
}

function ogExplorerTxUrl(hash: string) {
  return `https://chainscan.0g.ai/tx/${hash}`;
}

export const Route = createFileRoute("/0g/agentid")({
  head: () =>
    pageHead({
      title: "0G Agent ID proof",
      description: "On-chain proof for our 0G Agent ID integration (hackathon submission).",
      path: "/0g/agentid",
      keywords: ["0G", "Agent ID", "hackathon", "chainscan"],
    }),
  component: OgAgentIdPage,
});

function OgAgentIdPage() {
  const contract = import.meta.env.VITE_OG_AGENT_ID_CONTRACT_ADDRESS as string | undefined;
  const deployTx = import.meta.env.VITE_OG_AGENT_ID_DEPLOY_TX as string | undefined;
  const mintTx = import.meta.env.VITE_OG_AGENT_ID_MINT_TX as string | undefined;

  return (
    <MarketingShell
      eyebrow="0G APAC Hackathon"
      tone="cyan"
      title={<>Agent ID (on-chain proof)</>}
      subtitle="A minimal ERC-721 Agent ID deployed on 0G Chain mainnet. This is our integration proof."
      articleClassName="max-w-4xl"
    >
      <div className="space-y-4">
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            Contract
          </p>
          {contract ? (
            <div className="mt-2 space-y-2">
              <div className="rounded-xl border border-white/[0.08] bg-black/30 p-4 font-mono text-[13px] text-zinc-200">
                {contract}
              </div>
              <a href={ogExplorerAddressUrl(contract)} target="_blank" rel="noreferrer noopener">
                View on 0G ChainScan →
              </a>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              Missing <span className="font-mono">VITE_OG_AGENT_ID_CONTRACT_ADDRESS</span>.
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            Proof transactions
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              Deploy tx:{" "}
              {deployTx ? (
                <a href={ogExplorerTxUrl(deployTx)} target="_blank" rel="noreferrer noopener">
                  {deployTx}
                </a>
              ) : (
                <span className="text-zinc-500 font-mono">VITE_OG_AGENT_ID_DEPLOY_TX</span>
              )}
            </li>
            <li>
              Mint tx:{" "}
              {mintTx ? (
                <a href={ogExplorerTxUrl(mintTx)} target="_blank" rel="noreferrer noopener">
                  {mintTx}
                </a>
              ) : (
                <span className="text-zinc-500 font-mono">VITE_OG_AGENT_ID_MINT_TX</span>
              )}
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
          <p className="text-sm text-zinc-400">
            Integration summary: we deploy an ownable “Agent ID” NFT contract on 0G Chain mainnet
            and mint a token to prove on-chain, transferable agent identity.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
