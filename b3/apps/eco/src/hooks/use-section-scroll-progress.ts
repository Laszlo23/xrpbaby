import { useEffect, useRef, useState } from "react";

/**
 * Scroll progress through a section: 0 at entry, advances as the user scrolls.
 * Tweak `focus` to align "full progress" with when the section leaves the viewport.
 */
export function useSectionScrollProgress<T extends HTMLElement>(options?: { focus?: number }) {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);
  const focus = options?.focus ?? 0.55;

  useEffect(() => {
    const compute = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.45;
      const raw = (vh * focus - rect.top) / total;
      setProgress(Math.max(0, Math.min(1, raw)));
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [focus]);

  return { ref, progress };
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
