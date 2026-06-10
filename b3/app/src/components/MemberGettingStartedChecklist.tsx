import { Link } from "@tanstack/react-router";
import { Check, Circle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { identityMintPriceShort } from "@/lib/identity/mint-price";
import {
  checklistCompleteCount,
  loadMemberChecklist,
  markChecklistStep,
  type ChecklistStepId,
  type MemberChecklist,
} from "@/lib/member-onboarding";

const STEPS: Array<{
  id: ChecklistStepId;
  title: string;
  detail: string;
  href: string;
  cta: string;
}> = [
  {
    id: "identity",
    title: "Claim your .culture name (optional)",
    detail: `Mint on Base — ${identityMintPriceShort}. Your onchain handle for the community.`,
    href: "/pass",
    cta: "Open pass",
  },
  {
    id: "first-quest",
    title: "Complete your first quest",
    detail: "Earn Culture Points on your profile — server-backed, wallet-linked rewards.",
    href: "/profile",
    cta: "Go to profile",
  },
  {
    id: "first-drop",
    title: "Enter your first drop",
    detail: "Fair raffle tickets for real stays, art, and culture — the Play loop.",
    href: "/play",
    cta: "Open Play",
  },
];

type Props = {
  /** Show compact banner when user just finished /join */
  highlight?: boolean;
};

export function MemberGettingStartedChecklist({ highlight = false }: Props) {
  const { isConnected } = useAccount();
  const [steps, setSteps] = useState<MemberChecklist>(() => loadMemberChecklist());

  const refresh = useCallback(() => setSteps(loadMemberChecklist()), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const done = checklistCompleteCount(steps);
  const allDone = done >= STEPS.length;

  if (allDone && !highlight) return null;

  function onMark(step: ChecklistStepId) {
    setSteps(markChecklistStep(step));
  }

  return (
    <section
      className={`overflow-hidden rounded-3xl border p-6 sm:p-8 ${
        highlight
          ? "border-[#C5FF41]/40 bg-gradient-to-br from-[#C5FF41]/10 via-black/40 to-[#00E5FF]/5"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-label !text-[#C5FF41]">GETTING STARTED</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            Your first 3 steps
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            {highlight
              ? `Welcome to ${BRAND_DISPLAY_NAME}! Follow this short path — then explore every lane in the hub.`
              : `New here? Three taps to understand ${BRAND_DISPLAY_NAME} — identity, points, and Play.`}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2">
          <Sparkles className="h-4 w-4 text-[#C5FF41]" aria-hidden />
          <span className="font-mono text-sm text-zinc-300">
            {done}/{STEPS.length} done
          </span>
        </div>
      </div>

      <ol className="mt-8 space-y-4">
        {STEPS.map((step, idx) => {
          const complete = steps[step.id];
          return (
            <li
              key={step.id}
              className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
                complete
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-white/[0.08] bg-black/25"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  {complete ? (
                    <Check className="h-5 w-5 text-emerald-400" aria-hidden />
                  ) : (
                    <Circle className="h-5 w-5 text-zinc-600" aria-hidden />
                  )}
                </span>
                <div>
                  <p className="font-medium text-white">
                    <span className="mr-2 font-mono text-xs text-zinc-500">{idx + 1}.</span>
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{step.detail}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  to={step.href}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:border-[#C5FF41]/50"
                  onClick={() => onMark(step.id)}
                >
                  {step.cta}
                </Link>
                {!complete ? (
                  <button
                    type="button"
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-white/5 px-4 text-xs text-zinc-400 hover:text-zinc-200"
                    onClick={() => onMark(step.id)}
                  >
                    Mark done
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {!isConnected ? (
        <p className="mt-4 text-xs text-zinc-500">
          Connect your wallet on{" "}
          <Link to="/join" className="text-[#C5FF41] underline underline-offset-2">
            Join
          </Link>{" "}
          to sync Culture Points across devices.
        </p>
      ) : null}
    </section>
  );
}
