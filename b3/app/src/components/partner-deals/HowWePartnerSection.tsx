import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  FileJson,
  Gavel,
  Lock,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  PARTNER_ESCROW_HEADLINE,
  PARTNER_ESCROW_SUBHEAD,
  PARTNER_EXAMPLE_KPI,
  PARTNER_FLOW_STEPS,
  PARTNER_PRINCIPLES,
} from "@/content/partner-escrow-story";
import { serviceDealEscrowConfigured } from "@/lib/partner-deals-config";

const CARD =
  "rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-white/[0.14]";

type HowWePartnerSectionProps = {
  /** Full page shows hero + example table; compact fits inside /investors */
  variant?: "full" | "compact";
};

export function HowWePartnerSection({ variant = "full" }: HowWePartnerSectionProps) {
  const escrowLive = serviceDealEscrowConfigured();
  const isCompact = variant === "compact";

  return (
    <section
      id="how-we-partner"
      className="scroll-mt-24 space-y-8 md:space-y-10"
      data-testid="how-we-partner-section"
    >
      <div className="relative overflow-hidden rounded-3xl border border-[rgb(212_175_55/0.2)] bg-gradient-to-br from-[rgb(212_175_55/0.08)] via-black/40 to-[rgb(0_82_255/0.08)] p-6 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--vault-gold)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[var(--base-blue)]/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--vault-gold)]">
              Partner rails · USDC · Base
            </p>
            <h2
              className={
                isCompact
                  ? "font-heading text-xl font-semibold text-white md:text-2xl"
                  : "font-heading text-2xl font-semibold tracking-tight text-white md:text-4xl"
              }
            >
              {PARTNER_ESCROW_HEADLINE}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
              {PARTNER_ESCROW_SUBHEAD}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <StatusPill icon={Lock} label="USDC escrow" />
              <StatusPill icon={FileJson} label="Hashed terms" />
              <StatusPill icon={Bot} label="AI ruling" />
              <StatusPill icon={Gavel} label="Council veto" />
              {escrowLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Live on Base
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[11px] text-zinc-500">
                  Configure escrow address to go live
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/how-we-partner"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-5 py-2.5 text-sm font-medium text-white transition hover:border-[rgb(212_175_55/0.4)]"
            >
              Full story
              <ArrowRight className="h-4 w-4 opacity-70" aria-hidden />
            </Link>
            {escrowLive ? (
              <>
                <Link
                  to="/dao/partner-deals/new"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--base-blue)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_32px_-8px_rgb(0_82_255/80%)] transition hover:opacity-90"
                >
                  Create deal
                </Link>
                <Link
                  to="/partner/deals"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 transition hover:text-white"
                >
                  Provider inbox
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PARTNER_FLOW_STEPS.map((step) => (
          <article key={step.id} className={`${CARD} flex flex-col gap-3`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {step.tag}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgb(212_175_55/0.25)] bg-[rgb(212_175_55/0.08)] font-mono text-xs text-[var(--vault-gold)]">
                {step.step}
              </span>
            </div>
            <h3 className="font-heading text-base font-semibold text-white">{step.title}</h3>
            <p className="text-sm leading-relaxed text-zinc-500">{step.body}</p>
          </article>
        ))}
      </div>

      {!isCompact ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {PARTNER_PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="flex gap-3 rounded-2xl border border-white/[0.06] bg-black/30 p-5"
              >
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--vault-gold)]"
                  aria-hidden
                />
                <div>
                  <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <ExampleDealPanel />
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.06] bg-black/30 px-5 py-4 text-sm text-zinc-400">
          <Scale className="h-5 w-5 text-[var(--vault-gold)]" aria-hidden />
          <p className="flex-1">
            Marketing, Telegram channels, creator promos — same rails.{" "}
            <Link to="/how-we-partner" className="text-white underline underline-offset-4">
              See the full partner flow
            </Link>
            .
          </p>
        </div>
      )}
    </section>
  );
}

function StatusPill({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-zinc-300">
      <Icon className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
      {label}
    </span>
  );
}

function ExampleDealPanel() {
  const ex = PARTNER_EXAMPLE_KPI;
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent">
      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Sparkles className="h-5 w-5 text-[var(--vault-gold)]" aria-hidden />
          <h3 className="font-heading text-lg font-semibold text-white">{ex.title}</h3>
          <span className="rounded-full border border-[rgb(212_175_55/0.3)] bg-[rgb(212_175_55/0.08)] px-3 py-0.5 font-mono text-xs text-[var(--vault-gold)]">
            {ex.amount} locked
          </span>
        </div>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Deliverables
          </p>
          <ul className="space-y-2">
            {ex.deliverables.map((d) => (
              <li
                key={d.label}
                className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 text-sm"
              >
                <span className="text-zinc-200">{d.label}</span>
                <span className="shrink-0 text-right text-xs text-zinc-500">
                  {d.weight}
                  <br />
                  <span className="text-zinc-400">{d.kpi}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Settlement outcomes
          </p>
          <ul className="space-y-2">
            {ex.outcomes.map((o) => (
              <li
                key={o.label}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 text-sm"
              >
                <span className="text-zinc-300">{o.label}</span>
                <span className="text-xs font-medium text-emerald-300/90">{o.payout}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] bg-black/20 px-6 py-4">
        <Users className="h-4 w-4 text-zinc-500" aria-hidden />
        <p className="text-xs text-zinc-500">
          Canonical JSON schema and deploy notes ship with the protocol repo under{" "}
          <code className="text-zinc-400">docs/protocol/SERVICE_DEAL_SCHEMA.md</code>
        </p>
      </div>
    </div>
  );
}
