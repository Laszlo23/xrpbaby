import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CULTURE_PACKS, formatPackUsd } from "@/lib/packs";
import { dismissPostJoinPack, isPostJoinPackDismissed } from "@/lib/member-onboarding";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

const STARTER = CULTURE_PACKS.find((p) => p.slug === "pack_07");
const CULTURE = CULTURE_PACKS.find((p) => p.slug === "pack_7");

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PostJoinPackPrompt({ open, onOpenChange }: Props) {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open && !isPostJoinPackDismissed());
  }, [open]);

  function close() {
    dismissPostJoinPack();
    setVisible(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={visible} onOpenChange={(next) => (next ? setVisible(true) : close())}>
      <DialogContent className="glass max-w-md border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Support {BRAND_DISPLAY_NAME}</DialogTitle>
          <DialogDescription className="text-left text-sm text-zinc-400">
            Culture Packs are optional loyalty credits — non-refundable, not securities. They fund
            ops while you earn points for quests and future BCC perks when liquidity allows.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-3">
          {STARTER ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="font-medium text-white">{STARTER.label}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {formatPackUsd(STARTER.usd)} · {STARTER.culturePoints} Culture Points
              </p>
              <Button
                asChild
                size="sm"
                className="mt-3 w-full rounded-full bg-[#C5FF41] text-black"
              >
                <Link to="/wallet/packs" search={{ pack: STARTER.slug }} onClick={close}>
                  Buy starter pack
                </Link>
              </Button>
            </div>
          ) : null}
          {CULTURE ? (
            <div className="rounded-2xl border border-[#C5FF41]/25 bg-[#C5FF41]/5 p-4">
              <p className="font-medium text-white">{CULTURE.label}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {formatPackUsd(CULTURE.usd)} · {CULTURE.culturePoints} pts (+ bonus)
              </p>
              <Button asChild size="sm" variant="secondary" className="mt-3 w-full rounded-full">
                <Link to="/wallet/packs" search={{ pack: CULTURE.slug }} onClick={close}>
                  Buy culture pack
                </Link>
              </Button>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="mt-2 flex w-full items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
          onClick={close}
        >
          <X className="h-4 w-4" aria-hidden />
          Maybe later — continue exploring
        </button>
      </DialogContent>
    </Dialog>
  );
}
