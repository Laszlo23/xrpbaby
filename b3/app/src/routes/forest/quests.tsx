import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

import { platformModules } from "@/lib/modules";
import { FOUNDING_DAILY_QUESTS } from "@/lib/founding-quests";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/forest/quests")({
  component: FoundingQuestsPage,
  head: () => ({ meta: [{ title: "Founding quests — Building Culture" }] }),
});

function FoundingQuestsPage() {
  const { address, isConnected } = useAccount();
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/member/me?address=${encodeURIComponent(address)}`);
      const data = (await res.json()) as {
        ok?: boolean;
        member?: { recentActivities?: { type: string }[] } | null;
      };
      if (!data.ok || !data.member) return;
      const fromLedger = data.member.recentActivities
        ?.filter((a) => a.type.startsWith("task_completion"))
        .map((a) => a.type.replace("task_completion:", "")) ?? [];
      setCompletedSlugs(fromLedger);
    } catch {
      /* ignore */
    }
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!platformModules.founding) {
    return <p className="p-8 text-white">Founding module off.</p>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <Link to="/forest" className="text-sm text-zinc-400 hover:text-white">
          ← Forest
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold">Founding quests</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Culture Points from the unified ledger. Complete tasks on your profile with sign-in.
        </p>
      </header>
      <main className="mx-auto max-w-lg px-6 py-8">
        {!isConnected ? (
          <Link
            to="/join"
            className="mb-6 block rounded-xl border border-[#C5FF41]/30 bg-[#C5FF41]/10 px-5 py-4 text-center text-sm font-semibold text-[#C5FF41]"
          >
            Create your pass to track quests
          </Link>
        ) : null}
        <ul className="space-y-3">
          {FOUNDING_DAILY_QUESTS.map((q) => {
            const done = completedSlugs.includes(q.slug);
            return (
              <li
                key={q.slug}
                className="flex gap-4 rounded-xl border border-white/10 px-4 py-4"
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C5FF41]" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-zinc-600" />
                )}
                <div>
                  <p className="font-medium">{q.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{q.description}</p>
                  <p className="mt-2 text-xs text-[#C5FF41]">+{q.culturePoints} Culture Points</p>
                </div>
              </li>
            );
          })}
        </ul>
        <Link
          to="/profile"
          className="mt-8 block w-full rounded-full bg-white py-3 text-center text-sm font-semibold text-black hover:bg-[#C5FF41]"
        >
          Open profile & claim tasks
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
