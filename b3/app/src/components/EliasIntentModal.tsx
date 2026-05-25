import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Compass, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ELIAS_ENTRY_INTENTS, intentById } from "@/lib/elias-intents";
import { persistEntryIntent } from "@/lib/playerProgress";

const BASE_REFERRAL_URL = "https://base.app/invite/friends/L0G97WP5";
const PULSE_COACH_OPEN_EVENT = "bc_pulse_coach_open";

type Props = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export function EliasIntentModal(props: Props) {
  const { address } = useAccount();
  const [step, setStep] = useState<"welcome" | "pick" | "routes">("welcome");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function resetAndClose(open: boolean) {
    if (!open) {
      setStep("welcome");
      setSelectedId(null);
    }
    props.onOpenChange(open);
  }

  function openEliasOrb() {
    window.dispatchEvent(new CustomEvent("bc_elias_orb_open"));
  }

  function openPulseCoach() {
    window.dispatchEvent(new CustomEvent(PULSE_COACH_OPEN_EVENT));
  }

  function onPickCard(intentId: string) {
    const { progress, localXpGranted } = persistEntryIntent(address ?? undefined, intentId, {
      xpReward: 25,
    });
    setSelectedId(intentId);
    setStep("routes");
    if (address && progress) {
      toast.success(
        localXpGranted
          ? "Path saved · +25 local XP."
          : "Path updated — XP was already credited for this lane.",
      );
    } else {
      toast.message("Saved here — connect a wallet on Profile to sync XP.");
    }
  }

  const chosen = selectedId ? intentById(selectedId) : undefined;

  return (
    <Dialog open={props.open} onOpenChange={resetAndClose}>
      <DialogContent className="glass max-h-[90vh] overflow-hidden border-white/[0.08] p-0 sm:max-w-md">
        <div className="max-h-[90vh] overflow-y-auto px-5 pb-6 pt-6 sm:px-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="flex items-center gap-2 font-heading text-xl pr-8">
              <Compass className="h-6 w-6 shrink-0 text-emerald" aria-hidden />
              {step === "welcome"
                ? "Welcome to BUILDCHAIN"
                : step === "pick"
                  ? "What brings you here?"
                  : `You’re on the ${chosen?.label ?? "your"} path`}
            </DialogTitle>
            <DialogDescription className="text-left text-[13px] leading-relaxed text-zinc-400">
              {step === "welcome"
                ? "A quick setup so you’re not overwhelmed. Two taps and you’ll be in the right lane."
                : step === "pick"
                  ? "Tap one — no typing. We’ll tune drops, missions, and Elias to your lane."
                  : `${chosen?.teaser} Next, jump in with one tap (or close and browse).`}
            </DialogDescription>
          </DialogHeader>

          {step === "welcome" ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/[0.10] bg-white/[0.04] px-4 py-3">
                <p className="text-sm text-zinc-200">Start here:</p>
                <ul className="mt-2 space-y-1 text-[13px] leading-relaxed text-zinc-400">
                  <li>- Pick a lane (we’ll point you to the right pages).</li>
                  <li>- Use AI for “what next” instead of guessing.</li>
                  <li>- Optional: install the Base app for a smoother wallet experience.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <Button
                  type="button"
                  className="h-auto min-h-[52px] w-full justify-center rounded-2xl bg-[var(--b3-purple)] py-4 text-[15px] font-semibold text-white hover:bg-[var(--base-blue-hover)]"
                  asChild
                >
                  <a href={BASE_REFERRAL_URL} target="_blank" rel="noreferrer noopener">
                    <Download className="mr-2 h-5 w-5" aria-hidden />
                    Get the Base app (referral)
                  </a>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="min-h-[48px] w-full rounded-2xl border-white/15"
                  onClick={() => {
                    openPulseCoach();
                    resetAndClose(false);
                  }}
                >
                  <Sparkles className="mr-2 h-5 w-5 text-neon" aria-hidden />
                  Ask Pulse Coach what to do next
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-[48px] w-full rounded-2xl text-zinc-400 hover:text-white"
                  onClick={() => {
                    openEliasOrb();
                    resetAndClose(false);
                  }}
                >
                  Open Elias (guided path)
                </Button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button type="button" className="rounded-full" onClick={() => setStep("pick")}>
                  Continue
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full text-zinc-500"
                  onClick={() => resetAndClose(false)}
                >
                  Skip for now
                </Button>
              </div>
            </div>
          ) : step === "pick" ? (
            <>
              <ul
                className="mt-5 grid grid-cols-1 gap-2.5"
                role="listbox"
                aria-label="Choose your path"
              >
                {ELIAS_ENTRY_INTENTS.map((i) => (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() => onPickCard(i.id)}
                      className="flex w-full min-h-[52px] items-center justify-between gap-3 rounded-2xl border border-white/[0.12] bg-white/[0.05] px-4 py-3.5 text-left transition active:scale-[0.99] hover:border-emerald-500/45 hover:bg-emerald-500/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                    >
                      <span className="font-heading text-[15px] font-semibold leading-snug text-white">
                        {i.label}
                      </span>
                      <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => resetAndClose(false)}
                className="mt-5 w-full rounded-xl py-3 text-center text-[13px] text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
              >
                Skip for now
              </button>
            </>
          ) : (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                <Check className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
                <p className="text-sm text-emerald-100/95">
                  Saved your lane — explore when you’re ready.
                </p>
              </div>
              {chosen?.routes.map((r) => (
                <Button
                  key={`${chosen.id}-${r.to}`}
                  type="button"
                  className="h-auto min-h-[52px] w-full justify-center rounded-2xl bg-[var(--b3-purple)] py-4 text-[15px] font-semibold text-white hover:bg-[var(--base-blue-hover)]"
                  asChild
                >
                  <Link to={r.to} onClick={() => resetAndClose(false)}>
                    {r.label}
                  </Link>
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full min-h-[48px] rounded-2xl border-white/15"
                onClick={() => {
                  setStep("pick");
                  setSelectedId(null);
                }}
              >
                Choose a different lane
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-zinc-500"
                onClick={() => resetAndClose(false)}
              >
                Done
              </Button>
              <p className="text-center text-[10px] text-zinc-600">
                Vienna itineraries with partners —{" "}
                <Link
                  className="text-emerald-400 underline"
                  to="/elias"
                  onClick={() => resetAndClose(false)}
                >
                  full Elias concierge
                </Link>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
