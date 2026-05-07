import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildCultureQuizSession,
  CULTURE_QUIZ_SESSION_LENGTH,
  type CultureQuizQuestion,
  scoreTier,
} from "@/content/culture-quiz";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { completeQuestWithXp, loadProgress } from "@/lib/playerProgress";

const QUEST_FINISH_ID = "culture_quiz_finish";
const QUEST_ACE_ID = "culture_quiz_ace";
const XP_FINISH = 25;
const XP_ACE = 35;

const LS_BEST_KEY = "culture_quiz_personal_best";

type Phase = "idle" | "playing" | "results";

function loadPersonalBest(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(LS_BEST_KEY);
    if (!raw) return 0;
    const n = Number(JSON.parse(raw));
    return Number.isFinite(n) ? Math.max(0, Math.min(CULTURE_QUIZ_SESSION_LENGTH, n)) : 0;
  } catch {
    return 0;
  }
}

function savePersonalBest(score: number) {
  if (typeof window === "undefined") return;
  const prev = loadPersonalBest();
  if (score > prev) localStorage.setItem(LS_BEST_KEY, JSON.stringify(score));
}

export function CultureQuizGame({ sharedScoreHint }: { sharedScoreHint?: number | null }) {
  const { address, isConnected } = useAccount();
  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<CultureQuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setPersonalBest(loadPersonalBest());
  }, [phase]);

  const total = questions.length;
  const current = questions[index];
  const progressLabel = total ? `Question ${index + 1} of ${total}` : "";

  const applyResults = useCallback(
    (finalScore: number) => {
      setCorrectCount(finalScore);
      savePersonalBest(finalScore);
      setPersonalBest(loadPersonalBest());

      if (!address || !isConnected) {
        setPhase("results");
        return;
      }

      const xpBefore = loadProgress(address).xp;
      const toastParts: string[] = [];

      if (completeQuestWithXp(address, QUEST_FINISH_ID, XP_FINISH)) {
        toastParts.push(`+${XP_FINISH} XP (first completion)`);
      }
      if (finalScore >= CULTURE_QUIZ_SESSION_LENGTH) {
        if (completeQuestWithXp(address, QUEST_ACE_ID, XP_ACE)) {
          toastParts.push(`+${XP_ACE} XP (perfect score)`);
        }
      }

      const xpAfter = loadProgress(address).xp;
      if (toastParts.length > 0) {
        toast.success(toastParts.join(" · "));
      } else if (xpAfter > xpBefore) {
        toast.success("Quest progress updated — see profile for XP.");
      } else {
        toast.message("Already earned these quiz rewards — play again for practice.");
      }
      setPhase("results");
    },
    [address, isConnected],
  );

  const resultsTier =
    phase === "results" ? scoreTier(correctCount, CULTURE_QUIZ_SESSION_LENGTH) : "";

  const start = useCallback(() => {
    const qs = buildCultureQuizSession(CULTURE_QUIZ_SESSION_LENGTH);
    setQuestions(qs);
    setIndex(0);
    setCorrectCount(0);
    setPicked(null);
    setPhase("playing");
  }, []);

  const goNext = useCallback(
    (wasCorrect: boolean) => {
      const nextCorrect = correctCount + (wasCorrect ? 1 : 0);
      if (index + 1 >= questions.length) {
        applyResults(nextCorrect);
        return;
      }
      setCorrectCount(nextCorrect);
      setIndex((i) => i + 1);
      setPicked(null);
    },
    [applyResults, correctCount, index, questions.length],
  );

  const onChoose = useCallback(
    (choiceIdx: number) => {
      if (phase !== "playing" || !current || picked !== null) return;
      setPicked(choiceIdx);
      const ok = choiceIdx === current.correctIndex;
      window.setTimeout(
        () => {
          goNext(ok);
        },
        reduceMotion ? 0 : 420,
      );
    },
    [current, goNext, phase, picked, reduceMotion],
  );

  return (
    <div className="space-y-8">
      {typeof sharedScoreHint === "number" && sharedScoreHint >= 0 ? (
        <p className="rounded-xl border border-[rgb(212_175_55/0.25)] bg-black/40 px-4 py-3 text-sm text-zinc-300">
          Shared score hint:{" "}
          <span className="font-mono text-[var(--vault-gold)]">{sharedScoreHint}</span> /{" "}
          {CULTURE_QUIZ_SESSION_LENGTH}. Play below to earn your own tier.
        </p>
      ) : null}

      {phase === "idle" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-black/35 p-6 md:p-8">
            <p className="font-heading text-lg text-white md:text-xl">
              Seven quick questions on pools, real-world prizes, and how this app thinks about
              culture on-chain.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-400">
              <li>
                Mixed from live pool cards (categories, worth bands, slugs) and FAQ-aligned basics
                (wallet, BCD narrative, mission).
              </li>
              <li>
                Connect a wallet to earn one-time quest XP on first completion ({XP_FINISH}) and on
                a perfect run (+{XP_ACE}). Progress is stored in your browser per wallet — same as
                the rest of the profile system.
              </li>
            </ul>
            {personalBest > 0 ? (
              <p className="mt-4 font-mono text-xs text-zinc-500">
                Personal best this browser: {personalBest}/{CULTURE_QUIZ_SESSION_LENGTH}
              </p>
            ) : null}
            <Button type="button" size="lg" className="mt-6 w-full sm:w-auto" onClick={start}>
              Start quiz
            </Button>
          </div>
        </div>
      ) : null}

      {phase === "playing" && current ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              {progressLabel}
            </span>
            <span className="font-mono text-xs text-zinc-600">{correctCount} correct so far</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
            <div
              className={cn(
                "h-full rounded-full bg-[var(--vault-gold)]/90",
                !reduceMotion && "motion-safe:transition-[width] motion-safe:duration-300",
              )}
              style={{
                width: `${((index + (picked !== null ? 1 : 0)) / total) * 100}%`,
              }}
            />
          </div>
          <div>
            <p className="font-heading text-xl font-semibold leading-snug text-white md:text-2xl">
              {current.prompt}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {current.choices.map((label, i) => {
                const isSel = picked === i;
                const showTruth = picked !== null;
                const isCorrect = i === current.correctIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChoose(i)}
                    disabled={picked !== null}
                    className={cn(
                      "rounded-xl border px-4 py-4 text-left text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(212_175_55/0.45)]",
                      showTruth &&
                        isCorrect &&
                        "border-emerald-500/60 bg-emerald-950/40 text-emerald-100",
                      showTruth &&
                        isSel &&
                        !isCorrect &&
                        "border-red-500/50 bg-red-950/30 text-red-100",
                      !showTruth &&
                        "border-white/[0.1] bg-black/40 text-zinc-100 hover:border-[rgb(212_175_55/0.35)] hover:bg-black/55",
                      showTruth && !isSel && !isCorrect && "opacity-50",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {picked !== null ? (
              <p
                className={cn(
                  "mt-6 text-sm leading-relaxed text-zinc-400",
                  !reduceMotion && "motion-safe:animate-in motion-safe:fade-in",
                )}
              >
                {current.explain}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {phase === "results" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[rgb(212_175_55/0.2)] bg-gradient-to-b from-black/60 to-black/40 p-6 text-center md:p-10">
            <Trophy className="mx-auto h-12 w-12 text-[var(--vault-gold)]" aria-hidden />
            <p className="mt-4 font-heading text-3xl font-bold text-white md:text-4xl">
              {correctCount}/{CULTURE_QUIZ_SESSION_LENGTH}
            </p>
            <p className="mt-2 font-heading text-xl text-[var(--vault-gold)]">{resultsTier}</p>
            <p className="mt-4 text-sm text-zinc-400">
              {correctCount >= CULTURE_QUIZ_SESSION_LENGTH
                ? "Flawless — you’re dangerous at pool literacy."
                : "Nice run — peek the FAQ and pool pages to tighten your streak."}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button type="button" onClick={start}>
                Play again
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/faq">Read FAQ</Link>
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/" hash="drops">
                  See live pools
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("score", String(correctCount));
                  url.searchParams.set("total", String(CULTURE_QUIZ_SESSION_LENGTH));
                  const text = `I scored ${correctCount}/${CULTURE_QUIZ_SESSION_LENGTH} on the ${BRAND_DISPLAY_NAME} culture quiz`;
                  if (navigator.share) {
                    void navigator.share({ title: BRAND_DISPLAY_NAME, text, url: url.toString() });
                  } else {
                    void navigator.clipboard.writeText(url.toString());
                    toast.message("Link copied — paste it anywhere.");
                  }
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                Share result link
              </Button>
            </div>
            <p className="mt-6 font-mono text-[10px] text-zinc-600">
              Share URL pattern:{" "}
              <span className="text-zinc-500">/play?score=&lt;n&gt;&total=7</span>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
