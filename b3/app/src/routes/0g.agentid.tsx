import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, ExternalLink, Film } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import {
  buildOgHackathonXPost,
  OG_AGENT_ID_SOL_PATH,
  OG_CHAIN_ID,
  OG_CHAIN_NAME,
  OG_HACKATHON_REPO,
  OG_JUDGE_ONE_LINER,
  OG_PROOF_PAGE_PATH,
  OG_RPC,
  OG_SUBMISSION_DOC,
  ogExplorerAddressUrl,
  ogExplorerTxUrl,
  resolveOgAgentIdProof,
} from "@/lib/og-hackathon";
import { pageHead } from "@/lib/seo";

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

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Copy failed — select and copy manually");
  }
}

function CopyChip({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full border-white/10 bg-black/30 text-xs"
      onClick={() => {
        void copyText(label, value).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 2000);
        });
      }}
    >
      {done ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}

function OgAgentIdPage() {
  const { contract, deployTx, mintTx } = resolveOgAgentIdProof();
  const xPost = buildOgHackathonXPost(contract);
  const proofUrl =
    typeof window !== "undefined" ? `${window.location.origin}/0g/agentid` : "/0g/agentid";

  const heroActions = (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" className="rounded-full">
        <a href={ogExplorerAddressUrl(contract)} target="_blank" rel="noreferrer noopener">
          View on 0G ChainScan
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </a>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full border-white/10"
        onClick={() => void copyText("Proof page URL", proofUrl)}
      >
        <Copy className="mr-1.5 h-3.5 w-3.5" />
        Copy proof URL
      </Button>
    </div>
  );

  return (
    <MarketingShell
      eyebrow="0G APAC Hackathon"
      tone="cyan"
      title={<>Agent ID (on-chain proof)</>}
      subtitle="Minimal ownable ERC-721 on 0G Chain mainnet — contract, deploy tx, and mint tx for judges."
      actions={heroActions}
      articleClassName="max-w-4xl"
    >
      <div className="space-y-4">
        <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">
            Judge one-liner
          </p>
          <p className="mt-2 text-sm text-zinc-200">{OG_JUDGE_ONE_LINER}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyChip label="One-liner" value={OG_JUDGE_ONE_LINER} />
            <CopyChip label="Contract" value={contract} />
            <CopyChip label="X post" value={xPost} />
          </div>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">Network</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-300">
            <li>
              Chain: <span className="font-mono text-zinc-100">{OG_CHAIN_NAME}</span> (chainId{" "}
              <span className="font-mono">{OG_CHAIN_ID}</span>)
            </li>
            <li>
              RPC:{" "}
              <a href={OG_RPC} target="_blank" rel="noreferrer noopener" className="font-mono text-xs">
                {OG_RPC}
              </a>
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">Contract</p>
          <div className="mt-2 rounded-xl border border-white/[0.08] bg-black/30 p-4 font-mono text-[13px] text-zinc-200 break-all">
            {contract}
          </div>
          <a
            className="mt-2 inline-block text-sm"
            href={ogExplorerAddressUrl(contract)}
            target="_blank"
            rel="noreferrer noopener"
          >
            View on 0G ChainScan →
          </a>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            Proof transactions
          </p>
          <ul className="mt-3 space-y-3 text-sm">
            <li>
              <span className="text-zinc-500">Deploy tx</span>
              <div className="mt-1 font-mono text-[12px] text-zinc-300 break-all">{deployTx}</div>
              <a href={ogExplorerTxUrl(deployTx)} target="_blank" rel="noreferrer noopener">
                Open on ChainScan →
              </a>
            </li>
            <li>
              <span className="text-zinc-500">Mint tx</span>
              <div className="mt-1 font-mono text-[12px] text-zinc-300 break-all">{mintTx}</div>
              <a href={ogExplorerTxUrl(mintTx)} target="_blank" rel="noreferrer noopener">
                Open on ChainScan →
              </a>
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">
          <div className="flex items-center gap-2 text-amber-100/90">
            <Film className="h-4 w-4" />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em]">Record demo (≤3 min)</p>
          </div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
            <li>
              Open <span className="font-mono text-zinc-100">{proofUrl}</span> (or production — same
              path).
            </li>
            <li>Click <strong className="text-zinc-100">View on 0G ChainScan</strong> — show contract.</li>
            <li>Open deploy + mint tx links — show success on explorer.</li>
            <li>
              Optional: open repo{" "}
              <a href={`${OG_HACKATHON_REPO}/blob/main/${OG_AGENT_ID_SOL_PATH}`} target="_blank" rel="noreferrer noopener">
                {OG_AGENT_ID_SOL_PATH}
              </a>
              .
            </li>
            <li>Close on contract address + one-liner on screen.</li>
          </ol>
          <p className="mt-3 text-xs text-zinc-500">
            Full script + HackQuest fields:{" "}
            <span className="font-mono">{OG_SUBMISSION_DOC}</span> and{" "}
            <span className="font-mono">b3/docs/0G_HACKATHON_VIDEO_AND_X.md</span>
          </p>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            X post (required)
          </p>
          <pre className="mt-3 max-h-48 overflow-auto rounded-xl border border-white/[0.08] bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
            {xPost}
          </pre>
          <Button
            type="button"
            size="sm"
            className="mt-3 rounded-full"
            onClick={() => void copyText("X post", xPost)}
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy X post
          </Button>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 text-sm text-zinc-400">
          <p>
            Integration: ownable ERC-721 Agent ID on 0G mainnet + in-app proof lane. Repo:{" "}
            <a href={OG_HACKATHON_REPO} target="_blank" rel="noreferrer noopener">
              {OG_HACKATHON_REPO}
            </a>
            . Source:{" "}
            <a
              href={`${OG_HACKATHON_REPO}/blob/main/${OG_AGENT_ID_SOL_PATH}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {OG_AGENT_ID_SOL_PATH}
            </a>
            ,{" "}
            <a
              href={`${OG_HACKATHON_REPO}/blob/main/${OG_PROOF_PAGE_PATH}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {OG_PROOF_PAGE_PATH}
            </a>
            .
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
