import { useEffect, useRef, useState } from "react";

import { landingProofDisplay, type LandingProofDisplay } from "@/lib/landing-proof-display";
import type { ProofSignalKey } from "@/lib/proof-signals";
import type { PublicProofStats } from "@/server/public/proof";

type LandingProofCountUpProps = {
  signalKey: ProofSignalKey;
  proof: PublicProofStats | undefined;
  loading: boolean;
  className?: string;
  durationMs?: number;
};

function formatCount(display: LandingProofDisplay, current: number): string {
  const shown = display.loading ? "…" : `${current.toLocaleString("en-US")}${display.suffix}`;
  return shown;
}

export function LandingProofCountUp({
  signalKey,
  proof,
  loading,
  className = "",
  durationMs = 1400,
}: LandingProofCountUpProps) {
  const display = landingProofDisplay(signalKey, proof, loading);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || display.loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [display.loading]);

  useEffect(() => {
    if (!started || display.loading) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setCurrent(display.value);
      return;
    }

    const target = display.value;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setCurrent(Math.round(target * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, display.loading, display.value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {formatCount(display, current)}
    </span>
  );
}
