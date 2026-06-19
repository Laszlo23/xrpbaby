import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";

import { AgentInboxCompose } from "@/components/agents/AgentInboxCompose";
import { CultureSignalsPanel } from "@/components/agents/CultureSignalsPanel";
import { pageHead } from "@/lib/seo";

type Thread = {
  id: string;
  subject: string;
  agentKind: string;
  status: string;
  createdAt: string;
  latestBody?: string;
};

export const Route = createFileRoute("/agents/inbox")({
  component: AgentInboxPage,
  head: () =>
    pageHead({
      title: "Agent inbox",
      description: "Email-simple agents — research, grants, Grove marketing, and analysis drafts.",
      path: "/agents/inbox",
    }),
});

function AgentInboxPage() {
  const { address, isConnected } = useAccount();
  const [threads, setThreads] = useState<Thread[]>([]);

  const load = useCallback(async () => {
    if (!address) return;
    const res = await fetch(`/api/agents/inbox?address=${encodeURIComponent(address)}`);
    const data = (await res.json()) as { ok?: boolean; threads?: Thread[] };
    if (data.ok && data.threads) setThreads(data.threads);
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isConnected || !address) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16 text-center">
        <p className="text-zinc-400">
          <Link to="/join" className="text-[#C5FF41] underline">
            Connect your wallet
          </Link>{" "}
          to use agents as easily as writing an email.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-5 py-8 sm:px-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#00E5FF]">
          Layer 3 · Agents
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">Agent inbox</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Compose naturally. Agents draft — you review before anything goes live.
        </p>
      </div>

      <AgentInboxCompose walletAddress={address} onSent={() => void load()} />

      <CultureSignalsPanel />

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Your threads
        </h2>
        {threads.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No threads yet — send your first message above.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {threads.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">{t.subject}</p>
                  <span className="font-mono text-[10px] uppercase text-zinc-500">{t.status}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {t.agentKind} · {new Date(t.createdAt).toLocaleString()}
                </p>
                {t.latestBody ? (
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{t.latestBody}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/agent-os" className="text-sm text-zinc-400 underline hover:text-white">
        Full Agent OS catalog →
      </Link>
    </div>
  );
}
