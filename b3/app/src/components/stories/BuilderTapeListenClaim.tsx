"use client";

import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  BUILDER_TAPE_LISTEN_POINTS,
  BUILDER_TAPE_LISTEN_THRESHOLD,
  builderTapeListenTaskSlug,
  type BuilderTape,
} from "@/content/builder-tapes";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { postCompleteBuilderTapeListen } from "@/lib/points-fns";
import { BadgeRevealModal, questBadgeById } from "@/components/rewards/BadgeRevealModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BuilderTapeListenClaimProps = {
  tape: BuilderTape;
  listenRatio: number;
  listenedSeconds: number;
  durationSeconds: number;
  alreadyClaimed: boolean;
  seriesCompleteClaimed: boolean;
  onClaimed: () => void;
  className?: string;
};

export function BuilderTapeListenClaim({
  tape,
  listenRatio,
  listenedSeconds,
  durationSeconds,
  alreadyClaimed,
  seriesCompleteClaimed,
  onClaimed,
  className,
}: BuilderTapeListenClaimProps) {
  const { isConnected } = useAccount();
  const { signSiwe, signing } = usePointsSiweSign();
  const completeListen = useServerFn(postCompleteBuilderTapeListen);
  const [claiming, setClaiming] = useState(false);
  const [badgeOpen, setBadgeOpen] = useState(false);

  const thresholdMet =
    listenRatio >= BUILDER_TAPE_LISTEN_THRESHOLD ||
    (durationSeconds > 0 && listenedSeconds / durationSeconds >= BUILDER_TAPE_LISTEN_THRESHOLD);

  const claim = useCallback(async () => {
    if (!isConnected) {
      toast.error("Connect your wallet to claim Culture Points.");
      return;
    }
    setClaiming(true);
    try {
      const signed = await signSiwe();
      if (!signed) return;
      const res = await completeListen({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          slug: tape.slug,
          listenedSeconds,
          durationSeconds,
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Could not claim listen reward");
        return;
      }
      if (res.alreadyCompleted) {
        toast.message("Already credited for this episode");
      } else {
        toast.success(`+${BUILDER_TAPE_LISTEN_POINTS} Culture Points`);
      }
      if (res.seriesJustCompleted && !seriesCompleteClaimed) {
        setBadgeOpen(true);
        toast.success("All 5 Builder Tapes complete — bonus Culture Points!");
      }
      onClaimed();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }, [
    completeListen,
    durationSeconds,
    isConnected,
    listenedSeconds,
    onClaimed,
    seriesCompleteClaimed,
    signSiwe,
    tape.slug,
  ]);

  if (alreadyClaimed) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-200",
          className,
        )}
      >
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        Episode credited · +{BUILDER_TAPE_LISTEN_POINTS} Culture Points
      </div>
    );
  }

  if (!thresholdMet) {
    return (
      <p className={cn("text-xs text-zinc-500", className)}>
        Listen to {Math.round(BUILDER_TAPE_LISTEN_THRESHOLD * 100)}% to unlock +
        {BUILDER_TAPE_LISTEN_POINTS} Culture Points.
      </p>
    );
  }

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        <Button
          type="button"
          className="rounded-full bg-[#C5FF41] text-black hover:bg-white"
          disabled={claiming || signing}
          onClick={() => void claim()}
        >
          {claiming || signing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            `Claim +${BUILDER_TAPE_LISTEN_POINTS} Culture Points`
          )}
        </Button>
        {!isConnected ? (
          <span className="text-xs text-zinc-500">Connect wallet to claim</span>
        ) : null}
      </div>
      <BadgeRevealModal
        open={badgeOpen}
        badge={questBadgeById("builder-tapes-keeper") ?? null}
        onClose={() => setBadgeOpen(false)}
      />
    </>
  );
}

export function isTapeListenClaimed(completedSlugs: string[], slug: string): boolean {
  return completedSlugs.includes(builderTapeListenTaskSlug(slug));
}
