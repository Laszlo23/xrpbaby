import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquareQuote, Mic, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";

import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import {
  FEEDBACK_AREAS,
  FEEDBACK_PASS_THRESHOLD,
  FEEDBACK_REWARDS,
  type FeedbackArea,
} from "@/lib/feedback-constants";
import { scoreFeedbackQuality } from "@/lib/feedback-quality";
import { pageHead } from "@/lib/seo";
import { telegramAuthHeaders } from "@/lib/tg/telegram-webapp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/voice")({
  validateSearch: (search: Record<string, unknown>) => ({
    source: typeof search.source === "string" ? search.source : undefined,
    area: typeof search.area === "string" ? search.area : undefined,
  }),
  head: () =>
    pageHead({
      title: "Builder Voice — Building Culture",
      description:
        "Earn Culture Points for useful product feedback. Specific bugs, confusion, and ideas ship — praise-only replies do not qualify.",
      path: "/voice",
      keywords: ["feedback", "Culture Points", "Builder Voice", "Building Culture"],
    }),
  component: VoicePage,
});

const AREA_LABELS: Record<FeedbackArea, string> = {
  onboarding: "Onboarding & join",
  marketplace: "Marketplace & trading",
  places: "Places / RWA",
  tg: "Telegram mini app",
  identity: "Identity & .culture",
  other: "Other",
};

type WallItem = {
  id: string;
  area: string;
  status: string;
  title: string;
  pointsGranted: number;
  contributor: string;
};

type Submission = {
  id: string;
  area: string;
  status: string;
  qualityScore: number;
  pointsGranted: number;
  rejectReason: string | null;
  createdAt: string;
};

function statusLabel(status: string) {
  switch (status) {
    case "pending_review":
      return "Pending review";
    case "useful":
      return "Useful";
    case "gold":
      return "Gold";
    case "implemented":
      return "Implemented";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

function VoicePage() {
  const { source, area: searchArea } = Route.useSearch();
  const { address, isConnected } = useAccount();
  const { signSiwe, signing } = usePointsSiweSign();
  const queryClient = useQueryClient();
  const initDataRaw =
    typeof window !== "undefined" ? window.Telegram?.WebApp?.initData ?? null : null;
  const isTelegram = Boolean(initDataRaw) || source === "tg";

  const [tab, setTab] = useState<"submit" | "mine" | "wall">("submit");
  const [area, setArea] = useState<FeedbackArea>(
    FEEDBACK_AREAS.includes(searchArea as FeedbackArea) ? (searchArea as FeedbackArea) : "other",
  );
  const [triedWhat, setTriedWhat] = useState("");
  const [problem, setProblem] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [pagePath, setPagePath] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !pagePath) {
      const ref = document.referrer;
      if (ref && ref.includes(window.location.host)) {
        try {
          setPagePath(new URL(ref).pathname);
        } catch {
          /* ignore */
        }
      }
    }
  }, [pagePath]);

  const preview = useMemo(
    () =>
      scoreFeedbackQuality({
        triedWhat,
        problem,
        suggestion,
        evidenceUrl,
        pagePath,
        area,
      }),
    [triedWhat, problem, suggestion, evidenceUrl, pagePath, area],
  );

  const { data: wallData } = useQuery({
    queryKey: ["feedback-wall"],
    queryFn: async () => {
      const res = await fetch("/api/feedback/wall");
      if (!res.ok) throw new Error("wall_fetch_failed");
      return (await res.json()) as { ok: boolean; items: WallItem[] };
    },
    staleTime: 60_000,
  });

  const { data: statsData } = useQuery({
    queryKey: ["feedback-stats"],
    queryFn: async () => {
      const res = await fetch("/api/feedback/stats");
      if (!res.ok) throw new Error("stats_fetch_failed");
      return (await res.json()) as {
        ok: boolean;
        totalValid: number;
        implemented: number;
        pendingReview: number;
        topVoicesThisMonth: Array<{ contributor: string; pointsGranted: number }>;
      };
    },
    staleTime: 60_000,
  });

  const { data: mineData, refetch: refetchMine } = useQuery({
    queryKey: ["feedback-mine", address, isTelegram],
    queryFn: async () => {
      const headers = isTelegram
        ? telegramAuthHeaders(initDataRaw)
        : address
          ? {}
          : null;
      if (!headers && !address) return { ok: true, submissions: [] as Submission[] };
      const url = address ? `/api/feedback/mine?address=${address}` : "/api/feedback/mine";
      const res = await fetch(url, { headers: headers ?? undefined });
      if (!res.ok) throw new Error("mine_fetch_failed");
      return (await res.json()) as { ok: boolean; submissions: Submission[] };
    },
    enabled: isTelegram || Boolean(address),
    staleTime: 30_000,
  });

  const submitFeedback = useCallback(async () => {
    if (!isTelegram && (!isConnected || !address)) {
      toast.error("Connect your wallet or open in Telegram to submit.");
      return;
    }
    setSubmitting(true);
    try {
      let body: Record<string, unknown> = {
        area,
        triedWhat,
        problem,
        suggestion: suggestion || undefined,
        evidenceUrl: evidenceUrl || undefined,
        pagePath: pagePath || undefined,
      };
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...telegramAuthHeaders(initDataRaw),
      };
      if (!isTelegram) {
        const siwe = await signSiwe();
        if (!siwe) {
          toast.error("Wallet signature required.");
          return;
        }
        body = {
          ...body,
          address,
          message: siwe.prepared,
          signature: siwe.signature,
        };
      }
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        detail?: string;
        status?: string;
        pointsGranted?: number;
        coachingTips?: string[];
        qualityScore?: number;
      };
      if (!res.ok || !json.ok) {
        if (json.error === "weekly_limit_reached") {
          toast.error(json.detail ?? "One valid submission per week.");
        } else if (json.coachingTips?.length) {
          toast.error(json.coachingTips[0]);
        } else {
          toast.error(json.detail ?? json.error ?? "Submission failed");
        }
        return;
      }
      if (json.status === "rejected") {
        toast.error(json.coachingTips?.[0] ?? "Feedback did not meet quality bar.");
      } else {
        toast.success(`+${json.pointsGranted ?? 5} Culture Points — team review within 7 days.`);
        setTriedWhat("");
        setProblem("");
        setSuggestion("");
        setEvidenceUrl("");
      }
      void refetchMine();
      void queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["feedback-wall"] });
    } finally {
      setSubmitting(false);
    }
  }, [
    address,
    area,
    evidenceUrl,
    initDataRaw,
    isConnected,
    isTelegram,
    pagePath,
    problem,
    queryClient,
    refetchMine,
    signSiwe,
    suggestion,
    triedWhat,
  ]);

  const canSubmit = isTelegram || (isConnected && address);

  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl space-y-10 pb-20">
        <header className="space-y-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold-500/90">
            Builder Voice
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Shape the product. Earn points for signal that ships.
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-400">
            Real feedback from real users — not &quot;all good.&quot; Describe what you tried, what
            broke or confused you, and optionally how you&apos;d fix it.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-4">
          {(
            [
              { tier: "Valid", pts: FEEDBACK_REWARDS.submit.points, note: "Instant, 1×/week" },
              { tier: "Useful", pts: FEEDBACK_REWARDS.useful.points, note: "Team review" },
              { tier: "Gold", pts: FEEDBACK_REWARDS.gold.points, note: "+ badge" },
              { tier: "Implemented", pts: 0, note: "Public wall" },
            ] as const
          ).map((t) => (
            <div
              key={t.tier}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-center"
            >
              <p className="text-xs uppercase tracking-wider text-zinc-500">{t.tier}</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {t.pts > 0 ? `+${t.pts} pts` : "Wall"}
              </p>
              <p className="text-[11px] text-zinc-500">{t.note}</p>
            </div>
          ))}
        </div>

        {statsData?.ok ? (
          <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
            <span>{statsData.totalValid} valid submissions</span>
            <span>{statsData.implemented} implemented</span>
            <span>{statsData.pendingReview} awaiting review</span>
          </div>
        ) : null}

        <div className="flex justify-center gap-2">
          {(["submit", "mine", "wall"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-2 text-sm capitalize transition",
                tab === t
                  ? "bg-gold-600/20 text-gold-200 ring-1 ring-gold-500/40"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              {t === "mine" ? "My submissions" : t === "wall" ? "Voice wall" : "Submit"}
            </button>
          ))}
        </div>

        {tab === "submit" ? (
          <div className="space-y-6 rounded-2xl border border-white/10 bg-black/35 p-6">
            {!canSubmit ? (
              <p className="text-sm text-amber-200/90">
                <Link to="/join" className="underline">
                  Connect wallet
                </Link>{" "}
                or open this page in the Telegram mini app to submit and earn points.
              </p>
            ) : null}

            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">Area</p>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_AREAS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setArea(a)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs",
                      area === a
                        ? "border-gold-500/50 bg-gold-500/10 text-gold-100"
                        : "border-white/10 text-zinc-400",
                    )}
                  >
                    {AREA_LABELS[a]}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm">
              <span className="text-zinc-500">What did you try? (min. 40 chars)</span>
              <textarea
                value={triedWhat}
                onChange={(e) => setTriedWhat(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white"
                placeholder="I opened /join, connected my wallet, and tried to complete onboarding…"
              />
            </label>

            <label className="block text-sm">
              <span className="text-zinc-500">What went wrong or felt confusing? (min. 60 chars)</span>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white"
                placeholder="Expected to see Culture Points credited, but the balance stayed at 0 after signing…"
              />
            </label>

            <label className="block text-sm">
              <span className="text-zinc-500">What would you change? (optional, boosts score)</span>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white"
              />
            </label>

            <label className="block text-sm">
              <span className="text-zinc-500">Evidence URL (screenshot, tx, optional)</span>
              <input
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white"
                placeholder="https://…"
              />
            </label>

            <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-300">
                  <Sparkles className="h-4 w-4 text-gold-400" aria-hidden />
                  Quality meter
                </span>
                <span
                  className={cn(
                    "font-mono text-sm",
                    preview.passed ? "text-emerald-400" : "text-amber-400",
                  )}
                >
                  {preview.score}/100 {preview.passed ? "✓" : `(need ${FEEDBACK_PASS_THRESHOLD})`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={cn(
                    "h-full transition-all",
                    preview.passed ? "bg-emerald-500" : "bg-amber-500",
                  )}
                  style={{ width: `${preview.score}%` }}
                />
              </div>
              {preview.coachingTips.length > 0 ? (
                <ul className="mt-3 space-y-1 text-xs text-zinc-500">
                  {preview.coachingTips.map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              ) : preview.passed ? (
                <p className="mt-2 text-xs text-emerald-400/90">
                  Looks substantive — submit for +{FEEDBACK_REWARDS.submit.points} pts.
                </p>
              ) : null}
            </div>

            <Button
              type="button"
              disabled={submitting || signing || !canSubmit}
              onClick={() => void submitFeedback()}
              className="w-full"
            >
              {submitting || signing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mic className="mr-2 h-4 w-4" />
              )}
              Submit Builder Voice
            </Button>
          </div>
        ) : null}

        {tab === "mine" ? (
          <div className="space-y-3">
            {!canSubmit ? (
              <p className="text-sm text-zinc-500">Connect wallet or use Telegram to see your submissions.</p>
            ) : mineData?.submissions?.length ? (
              mineData.submissions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-white">{AREA_LABELS[s.area as FeedbackArea] ?? s.area}</p>
                    <p className="text-xs text-zinc-500">
                      {statusLabel(s.status)} · score {s.qualityScore} ·{" "}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gold-300">+{s.pointsGranted} pts</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No submissions yet.</p>
            )}
          </div>
        ) : null}

        {tab === "wall" ? (
          <div className="space-y-3">
            {wallData?.items?.length ? (
              wallData.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <MessageSquareQuote className="mt-0.5 h-5 w-5 shrink-0 text-gold-500/80" />
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {statusLabel(item.status)} · {AREA_LABELS[item.area as FeedbackArea] ?? item.area}{" "}
                        · {item.contributor} · +{item.pointsGranted} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-zinc-500">
                Approved feedback will appear here after team review.
              </p>
            )}
            {statsData?.topVoicesThisMonth?.length ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
                  <Trophy className="h-4 w-4" aria-hidden />
                  Top voices this month
                </p>
                <ul className="space-y-2">
                  {statsData.topVoicesThisMonth.map((v, i) => (
                    <li key={`${v.contributor}-${i}`} className="flex justify-between text-sm text-zinc-300">
                      <span>{v.contributor}</span>
                      <span className="text-gold-300">+{v.pointsGranted} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="text-center text-xs text-zinc-600">
          Useful and Gold rewards are granted after human review — usually within 7 days. Not legal or
          investment advice.
        </p>
      </div>
    </MarketingShell>
  );
}
