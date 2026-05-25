import Link from "next/link";
import { getFoundingInvestorSlotsRemaining } from "@/lib/funding-stats";

const perks = [
  {
    title: "Founding certificate",
    blurb: "On-chain proof of early backing when certificates are enabled — a collectible milestone, not a promise of return.",
    Icon: CertIcon,
    tag: "NFT-ready",
  },
  {
    title: "Priority allocation",
    blurb: "First access to new project windows and follow-on rounds where issuers offer them.",
    Icon: BoltIcon,
    tag: "Early access",
  },
  {
    title: "Friendlier fee tier",
    blurb: "Reduced fee band for founding wallets on supported flows when deployed — issuer-specific.",
    Icon: FeeIcon,
    tag: "Savings",
  },
  {
    title: "Governance weight",
    blurb: "Extra voting multiplier on community polls where the issuer turns it on.",
    Icon: VoteIcon,
    tag: "Voice",
  },
  {
    title: "Insider circle",
    blurb: "Invite-only calls, roadmap previews, and AMAs with project teams.",
    Icon: ChatIcon,
    tag: "Community",
  },
  {
    title: "Space perks",
    blurb: "Guest passes, member hours, and event access at partner venues — spelled out per project.",
    Icon: SpaceIcon,
    tag: "Real world",
  },
] as const;

function CertIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 3l7 4v6c0 5-3.5 8.5-7 9.5-3.5-1-7-4.5-7-9.5V7l7-4z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" strokeLinejoin="round" />
    </svg>
  );
}

function FeeIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" />
    </svg>
  );
}

function VoteIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8.5z" strokeLinejoin="round" />
    </svg>
  );
}

function SpaceIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9v12M15 9v12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const storySteps = [
  { label: "Back early", sub: "Align with the first cultural real estate rounds" },
  { label: "Unlock perks", sub: "Certificates, access, and community tiers" },
  { label: "Shape places", sub: "Vote and show up where issuers enable it" },
];

export function FoundingInvestorsSection() {
  const { remaining, total } = getFoundingInvestorSlotsRemaining();
  const filled = total - remaining;
  const fillRatio = Math.min(1, filled / total);

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-eco/25 bg-gradient-to-br from-forest/80 via-forest/50 to-black/40 p-6 shadow-2xl shadow-black/40 sm:p-10"
      aria-labelledby="founding-heading"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-action/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-eco/20 blur-3xl"
        aria-hidden
      />

      <div className="relative grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Community investor model</p>
          <h2 id="founding-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Founding investors get <span className="text-gradient-gold">more than a ticket</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            A limited window for people who want skin in the game on community-owned cultural spaces. Everything below is
            reference UI — final perks depend on each issuer and jurisdiction.
          </p>

          <ol className="relative mt-8 space-y-0 border-l border-eco/30 pl-6">
            {storySteps.map((step, i) => (
              <li key={step.label} className="relative pb-8 last:pb-0">
                <span
                  className="absolute -left-[25px] top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-eco/50 bg-forest text-[10px] font-bold text-eco-light"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <p className="text-sm font-semibold text-canvas">{step.label}</p>
                <p className="mt-1 text-xs text-muted">{step.sub}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/invest"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-action px-6 py-2.5 text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-action/25 transition hover:bg-action-light"
            >
              Explore founding terms
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-canvas transition hover:border-eco/40 hover:bg-eco/10"
            >
              See the journey
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="grid gap-4 sm:grid-cols-2">
            {perks.map((p) => (
              <div
                key={p.title}
                className="group relative rounded-xl border border-white/[0.08] bg-black/25 p-4 transition hover:border-eco/35 hover:bg-eco/[0.06]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-eco/25 bg-eco/10 text-eco-light transition group-hover:border-action/30 group-hover:text-action-light">
                    <p.Icon />
                  </div>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
                    {p.tag}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-canvas">{p.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{p.blurb}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-eco/25 bg-black/30 p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Remaining founding slots</p>
                <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-eco-light sm:text-4xl">{remaining}</p>
                <p className="mt-1 text-xs text-muted">
                  of {total} reference slots — not enforced on-chain; verify any live offering docs.
                </p>
              </div>
              <div className="w-full min-w-[140px] max-w-[220px] flex-1">
                <div className="flex justify-between text-[10px] text-muted">
                  <span>Filled</span>
                  <span className="font-mono tabular-nums">{filled}</span>
                </div>
                <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-eco via-emerald-400/90 to-action"
                    style={{ width: `${Math.round(fillRatio * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-muted">
            Minimums and perks vary by project — issuer disclosures and Legal before you commit.
          </p>
        </div>
      </div>
    </section>
  );
}
