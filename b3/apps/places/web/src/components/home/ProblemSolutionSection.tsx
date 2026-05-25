import Link from "next/link";

function IconWall({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function IconDroplet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 2.5c-3 4.5-6 7.8-6 11.5a6 6 0 1012 0c0-3.7-3-7-6-11.5z" strokeLinejoin="round" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M10 13a5 5 0 010-7l1-1a5 5 0 017 7l-1 1M14 11a5 5 0 010 7l-1 1a5 5 0 01-7-7l1-1" strokeLinecap="round" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
    </svg>
  );
}

function IconWave({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 12c2.5-4 5.5-4 8 0s5.5 4 8 0M3 17c2.5-4 5.5-4 8 0s5.5 4 8 0M3 7c2.5-4 5.5-4 8 0s5.5 4 8 0" strokeLinecap="round" />
    </svg>
  );
}

const friction = [
  { text: "High entry barriers", Icon: IconLock },
  { text: "Illiquidity for many assets", Icon: IconDroplet },
  { text: "Centralized ownership and access", Icon: IconWall },
];

const benefits = [
  { text: "Fractional ownership", Icon: IconLink },
  { text: "Global access where offerings permit", Icon: IconGlobe },
  { text: "Liquidity via tokens when pools and compliance allow", Icon: IconWave },
];

export function ProblemSolutionSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-0">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-eco/30 bg-eco/10 text-eco-light">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M12 3c4.5 3 7 7 7 11a7 7 0 11-14 0c0-4 2.5-8 7-11z" strokeLinejoin="round" />
            <path d="M12 11v6M9 14h6" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Why this matters</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">From friction to flow</h2>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-muted">
        Cultural and residential projects need patient capital and aligned communities — not only bank leverage.
        Tokenization can help communities fund places they care about (like a Kickstarter for real estate) — subject to
        law and issuer rules in each jurisdiction.
      </p>

      <div className="relative mt-10 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-black/30 to-black/10 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-action/20 text-action-light">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </span>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-action">Traditional friction</h3>
          </div>
          <ul className="mt-6 space-y-4">
            {friction.map(({ text, Icon }) => (
              <li key={text} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-black/30 text-action/80">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative flex flex-row items-center justify-center gap-2 py-2 lg:flex-col lg:py-0 lg:pt-12"
          aria-hidden
        >
          <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-eco/40 to-transparent lg:block lg:h-24 lg:w-px lg:bg-gradient-to-b" />
          <div className="flex flex-col items-center gap-1 rounded-full border border-eco/30 bg-eco/10 px-4 py-3 text-center shadow-lg shadow-black/30">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-eco-light">Shift</span>
            <svg className="h-6 w-6 text-eco" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-eco/40 to-transparent lg:block lg:h-24 lg:w-px lg:bg-gradient-to-b" />
        </div>

        <div className="rounded-2xl border border-eco/30 bg-gradient-to-br from-eco/15 via-forest/40 to-forest/20 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-eco/25 text-eco-light">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-eco-light">On-chain benefits</h3>
          </div>
          <ul className="mt-6 space-y-4">
            {benefits.map(({ text, Icon }) => (
              <li key={text} className="flex gap-3 text-sm leading-relaxed text-muted">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-eco/25 bg-eco/10 text-eco-light">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-8 text-center text-[10px] text-muted">
        <Link href="/legal/risk" className="underline underline-offset-2 hover:text-canvas">
          Risks &amp; disclosures
        </Link>
        .
      </p>
    </section>
  );
}
