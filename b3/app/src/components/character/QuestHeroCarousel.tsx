"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { CharacterLightbox } from "@/components/character/CharacterLightbox";
import { getCarouselScenes, type CultureCoachScene } from "@/lib/character/culture-coach";
import { cn } from "@/lib/utils";

const ROTATE_MS = 8000;

type Props = {
  className?: string;
};

export function QuestHeroCarousel({ className }: Props) {
  const scenes = getCarouselScenes();
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxScene, setLightboxScene] = useState<CultureCoachScene | null>(null);

  const scene = scenes[index] ?? scenes[0];

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % scenes.length);
  }, [scenes.length]);

  useEffect(() => {
    if (reducedMotion || paused || scenes.length <= 1) return;
    const id = window.setInterval(advance, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [advance, paused, reducedMotion, scenes.length]);

  if (!scene) return null;

  return (
    <>
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border border-[#C5FF41]/20 bg-black/40",
          className,
        )}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        aria-roledescription="carousel"
        aria-label="Culture Coach stories"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-[16/9] w-full sm:aspect-[2/1]"
          >
            <img
              src={scene.heroSrc}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-top opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <p className="mono-label !text-[#C5FF41]">CULTURE COACH</p>
              <h2 className="mt-1 font-display text-lg font-bold text-white sm:text-xl">
                {scene.title}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-zinc-300">{scene.quote}</p>
              <button
                type="button"
                onClick={() => setLightboxScene(scene)}
                className="mt-3 text-xs font-semibold text-[#00E5FF] hover:underline"
              >
                See the full meme →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div
          className="absolute right-4 top-4 flex gap-1.5"
          role="tablist"
          aria-label="Carousel slides"
        >
          {scenes.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}: ${s.title}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 w-2 rounded-full transition",
                i === index ? "bg-[#C5FF41]" : "bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      </section>

      <CharacterLightbox
        scene={lightboxScene}
        open={lightboxScene != null}
        onOpenChange={(open) => {
          if (!open) setLightboxScene(null);
        }}
      />
    </>
  );
}
