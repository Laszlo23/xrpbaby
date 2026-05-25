"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type ImageSlide = { src: string; alt: string };

function unoptimizedForSrc(src: string): boolean {
  return /\.tiff?$/i.test(src);
}

type PropertyImageCarouselProps = {
  slides: ImageSlide[];
  /** First image loads with priority (e.g. LCP) */
  priorityFirst?: boolean;
  /** Tailwind aspect class on outer wrapper */
  aspectClassName?: string;
  /** Image sizes prop for next/image */
  sizes: string;
  /** Extra class on outer wrapper */
  className?: string;
  /** Position for dot row (default top so bottom title overlays stay readable) */
  dotsClassName?: string;
};

export function PropertyImageCarousel({
  slides,
  priorityFirst = false,
  aspectClassName = "aspect-[16/10]",
  sizes,
  className = "",
  dotsClassName = "top-3",
}: PropertyImageCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const slideCount = slides.length;
  const go = useCallback(
    (dir: -1 | 1) => {
      const el = scrollerRef.current;
      if (!el || slideCount === 0) return;
      const next = (index + dir + slideCount) % slideCount;
      const w = el.clientWidth;
      el.scrollTo({ left: next * w, behavior: "smooth" });
      setIndex(next);
    },
    [index, slideCount]
  );

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || slideCount === 0) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const i = Math.round(el.scrollLeft / w);
    setIndex(Math.min(Math.max(i, 0), slideCount - 1));
  }, [slideCount]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  if (slides.length === 0) {
    return (
      <div className={`relative w-full overflow-hidden bg-zinc-900 ${aspectClassName} ${className}`}>
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500">No images</div>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${aspectClassName} ${className}`}>
      <div
        ref={scrollerRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {slides.map((slide, i) => (
          <div key={`${slide.src}-${i}`} className="relative h-full w-full shrink-0 snap-start snap-always">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.02]"
              sizes={sizes}
              priority={priorityFirst && i === 0}
              unoptimized={unoptimizedForSrc(slide.src)}
            />
          </div>
        ))}
      </div>

      {slideCount > 1 && (
        <>
          <div
            className={`pointer-events-none absolute inset-x-0 z-[12] flex justify-center gap-1.5 ${dotsClassName}`}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1} of ${slideCount}`}
                aria-current={i === index ? "true" : undefined}
                className={`pointer-events-auto h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
                onClick={() => {
                  const el = scrollerRef.current;
                  if (!el) return;
                  const w = el.clientWidth;
                  el.scrollTo({ left: i * w, behavior: "smooth" });
                  setIndex(i);
                }}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Previous image"
            className="pointer-events-auto absolute left-1 top-1/2 z-[13] hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-1.5 text-white/90 backdrop-blur-sm transition hover:bg-black/55 sm:flex"
            onClick={() => go(-1)}
          >
            <ChevronIcon dir="left" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            className="pointer-events-auto absolute right-1 top-1/2 z-[13] hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-1.5 text-white/90 backdrop-blur-sm transition hover:bg-black/55 sm:flex"
            onClick={() => go(1)}
          >
            <ChevronIcon dir="right" />
          </button>
        </>
      )}
    </div>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {dir === "left" ? (
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
