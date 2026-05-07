import { useEffect, useRef } from "react";

/**
 * Subtle vertical parallax for decorative layers inside a `<section>`.
 * Respects `prefers-reduced-motion`.
 */
export function useParallaxLayer(strength = 0.38) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;
    const section = layer.closest("section");
    if (!section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    const update = () => {
      if (reduce.matches) {
        layer.style.transform = "";
        return;
      }
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const centerOffset = rect.top + rect.height / 2 - vh / 2;
      const y = -(centerOffset * strength * 0.11);
      layer.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    reduce.addEventListener("change", update);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", update);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return ref;
}
