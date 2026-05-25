import { useEffect, useMemo, useState } from "react";

export function IdentityParticles({ count = 40 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 15,
        lime: Math.random() > 0.75,
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
            background: p.lime ? "#C5FF41" : "#00E5FF",
            boxShadow: p.lime ? "0 0 8px #C5FF4180" : "0 0 8px #00E5FF80",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
