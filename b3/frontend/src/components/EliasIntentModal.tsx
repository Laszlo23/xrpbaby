import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Compass } from "lucide-react";
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

type Props = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

export function EliasIntentModal(props: Props) {
  const { address } = useAccount();
  const [step, setStep] = useState<"pick" | "routes">("pick");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function resetAndClose(open: boolean) {
    if (!open) {
      setStep("pick");
      setSelectedId(null);
    }
    props.onOpenChange(open);
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
              {step === "pick" ? (
                <>What brings you here?</>
              ) : (
                <>You’re on the {chosen?.label ?? "your"} path</>
              )}
            </DialogTitle>
            <DialogDescription className="text-left text-[13px] leading-relaxed text-zinc-400">
              {step === "pick" ? (
                <>
                  Tap one — no typing. We’ll tune drops, missions, and Elias to your lane.
                </>
              ) : (
                <>
                  {chosen?.teaser} Next, jump in with one tap (or close and browse).
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {step === "pick" ? (
            <>
              <ul className="mt-5 grid grid-cols-1 gap-2.5" role="listbox" aria-label="Choose your path">
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
                <Link className="text-emerald-400 underline" to="/elias" onClick={() => resetAndClose(false)}>
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
