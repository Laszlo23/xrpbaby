"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CultureCoachScene } from "@/lib/character/culture-coach";

type Props = {
  scene: CultureCoachScene | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CharacterLightbox({ scene, open, onOpenChange }: Props) {
  if (!scene) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-[#0a0a0a] p-0">
        <DialogHeader className="space-y-2 px-6 pt-6">
          <DialogTitle className="font-display text-xl text-white">{scene.title}</DialogTitle>
          <DialogDescription className="text-zinc-400">{scene.quote}</DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-6">
          <img
            src={scene.heroSrc}
            alt={scene.alt}
            width={1280}
            height={720}
            className="w-full rounded-xl border border-white/10"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
