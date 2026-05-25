import { useEffect, useMemo, useState } from "react";

export function Particles({ count = 40 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 15,
        gold: Math.random() > 0.8,
      })),
    [count],
  );

  if (!mounted) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className="animate-float-up absolute bottom-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.gold ? "oklch(0.82 0.13 75)" : "oklch(0.7 0.19 250)",
            boxShadow: p.gold
              ? "0 0 8px oklch(0.82 0.13 75 / 0.8)"
              : "0 0 8px oklch(0.7 0.19 250 / 0.8)",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Streaks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-streak absolute h-px w-32"
          style={{
            top: `${20 + i * 25}%`,
            background:
              "linear-gradient(90deg, transparent, oklch(0.75 0.18 250 / 0.9), transparent)",
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
