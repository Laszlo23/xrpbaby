import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Circle, Clock, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { platformModules } from "@/lib/modules";
import { FOUNDING_WIRED_QUESTS, FOUNDING_DAILY_QUESTS } from "@/lib/founding-quests";
import { WeeklyBccClaimPanel } from "@/components/WeeklyBccClaimPanel";
import { postCompleteTaskWithSiwe } from "@/lib/points-fns";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/forest/quests")({
  component: FoundingQuestsPage,
  head: () =>
    pageHead({
      title: "Founding quests",
      description:
        "Complete founding quests, stack Culture Points, and claim weekly BCC with staking boosts.",
      path: "/forest/quests",
    }),
});

function FoundingQuestsPage() {
  const { address, isConnected } = useAccount();
  const { signSiwe, signing } = usePointsSiweSign();
  const completeTask = useServerFn(postCompleteTaskWithSiwe);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [claimingSlug, setClaimingSlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/member/me?address=${encodeURIComponent(address)}`);
      const data = (await res.json()) as {
        ok?: boolean;
        member?: { completedSlugs?: string[] } | null;
      };
      if (!data.ok || !data.member) return;
      setCompletedSlugs(data.member.completedSlugs ?? []);
    } catch {
      /* ignore */
    }
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  async function claimInline(slug: string) {
    setClaimingSlug(slug);
    try {
      const signed = await signSiwe();
      if (!signed) return;
      const result = await completeTask({
        data: { message: signed.prepared, signature: signed.signature, taskSlug: slug },
      });
      if (!result.ok) {
        toast.error(result.error ?? "Could not claim quest");
        return;
      }
      toast.success(result.alreadyCompleted ? "Already completed" : "Quest claimed!");
      await load();
    } finally {
      setClaimingSlug(null);
    }
  }

  if (!platformModules.founding) {
    return <p className="p-8 text-white">Founding module off.</p>;
  }

  const comingSoon = FOUNDING_DAILY_QUESTS.filter((q) => !q.wired);
  const doneCount = FOUNDING_WIRED_QUESTS.filter((q) => completedSlugs.includes(q.slug)).length;
  const totalWired = FOUNDING_WIRED_QUESTS.length;
  const progressPct = totalWired > 0 ? Math.round((doneCount / totalWired) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <Link to="/forest" className="text-sm text-zinc-400 hover:text-white">
          ← Forest
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold">Founding quests</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Stack Culture Points all week — claim BCC once per week. Stake on /roots to boost payout.
        </p>
        {isConnected ? (
          <div className="mt-4 flex items-center gap-3">
            <div
              className="relative h-10 w-10 shrink-0 rounded-full border border-[#C5FF41]/40"
              style={{
                background: `conic-gradient(#C5FF41 ${progressPct}%, #1a1a1a ${progressPct}%)`,
              }}
            >
              <div className="absolute inset-1 flex items-center justify-center rounded-full bg-[#050505] text-[10px] font-bold text-[#C5FF41]">
                {doneCount}/{totalWired}
              </div>
            </div>
            <p className="text-xs text-zinc-500">{progressPct}% of wired quests complete</p>
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-lg px-6 py-8">
        {!isConnected ? (
          <Link
            to="/join"
            className="mb-6 block rounded-xl border border-[#C5FF41]/30 bg-[#C5FF41]/10 px-5 py-4 text-center text-sm font-semibold text-[#C5FF41]"
          >
            Create your pass to track quests
          </Link>
        ) : (
          <div className="mb-8">
            <WeeklyBccClaimPanel compact onBalanceChange={() => void load()} />
          </div>
        )}
        <ul className="space-y-3">
          {FOUNDING_WIRED_QUESTS.map((q) => {
            const done = completedSlugs.includes(q.slug);
            return (
              <li key={q.slug} className="rounded-xl border border-white/10 px-4 py-4">
                <div className="flex gap-4">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C5FF41]" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-zinc-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{q.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">{q.description}</p>
                    <p className="mt-2 text-xs text-[#C5FF41]">+{q.culturePoints} Culture Points</p>
                    {!done && q.claimRoute ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {q.inlineClaim && isConnected ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={claimingSlug === q.slug || signing}
                            onClick={() => void claimInline(q.slug)}
                            className="rounded-full bg-[#C5FF41] text-xs font-semibold text-black hover:bg-[#b8eb3a]"
                          >
                            {claimingSlug === q.slug || signing ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Claim"
                            )}
                          </Button>
                        ) : null}
                        <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                          <Link to={q.claimRoute}>
                            Open
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {comingSoon.length > 0 ? (
          <div className="mt-10">
            <p className="mono-label">COMING SOON</p>
            <ul className="mt-4 space-y-3 opacity-70">
              {comingSoon.map((q) => (
                <li
                  key={q.slug}
                  className="flex gap-4 rounded-xl border border-dashed border-white/10 px-4 py-4"
                >
                  <Clock className="h-5 w-5 shrink-0 text-zinc-600" />
                  <div>
                    <p className="font-medium text-zinc-400">{q.title}</p>
                    <p className="mt-1 text-sm text-zinc-600">{q.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Link
          to="/profile"
          className="mt-8 block w-full rounded-full border border-white/15 py-3 text-center text-sm font-semibold text-white hover:border-[#C5FF41]/40"
        >
          Full task board on profile
        </Link>
      </main>
    </div>
  );
}
