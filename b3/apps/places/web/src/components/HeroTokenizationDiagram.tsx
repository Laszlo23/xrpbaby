"use client";

/**
 * Lightweight SVG + CSS animation — property → fractional tokens → chain.
 * Respects prefers-reduced-motion via globals + animate-none utility.
 */
export function HeroTokenizationDiagram() {
  return (
    <div className="relative mx-auto mt-10 max-w-lg select-none" aria-hidden>
      <svg viewBox="0 0 400 200" className="h-auto w-full text-eco/90">
        <defs>
          <linearGradient id="heroEco" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3F8F6B" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#FF7A18" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        {/* Building */}
        <g className="animate-float motion-reduce:animate-none">
          <rect x="48" y="72" width="72" height="96" rx="4" fill="rgba(255,255,255,0.06)" stroke="currentColor" strokeWidth="1.2" />
          <rect x="58" y="88" width="14" height="14" rx="1" fill="rgba(63,143,107,0.45)" />
          <rect x="78" y="88" width="14" height="14" rx="1" fill="rgba(63,143,107,0.25)" />
          <rect x="98" y="88" width="14" height="14" rx="1" fill="rgba(63,143,107,0.45)" />
          <rect x="58" y="108" width="14" height="14" rx="1" fill="rgba(63,143,107,0.25)" />
          <rect x="78" y="108" width="14" height="14" rx="1" fill="rgba(63,143,107,0.55)" />
          <rect x="98" y="108" width="14" height="14" rx="1" fill="rgba(63,143,107,0.25)" />
        </g>
        {/* Flow lines */}
        <path
          d="M 130 120 C 180 120 200 100 240 100"
          fill="none"
          stroke="url(#heroEco)"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="animate-pulse-soft motion-reduce:animate-none"
        />
        <path
          d="M 130 130 C 190 130 210 140 248 148"
          fill="none"
          stroke="url(#heroEco)"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeDasharray="4 6"
        />
        {/* Token circles */}
        <g className="animate-float motion-reduce:animate-none" style={{ animationDelay: "0.5s" }}>
          <circle cx="260" cy="88" r="22" fill="rgba(63,143,107,0.15)" stroke="currentColor" strokeWidth="1.2" />
          <text
            x="260"
            y="95"
            textAnchor="middle"
            fill="currentColor"
            fontSize="11"
            fontFamily="var(--font-geist-mono), monospace"
            fontWeight="600"
          >
            RWA
          </text>
        </g>
        <g className="animate-float motion-reduce:animate-none" style={{ animationDelay: "1s" }}>
          <circle cx="300" cy="132" r="18" fill="rgba(255,122,24,0.12)" stroke="currentColor" strokeWidth="1" />
          <text
            x="300"
            y="136"
            textAnchor="middle"
            fill="currentColor"
            fontSize="10"
            fontFamily="var(--font-geist-mono), monospace"
          >
            %
          </text>
        </g>
        {/* Chain block */}
        <g className="animate-pulse-soft motion-reduce:animate-none">
          <rect x="318" y="72" width="56" height="56" rx="8" fill="rgba(255,255,255,0.04)" stroke="currentColor" strokeWidth="1.2" />
          <path d="M332 92 h28 M332 100 h20 M332 108 h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </g>
      </svg>
      <p className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-muted">
        Schematic — not a live data feed
      </p>
    </div>
  );
}
