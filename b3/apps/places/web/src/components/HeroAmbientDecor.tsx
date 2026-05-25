"use client";

import { useEffect, useState } from "react";

/**
 * Abstract grid, network nodes, land parcels, and flowing eco lines — hero-only decor.
 * Disabled when prefers-reduced-motion.
 */
export function HeroAmbientDecor() {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reduceMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(63,143,107,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(63,143,107,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.35]" aria-hidden>
      {/* Moving grid */}
      <div
        className="hero-decor-grid absolute inset-[-50%] motion-reduce:animate-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(63,143,107,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(63,143,107,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />
      {/* Abstract parcels (land plots) */}
      <svg className="absolute left-[8%] top-[20%] h-32 w-40 text-eco/25 sm:h-40 sm:w-52" viewBox="0 0 200 120">
        <rect x="4" y="4" width="88" height="52" rx="4" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="100" y="24" width="72" height="44" rx="3" fill="rgba(63,143,107,0.08)" stroke="currentColor" strokeWidth="0.75" />
        <rect x="52" y="68" width="64" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="0.75" />
      </svg>
      <svg className="absolute bottom-[28%] right-[8%] h-28 w-36 text-eco/20 sm:h-36 sm:w-44" viewBox="0 0 160 100">
        <rect x="8" y="12" width="60" height="36" rx="2" fill="rgba(63,143,107,0.06)" stroke="currentColor" strokeWidth="0.75" />
        <rect x="78" y="8" width="70" height="48" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      {/* Network nodes */}
      <svg className="absolute left-1/2 top-[35%] h-48 w-64 -translate-x-1/2 text-eco/30 sm:w-96" viewBox="0 0 400 200">
        <circle cx="80" cy="100" r="4" fill="currentColor" className="animate-pulse-soft" />
        <circle cx="200" cy="60" r="3" fill="currentColor" className="animate-pulse-soft" style={{ animationDelay: "0.5s" }} />
        <circle cx="320" cy="120" r="4" fill="currentColor" className="animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <circle cx="260" cy="160" r="3" fill="currentColor" className="animate-pulse-soft" style={{ animationDelay: "0.3s" }} />
        <path
          d="M84 100 Q140 80 196 60 M204 60 Q250 90 316 120 M320 120 Q290 150 264 160"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.5"
        />
      </svg>
      {/* Flowing energy lines */}
      <svg className="absolute inset-0 h-full w-full text-eco/25" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="heroEnergy" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3F8F6B" stopOpacity="0" />
            <stop offset="50%" stopColor="#3F8F6B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF7A18" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0 120 C 200 80 400 200 600 100 S 1000 180 1200 60"
          fill="none"
          stroke="url(#heroEnergy)"
          strokeWidth="2"
          className="hero-energy-path motion-reduce:animate-none"
        />
        <path
          d="M0 400 C 300 450 500 320 800 380 S 1100 420 1200 360"
          fill="none"
          stroke="url(#heroEnergy)"
          strokeWidth="1.5"
          opacity="0.6"
          className="hero-energy-path motion-reduce:animate-none"
          style={{ animationDelay: "1.5s" }}
        />
      </svg>
    </div>
  );
}
