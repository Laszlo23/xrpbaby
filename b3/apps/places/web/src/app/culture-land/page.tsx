import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BLOCKCHAIN_HOMEPAGE_LINES,
  BUILDING_CULTURE_CITY_PIPELINE,
  BUILDING_CULTURE_LAND_PHILOSOPHY,
  CULTURE_LAND_CHAIN_MANIFESTO,
  CULTURE_LAND_PROJECTS,
  HOLZBAUER_REFERENCE_URL,
  pipelineNavLabel,
} from "@/lib/culture-land-portfolio";
import { PipelineProjectsSection } from "@/components/culture-land/PipelineProjectsSection";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Building Culture Land — Portfolio",
  description:
    "Partner portfolio: acquisition pipeline (Vienna, Carinthia / GREEN & LAKE, and other tracks), revitalised villages, lakefront living, and landmarks — reference economics and sustainability notes; Legal hub for terms.",
};

export default function CultureLandPage() {
  return (
    <div className="relative -mx-4 -mt-8 overflow-hidden px-4 pt-8 pb-20">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.12), transparent 50%), radial-gradient(ellipse 60% 40% at 100% 40%, rgba(212, 175, 55, 0.06), transparent 45%)",
        }}
      />

      {/* Hero — blockchain homepage lines + partner ask for “elegant” feel */}
      <header className="mx-auto max-w-3xl space-y-8 pb-16 pt-6 text-center sm:pt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-eco-light/90">
          {BLOCKCHAIN_HOMEPAGE_LINES.kicker}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-[2.75rem] md:leading-tight">
          {BLOCKCHAIN_HOMEPAGE_LINES.headline}
        </h1>
        <div className="mx-auto max-w-xl space-y-3 text-base leading-relaxed text-zinc-400 sm:text-lg">
          {BLOCKCHAIN_HOMEPAGE_LINES.sublines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="mx-auto max-w-2xl space-y-3 text-sm leading-relaxed text-zinc-500">
          <p>
            This page gathers partner and investor materials in English. Figures are reference unless stated otherwise in
            your offering documents. On-chain listings default to Base when configured — reconcile with explorer data and
            issuer filings before any commitment.
          </p>
          {CULTURE_LAND_CHAIN_MANIFESTO.map((line) => (
            <p key={line} className="text-zinc-400">
              {line}
            </p>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <ButtonLink href="/properties">Explore on-chain listings</ButtonLink>
          <ButtonLink href="/invest" variant="secondary">
            Investor hub
          </ButtonLink>
        </div>
      </header>

      {/* Reference architecture — external link only (no hotlinked third-party images) */}
      <section className="mx-auto mb-16 max-w-3xl rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5 backdrop-blur-sm">
        <h2 className="text-sm font-medium text-zinc-300">Weinviertel reference (external)</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Where project photography is not yet published here, partners pointed to a reference house in Lower Austria for
          architectural character. We link out rather than embed third-party images.
        </p>
        <a
          href={HOLZBAUER_REFERENCE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm font-medium text-gold-400 underline-offset-2 hover:underline"
        >
          holzbauer-partner.at — Haus im Weinviertel →
        </a>
      </section>

      {/* Philosophy */}
      <section className="mx-auto mb-20 max-w-3xl space-y-6">
        <h2 className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-muted">
          Building Culture Land
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
          {BUILDING_CULTURE_LAND_PHILOSOPHY.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </section>

      <PipelineProjectsSection projects={BUILDING_CULTURE_CITY_PIPELINE} />

      {/* Jump nav */}
      <nav
        aria-label="Projects on this page"
        className="mx-auto mb-12 max-w-4xl rounded-2xl border border-eco/15 bg-eco/[0.06] px-4 py-4"
      >
        <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wider text-eco-light/80">
          Jump to project
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          <li>
            <a
              href="#bcc-pipeline-heading"
              className="inline-block rounded-full border border-action/35 bg-action/10 px-3 py-1.5 text-xs font-medium text-action-light transition hover:border-action/50 hover:bg-action/15"
            >
              Acquisition pipeline
            </a>
          </li>
          {BUILDING_CULTURE_CITY_PIPELINE.map((p) => (
            <li key={`pipe-${p.id}`}>
              <a
                href={`#${p.id}`}
                className="inline-block rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-eco/40 hover:text-white"
              >
                {pipelineNavLabel(p)}
              </a>
            </li>
          ))}
          {CULTURE_LAND_PROJECTS.map((p) => (
            <li key={p.id}>
              <a
                href={`#${p.id}`}
                className="inline-block rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-eco/40 hover:text-white"
              >
                {p.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Projects */}
      <div className="mx-auto max-w-4xl space-y-24">
        {CULTURE_LAND_PROJECTS.map((p, i) => (
          <article
            key={p.id}
            id={p.id}
            className="scroll-mt-28 rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-6 shadow-2xl shadow-black/20 sm:p-8"
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
              <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 sm:aspect-[4/3] lg:aspect-auto lg:min-h-[340px]">
                <Image
                  src={p.imageSrc}
                  alt={p.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, min(480px, 45vw)"
                  priority={i === 0}
                />
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-500/90">{p.region}</p>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{p.title}</h2>
                <p className="text-sm font-medium text-eco-light/95">{p.tagline}</p>
                <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
                  {p.narrative.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
                {p.partnerNote && (
                  <p className="rounded-lg border border-amber-500/20 bg-amber-950/20 px-3 py-2 text-xs leading-relaxed text-amber-100/85">
                    {p.partnerNote}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-8 border-t border-white/[0.06] pt-8 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Fact sheet</h3>
                <dl className="mt-3 space-y-2">
                  {p.factSheet.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-white/[0.04] py-2 text-sm last:border-0"
                    >
                      <dt className="text-zinc-500">{row.label}</dt>
                      <dd className="text-right font-medium text-zinc-200">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Green print</h3>
                <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-zinc-400">
                  {p.greenPrint.map((g) => (
                    <li key={g} className="marker:text-eco/70">
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {p.exploreHref && (
              <div className="mt-6 flex justify-end">
                <Link
                  href={p.exploreHref}
                  className="text-sm font-medium text-gold-400 underline-offset-2 hover:underline"
                >
                  Open related on-chain listing →
                </Link>
              </div>
            )}
          </article>
        ))}
      </div>

      <footer className="mx-auto mt-20 max-w-2xl space-y-4 border-t border-white/[0.06] pt-12 text-center">
        <p className="text-xs leading-relaxed text-zinc-500">
          Partner materials for discussion — sustainability and financial claims follow issuer verification and local
          disclosure rules. See{" "}
          <Link href="/legal/offerings" className="text-zinc-400 hover:text-white">
            Legal / offerings
          </Link>
          .
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/mission" className="text-zinc-400 hover:text-white">
            Mission
          </Link>
          <Link href="/legal/risk" className="text-zinc-400 hover:text-white">
            Risks
          </Link>
          <Link href="/" className="text-zinc-400 hover:text-white">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
